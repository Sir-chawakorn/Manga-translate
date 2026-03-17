from __future__ import annotations

import base64
import io
import os
from pathlib import Path

from dotenv import load_dotenv
from google import genai
from google.genai import types
from PIL import Image

from .models import PageAnalysis, RegionPayload, TranslateResponse


PROJECT_ROOT = Path(__file__).resolve().parents[2]
load_dotenv(PROJECT_ROOT / ".env")
load_dotenv(PROJECT_ROOT / "backend" / ".env")

DEFAULT_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash-image")

ANALYSIS_PROMPT = """
You are building an editable Thai translation layout for a manga page.

Task:
1. Detect every text area that should be translated into Thai.
2. Return regions in natural reading order.
3. Use normalized coordinates on a 1000x1000 grid.
4. Translate into concise, natural Thai that fits manga speech bubbles.

Rules:
- Include dialogue, narration, captions, signs, and meaningful sound effects.
- Ignore page numbers and publisher watermarks unless they matter to the story.
- Keep each region tight around the original text area.
- x and y are the top-left corner. width and height must stay within the 1000x1000 grid.
- alignment must be left, center, or right.
- text_color should usually be #111111 unless the art clearly needs another color.
- background_color should usually be rgba(255,255,255,0.92) for speech bubbles or a close match to the original box fill.
- font_size should be a realistic pixel size for the original page, usually between 18 and 72.
- notes should be short and practical, for example: "small caption at top" or "bold SFX near character".
- The translated text should be horizontal Thai text.
"""

CLEAN_PROMPT = """
Remove all visible original text from this manga page while preserving the artwork, tones, panel borders,
speech bubbles, and composition. Do not add any new text. Leave the speech balloons and caption boxes clean
and blank so translated Thai text can be overlaid later.
"""


def _make_client(api_key: str | None) -> genai.Client:
    resolved_key = (api_key or os.getenv("GEMINI_API_KEY") or "").strip()
    if not resolved_key:
        raise ValueError("Missing Gemini API key. Add it in the app or set GEMINI_API_KEY in backend/.env.")
    return genai.Client(api_key=resolved_key)


def _prepare_image(image_bytes: bytes) -> Image.Image:
    image = Image.open(io.BytesIO(image_bytes))
    image.load()
    if image.mode not in ("RGB", "RGBA"):
        image = image.convert("RGB")
    return image


def _make_analysis_image(image: Image.Image) -> Image.Image:
    copy = image.copy()
    copy.thumbnail((1800, 1800))
    return copy


def _extract_inline_image_base64(response: object) -> str | None:
    parts = getattr(response, "parts", None)
    if parts is None:
        candidates = getattr(response, "candidates", None) or []
        if candidates:
            parts = getattr(candidates[0].content, "parts", None)
    for part in parts or []:
        inline_data = getattr(part, "inline_data", None)
        if inline_data is None:
            continue
        data = getattr(inline_data, "data", None)
        if not data:
            continue
        if isinstance(data, str):
            try:
                raw = base64.b64decode(data)
            except Exception:
                raw = data.encode("utf-8")
        else:
            raw = data
        return base64.b64encode(raw).decode("utf-8")
    return None


def _normalize_alignment(value: str) -> str:
    normalized = (value or "").strip().lower()
    if normalized not in {"left", "center", "right"}:
        return "center"
    return normalized


def _normalize_color(value: str, fallback: str) -> str:
    normalized = (value or "").strip()
    if not normalized or normalized.lower() == "transparent":
        return fallback
    return normalized


def _normalize_regions(regions: list[object]) -> list[RegionPayload]:
    normalized: list[RegionPayload] = []
    for index, region in enumerate(regions, start=1):
        x = max(0.0, min(1000.0, float(getattr(region, "x", 0.0))))
        y = max(0.0, min(1000.0, float(getattr(region, "y", 0.0))))
        width = max(10.0, min(1000.0 - x, float(getattr(region, "width", 120.0))))
        height = max(10.0, min(1000.0 - y, float(getattr(region, "height", 80.0))))
        normalized.append(
            RegionPayload(
                id=(getattr(region, "id", "") or f"region_{index}").strip(),
                kind=(getattr(region, "kind", "") or "dialogue").strip().lower(),
                source_text=(getattr(region, "source_text", "") or "").strip(),
                translated_text=(getattr(region, "translated_text", "") or "").strip(),
                x=round(x, 2),
                y=round(y, 2),
                width=round(width, 2),
                height=round(height, 2),
                font_size=max(14, min(96, int(getattr(region, "font_size", 28) or 28))),
                alignment=_normalize_alignment(getattr(region, "alignment", "center")),
                text_color=_normalize_color(getattr(region, "text_color", "#111111"), "#111111"),
                background_color=_normalize_color(
                    getattr(region, "background_color", "rgba(255,255,255,0.92)"),
                    "rgba(255,255,255,0.92)",
                ),
                notes=(getattr(region, "notes", "") or "").strip(),
            )
        )
    return normalized


def _run_analysis(
    client: genai.Client,
    model_name: str,
    analysis_image: Image.Image,
) -> tuple[PageAnalysis, str, list[str]]:
    warnings: list[str] = []

    try:
        analysis_response = client.models.generate_content(
            model=model_name,
            contents=[ANALYSIS_PROMPT, analysis_image],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=PageAnalysis,
            ),
        )
        analysis = analysis_response.parsed
        if analysis is None:
            analysis = PageAnalysis.model_validate_json(analysis_response.text)
        return analysis, model_name, warnings
    except Exception as exc:
        if model_name != "gemini-2.5-flash-image":
            raise

        fallback_model = "gemini-2.5-flash"
        fallback_response = client.models.generate_content(
            model=fallback_model,
            contents=[ANALYSIS_PROMPT, analysis_image],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=PageAnalysis,
            ),
        )
        fallback_analysis = fallback_response.parsed
        if fallback_analysis is None:
            fallback_analysis = PageAnalysis.model_validate_json(fallback_response.text)
        warnings.append(
            "Structured region detection fell back to gemini-2.5-flash because "
            f"gemini-2.5-flash-image returned an error: {exc}"
        )
        return fallback_analysis, fallback_model, warnings


def translate_page(image_bytes: bytes, api_key: str | None = None, model: str | None = None) -> TranslateResponse:
    client = _make_client(api_key)
    resolved_model = (model or DEFAULT_MODEL).strip() or DEFAULT_MODEL
    image = _prepare_image(image_bytes)
    analysis_image = _make_analysis_image(image)
    analysis, analysis_model, warnings = _run_analysis(client, resolved_model, analysis_image)
    cleaned_image_base64: str | None = None

    try:
        clean_response = client.models.generate_content(
            model=resolved_model,
            contents=[CLEAN_PROMPT, analysis_image],
        )
        cleaned_image_base64 = _extract_inline_image_base64(clean_response)
        if not cleaned_image_base64:
            warnings.append("Gemini returned no clean background preview. The app will use the original page instead.")
    except Exception as exc:
        warnings.append(f"AI clean background preview failed: {exc}")

    return TranslateResponse(
        model_used=analysis_model if analysis_model == resolved_model else f"{analysis_model} (analysis), {resolved_model} (clean)",
        image_width=image.width,
        image_height=image.height,
        detected_language=analysis.detected_language,
        page_notes=analysis.page_notes,
        regions=_normalize_regions(analysis.regions),
        cleaned_image_base64=cleaned_image_base64,
        warnings=warnings,
    )
