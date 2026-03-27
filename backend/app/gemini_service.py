from __future__ import annotations

import base64
import concurrent.futures
import hashlib
import io
import json
import os
import queue
import re
import time
from pathlib import Path

from dotenv import load_dotenv
from google import genai
from google.genai import types
from PIL import Image, ImageColor, ImageDraw

from .models import (
    CleanSuggestResponse,
    GeminiOcrAnalysis,
    OcrPageResponse,
    OcrTextBlock,
    PageAnalysis,
    RegionPayload,
    TranslateResponse,
)
from .rag_store import (
    build_document_key,
    get_cached_ocr_page,
    get_relevant_context_corpus,
    get_nearby_ocr_pages,
    get_relevant_glossary_terms,
    get_relevant_translation_memory,
    upsert_glossary_terms,
    upsert_ocr_page,
    upsert_translation_memory,
)


PROJECT_ROOT = Path(__file__).resolve().parents[2]
load_dotenv(PROJECT_ROOT / ".env")
load_dotenv(PROJECT_ROOT / "backend" / ".env")

DEFAULT_MODEL = os.getenv("GEMINI_MODEL", "gemini-3-pro-image-preview")
SUGGESTION_MODEL = os.getenv("GEMINI_SUGGEST_MODEL", "gemini-2.5-flash")
OCR_MODEL = os.getenv("GEMINI_OCR_MODEL", "gemini-2.5-flash")
GEMINI_STRUCTURED_FALLBACK_MODEL = str(os.getenv("GEMINI_STRUCTURED_FALLBACK_MODEL", "gemini-2.5-flash") or "").strip()
GEMINI_IMAGE_FALLBACK_MODEL = str(os.getenv("GEMINI_IMAGE_FALLBACK_MODEL", "gemini-3-pro-image-preview") or "").strip()
GEMINI_RETRY_ATTEMPTS = max(1, int(os.getenv("GEMINI_RETRY_ATTEMPTS", "3") or "3"))
GEMINI_RETRY_BASE_DELAY_SECONDS = max(0.0, float(os.getenv("GEMINI_RETRY_BASE_DELAY_SECONDS", "1.25") or "1.25"))
GEMINI_RETRY_MAX_DELAY_SECONDS = max(
    GEMINI_RETRY_BASE_DELAY_SECONDS,
    float(os.getenv("GEMINI_RETRY_MAX_DELAY_SECONDS", "8.0") or "8.0"),
)

_GEMINI_RETRYABLE_MARKERS = (
    "503",
    "500",
    "429",
    "unavailable",
    "high demand",
    "resource exhausted",
    "rate limit",
    "internal error",
    "internal server error",
    "deadline exceeded",
    "temporarily unavailable",
    "connection reset",
    "connection aborted",
    "timed out",
    "timeout",
    "try again later",
    "no image payload",
)

ANALYSIS_PROMPT = """
You are building an editable Thai translation layout for a manga page.

Task:
1. Detect every text area that should be translated into Thai.
2. Return regions in natural reading order (right-to-left, top-to-bottom for Japanese manga).
3. Use normalized coordinates on a 1000×1000 grid.
4. Translate into concise, natural Thai that fits the visual space.
5. Pick the best Thai font, weight, and size for each region.

═══ CRITICAL: Region Sizing Rules ═══

Japanese manga text is usually VERTICAL. Thai text is HORIZONTAL.
You MUST adjust the region dimensions to fit horizontal Thai text:

- For vertical Japanese text in a TALL NARROW bubble:
  → Make the region WIDER to span the full bubble width.
  → Make the region SHORTER if needed.
  → The region should cover the ENTIRE interior of the speech bubble where text can go.

- For ROUND or OVAL bubbles:
  → Set the region to fit the usable text area INSIDE the bubble (not the bubble outline).
  → Leave ~10% padding from bubble edges.

- x, y = top-left corner of the text region (NOT the bubble outline).
- width, height = size of the TEXT AREA inside the bubble.
- ALL coordinates are on a 1000×1000 grid.
- The region MUST stay within the bubble boundary. Do NOT extend outside bubbles.

═══ Background Color (MANDATORY) ═══

background_color MUST cover original Japanese text underneath:
- Dialogue bubbles: use "rgba(255,255,255,0.95)" (white/near-white).
- Narration/caption boxes: use the box's actual fill color.
- SFX on artwork: use "transparent" ONLY for tiny SFX. Otherwise sample the art background color.
- Signs on dark backgrounds: use the sign's background (e.g. "#333333").
- NEVER use "transparent" for dialogue or narration — original text will show through.
- When in doubt: use "rgba(255,255,255,0.95)".

═══ Font Size (CRITICAL — must not overflow) ═══

- Thai text is 1.5–2× WIDER than Japanese for the same meaning.
- font_size is in pixels for the original page resolution.
- ALWAYS verify: (thai_char_count × 0.55 × font_size) ≤ region_width_in_pixels.
  If it doesn't fit, REDUCE font_size or SHORTEN the translation.
- Typical ranges:
  - Small bubbles / whisper: 16–22px
  - Normal dialogue: 22–32px
  - Emphasis / shout: 28–42px
  - Large SFX: 36–60px
- For multi-line text: also check (line_count × font_size × 1.3) ≤ region_height_in_pixels.
- It is MUCH better to be slightly too small than to overflow.
- If a bubble is narrow (width < 120 on the 1000-grid), use very short Thai and small font.

═══ Translation Quality ═══

- Translate naturally — use spoken Thai, not formal/textbook Thai.
- Keep translations SHORT and punchy, like real manga dialogue.
- For exclamations: use Thai equivalents (อ๊ะ, เฮ้, ว้าว, อ้าว, etc.)
- For SFX: translate to Thai onomatopoeia or short descriptive words.
- Each region must appear exactly ONCE — no duplicates.
- The translated text must be horizontal Thai.
- SKIP symbol-only text: if the original text is ONLY punctuation/symbols like "!?", "!!", "?", "!", "!?", ">>", "…", "---", etc. → do NOT create a region for it. Leave it as-is on the image. These are universal and don't need translation.

═══ Japanese-Specific Terms ═══

Some terms are best kept in their original Japanese alongside Thai translation:
- Honorifics: keep as-is (e.g. "~ซัง (-さん)", "~จัง (-ちゃん)", "~คุง (-くん)", "เซ็นเซย์ (先生)")
  → In translated_text: just use the Thai transliteration (ซัง, จัง, คุง, เซ็นเซย์)
- Iconic SFX: if the Japanese onomatopoeia is well-known, include it in parentheses.
  e.g. "ด้ง! (ドーン)" for dramatic impact, "ซู..." for soft sounds
  → But ONLY for large/prominent SFX. Small SFX just translate to Thai.
- Character name suffixes: preserve as Thai transliteration.
  e.g. "โยสึบะจัง" not just "โยสึบะ"

═══ Text Styling ═══

- text_color: usually "#111111". Use "#f8f8f8" on dark backgrounds.
- alignment: "left", "center", or "right". Use "center" for bubbles.
- font_style: normal | shout | whisper | narration | handwritten | comic | bold_display
- font_weight: "bold" for shouts/SFX/emphasis, "normal" for everything else.
- notes: short practical note, e.g. "small bubble top-right" or "SFX near character".

═══ Font Catalog ═══

Pick font_name from this list based on visual style:

CLEAN (standard dialogue): Sarabun, Prompt, K2D, Kanit, Niramit, Krub, KoHo, NotoSansThai, IBMPlexSansThai, Boon
HANDWRITTEN (casual/thoughts): Itim, Sriracha, Mali, Charmonman, Charm, BoonJot
BOLD DISPLAY (SFX/shouts/titles): Chonburi, Pattaya, BoonTook, Srisakdi
SERIF (narration/formal): NotoSerifThai, Maitree, Pridi, Taviraj, Norasi
STYLIZED (decorative): Aksaramatee, ChulaNarak, CmPrasanmit, Nakaracha

Default for standard dialogue: Sarabun or K2D (clean, readable at small sizes).
"""

CLEAN_PROMPT = """
Remove every piece of original source text from this manga page and rebuild the cleared areas so the page looks
naturally blank and ready for Thai replacement in the same location. Identify and clean all text areas including
dialogue bubbles, captions, narration boxes, signs, and sound effects.

Important:
- Fully erase every visible source glyph in every text region. Do not leave partial strokes, outlines, or shadows.
- Preserve dark signs, black SFX shapes, and label plates by removing only the lettering inside them.
- Preserve the original bubble or sign silhouette instead of replacing it with a generic rectangle.
- Keep speech bubble borders, caption frames, panel lines, tones, and nearby artwork intact.
- If a region is inside a white bubble, return that bubble interior as clean white or the original light tone.
- If a region is inside a dark or solid plate, preserve that plate shape and fill while removing only the source lettering.
- Do not add replacement Thai text inside the clean image. Only return the cleaned page.
"""

REFINEMENT_PROMPT = """
You are reviewing a manga page that has already been translated from Japanese to Thai (Pass 1).
The image below shows the translated result with Thai text overlaid on the manga page.

Your job is to check EVERY region and fix problems. Return the COMPLETE corrected region list.

Common problems to fix:
1. TEXT OVERFLOW: Thai text extends outside the speech bubble boundary.
   → Fix: reduce font_size, shorten translated_text, or adjust width/height.
2. TEXT TOO SMALL: font_size is unnecessarily small when there's plenty of room.
   → Fix: increase font_size to fill more of the available space.
3. WRONG POSITION: region is shifted away from the actual bubble center.
   → Fix: adjust x, y to center the text inside the bubble.
4. REGION TOO NARROW: the region is as narrow as the original vertical Japanese text.
   → Fix: make width wider to span the bubble's horizontal extent.
5. BACKGROUND MISSING: original Japanese text is still visible behind Thai text.
   → Fix: set background_color to "rgba(255,255,255,0.95)" for dialogue bubbles.
6. BAD TRANSLATION: translation is unnatural, too long, or doesn't match context.
   → Fix: improve the Thai translation (keep it short and natural).
7. MISSING TEXT: some text in the original was not detected or translated.
   → Fix: add new regions for missed text.

Rules:
- Return ALL regions (both fixed and unchanged ones) in the same JSON format.
- Keep the same region IDs for existing regions.
- Use the 1000×1000 coordinate grid.
- Do NOT remove regions unless they are true duplicates.
- For each region you changed, add a note in the notes field like "Pass 2: reduced font_size" or "Pass 2: widened region".
"""

OCR_SUGGESTION_PROMPT = """
You are creating an editable Thai suggestion layer for a manga page after the original text has been removed.

You are given:
- OCR blocks from the CURRENT page, with bounding boxes on a 1000x1000 grid.
- Nearby page OCR excerpts for story context only.
- Approved translations and translation memory from the same project.
- Optional glossary entries that should be followed exactly.
- Optional public-domain context corpus excerpts that may help with names, phrasing, and literary tone.
- Retrieval priority is: current project memory first, then global memory/glossary, then public-domain context corpus.

Your job:
1. Use ONLY the CURRENT page OCR blocks to create editable text regions for the current page.
2. Merge OCR fragments that obviously belong to the same bubble, caption, or sign.
3. Translate into concise, natural Thai that sounds like manga dialogue.
4. Follow glossary entries and approved translations whenever they clearly apply.
5. Use nearby pages only to understand names, pronouns, tone, and continuity. Do NOT create regions from nearby pages.
6. Use public-domain context corpus excerpts only as soft background reference. Do NOT copy them blindly and do NOT create regions from them.
7. Return JSON in the schema exactly.

Region rules:
- source_text should reflect the OCR text that region is based on.
- translated_text should be a Thai suggestion, not a final locked answer.
- Use normalized coordinates on a 1000x1000 grid.
- For dialogue/caption/narration, default background_color should be rgba(255,255,255,0.92).
- Use transparent only when artwork should clearly show through, such as tiny SFX.
- Prefer alignment=center for bubbles and left for narration/signs when obvious.
- Keep notes short and start them with "Suggested via OCR".
- Set review_state to "suggested" for every region you return.

Quality rules:
- OCR may be noisy or fragmented. Clean it up before translating.
- If OCR looks uncertain, infer carefully from nearby context, but stay conservative and concise.
- Do not invent extra regions if there is no evidence in the current page OCR.
- If a block is punctuation-only or garbage, skip it.
"""

OCR_EXTRACTION_PROMPT = """
You are extracting original source text from a manga page for a Thai suggestion workflow.

Task:
1. Detect readable source text blocks on the CURRENT page only.
2. Return blocks in natural reading order for Japanese manga.
3. Use a normalized 0-1000 grid for x, y, width, and height.
4. Keep each block tied to one visible text cluster, bubble, caption, sign, or SFX chunk.
5. Preserve the original source text as faithfully as possible.
6. Skip empty blocks, pure punctuation, and obvious garbage.

Rules:
- confidence is a number between 0 and 1.
- polygon is optional but helpful when visible text is rotated or irregular.
- raw_text should reflect the page text in rough reading order.
- page_notes should briefly mention things like vertical text, dense SFX, or mixed layout.
"""

SUGGESTION_GLOSSARY_LIMIT = 40
SUGGESTION_MEMORY_LIMIT = 24
SUGGESTION_NEARBY_PAGE_LIMIT = 3
SUGGESTION_BLOCKS_PER_PAGE_LIMIT = 18

OPAQUE_BACKGROUND_KINDS = {"dialogue", "caption", "narration", "sign", "sfx", "other"}
RGBA_PATTERN = re.compile(r"rgba?\(([^)]+)\)", re.IGNORECASE)


def _make_client(api_key: str | None) -> genai.Client:
    resolved_key = (api_key or os.getenv("GEMINI_API_KEY") or "").strip()
    if not resolved_key:
        raise ValueError("Missing Gemini API key. Add it in the app or set GEMINI_API_KEY in backend/.env.")
    if len(resolved_key) < 10:
        raise ValueError("API key appears invalid (too short).")
    return genai.Client(api_key=resolved_key)


def _prepare_image(image_bytes: bytes) -> Image.Image:
    image = Image.open(io.BytesIO(image_bytes))
    image.load()
    if image.mode not in ("RGB", "RGBA"):
        image = image.convert("RGB")
    return image


def _make_analysis_image(image: Image.Image) -> Image.Image:
    copy = image.copy()
    copy.thumbnail((1400, 1400))
    return copy


def _make_clean_image(image: Image.Image) -> Image.Image:
    copy = image.copy()
    copy.thumbnail((2000, 2000))
    return copy


def _stringify_exception(exc: Exception) -> str:
    return " ".join(str(exc or "").split()).strip() or exc.__class__.__name__


def _is_retryable_gemini_error(exc: Exception) -> bool:
    message = _stringify_exception(exc).lower()
    return any(marker in message for marker in _GEMINI_RETRYABLE_MARKERS)


def _retry_delay_seconds(attempt_number: int) -> float:
    return min(
        GEMINI_RETRY_MAX_DELAY_SECONDS,
        GEMINI_RETRY_BASE_DELAY_SECONDS * (2 ** max(0, int(attempt_number) - 1)),
    )


def _append_warning(warnings: list[str], message: str) -> None:
    normalized_message = " ".join(str(message or "").split()).strip()
    if normalized_message and normalized_message not in warnings:
        warnings.append(normalized_message)


def _parse_structured_response(response: object, schema: type) -> object:
    parsed = getattr(response, "parsed", None)
    if parsed is not None:
        return parsed
    return schema.model_validate_json(getattr(response, "text", ""))


def _extract_inline_image_or_raise(response: object, *, operation_label: str) -> str:
    image_base64 = _extract_inline_image_base64(response)
    if image_base64:
        return image_base64
    response_text = (getattr(response, "text", "") or "")[:200]
    raise RuntimeError(f"{operation_label} returned no image payload. Response: {response_text}")


def _generate_content_with_retry(
    client: genai.Client,
    *,
    primary_model: str,
    contents: list[object],
    operation_label: str,
    parse_response,
    config: types.GenerateContentConfig | None = None,
    fallback_model: str | None = None,
    fallback_on_any_error: bool = False,
) -> tuple[object, str, list[str]]:
    warnings: list[str] = []
    resolved_primary_model = str(primary_model or "").strip()
    resolved_fallback_model = str(fallback_model or "").strip()
    models_to_try = [resolved_primary_model]
    if resolved_fallback_model and resolved_fallback_model != resolved_primary_model:
        models_to_try.append(resolved_fallback_model)

    last_error: Exception | None = None
    primary_error_message = ""

    for model_index, candidate_model in enumerate(models_to_try):
        for attempt in range(1, GEMINI_RETRY_ATTEMPTS + 1):
            try:
                response = client.models.generate_content(
                    model=candidate_model,
                    contents=contents,
                    config=config,
                )
                parsed = parse_response(response)
                if model_index > 0:
                    _append_warning(
                        warnings,
                        f"{operation_label} switched to {candidate_model} after {resolved_primary_model} failed: {primary_error_message}",
                    )
                elif attempt > 1:
                    _append_warning(
                        warnings,
                        f"{operation_label} succeeded on retry {attempt}/{GEMINI_RETRY_ATTEMPTS} with {candidate_model}.",
                    )
                return parsed, candidate_model, warnings
            except Exception as exc:
                last_error = exc
                error_message = _stringify_exception(exc)
                if model_index == 0 and not primary_error_message:
                    primary_error_message = error_message

                retryable = _is_retryable_gemini_error(exc)
                if retryable and attempt < GEMINI_RETRY_ATTEMPTS:
                    time.sleep(_retry_delay_seconds(attempt))
                    continue
                break

        if model_index == 0 and len(models_to_try) > 1:
            if fallback_on_any_error or (last_error is not None and _is_retryable_gemini_error(last_error)):
                continue
        break

    if last_error is None:
        raise RuntimeError(f"{operation_label} failed without a Gemini response.")
    raise last_error


def _extract_inline_image_base64(response: object) -> str | None:
    """Extract base64-encoded image from a Gemini response containing inline image data."""
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
                continue  # Skip parts with invalid base64 data.
        else:
            raw = data
        return base64.b64encode(raw).decode("utf-8")
    return None


def _encode_image_base64(image: Image.Image, *, format_name: str = "PNG") -> str:
    buffer = io.BytesIO()
    image.save(buffer, format=format_name)
    return base64.b64encode(buffer.getvalue()).decode("utf-8")


def _sha256_hex(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def _merge_unique_dict_items(
    primary_items: list[dict] | None,
    secondary_items: list[dict] | None,
    *,
    key_fields: tuple[str, ...],
    limit: int,
) -> list[dict]:
    merged: list[dict] = []
    seen: set[tuple[str, ...]] = set()
    for item in (primary_items or []) + (secondary_items or []):
        if not isinstance(item, dict):
            continue
        key = tuple(" ".join(str(item.get(field) or "").split()).strip() for field in key_fields)
        if not any(key):
            continue
        if key in seen:
            continue
        seen.add(key)
        merged.append(dict(item))
        if len(merged) >= limit:
            break
    return merged


def _normalize_alignment(value: str) -> str:
    normalized = (value or "").strip().lower()
    if normalized not in {"left", "center", "right"}:
        return "center"
    return normalized


def _normalize_color(value: str, fallback: str) -> str:
    normalized = (value or "").strip()
    if not normalized:
        return fallback
    if normalized.lower() == "transparent":
        return "transparent"
    rgba_match = RGBA_PATTERN.fullmatch(normalized)
    if rgba_match:
        parts = [part.strip() for part in rgba_match.group(1).split(",")]
        if len(parts) == 4:
            try:
                if float(parts[3]) <= 0.02:
                    return "transparent"
            except ValueError:
                return fallback
    return normalized


def _default_background_color(kind: str) -> str:
    return "rgba(255,255,255,0.92)" if kind in OPAQUE_BACKGROUND_KINDS else "transparent"


# Kinds that MUST have an opaque background to hide original text underneath.
_FORCE_OPAQUE_KINDS = {"dialogue", "caption", "narration"}


def _force_opaque_background(color: str, kind: str) -> str:
    """If the region kind requires an opaque background but Gemini returned
    transparent, override with a sensible default so original text is hidden."""
    if kind in _FORCE_OPAQUE_KINDS and color == "transparent":
        return "rgba(255,255,255,0.92)"
    return color


def _is_symbol_only(text: str) -> bool:
    """Return True if text contains only punctuation/symbols (no actual words)."""
    import re
    stripped = re.sub(r'[\s!?！？\.\,\-\–\—\~\>\<\.\…\・\:\;\"\'\(\)\[\]\/\\]+', '', text)
    return len(stripped) == 0


def _is_low_value_ocr_text(text: str) -> bool:
    normalized = "".join(str(text or "").split())
    if not normalized or _is_symbol_only(normalized):
        return True
    if re.fullmatch(r"\d+", normalized):
        return True
    if re.fullmatch(r"[\W_]+", normalized):
        return True
    if len(normalized) == 1 and not re.search(r"[A-Za-z\u3040-\u30ff\u3400-\u9fff]", normalized):
        return True
    return False


def _normalize_regions(regions: list[object]) -> list[RegionPayload]:
    normalized: list[RegionPayload] = []
    for index, region in enumerate(regions, start=1):
        # Skip regions that are symbol-only (!, ??, !?, etc.)
        source = (getattr(region, "source_text", "") or "").strip()
        translated = (getattr(region, "translated_text", "") or "").strip()
        if _is_symbol_only(source) and _is_symbol_only(translated):
            continue

        kind = (getattr(region, "kind", "") or "dialogue").strip().lower()
        background_fallback = _default_background_color(kind)
        x = max(0.0, min(1000.0, float(getattr(region, "x", 0.0))))
        y = max(0.0, min(1000.0, float(getattr(region, "y", 0.0))))
        width = max(10.0, min(1000.0 - x, float(getattr(region, "width", 120.0))))
        height = max(10.0, min(1000.0 - y, float(getattr(region, "height", 80.0))))
        normalized.append(
            RegionPayload(
                id=(getattr(region, "id", "") or f"region_{index}").strip(),
                kind=kind,
                source_text=(getattr(region, "source_text", "") or "").strip(),
                translated_text=(getattr(region, "translated_text", "") or "").strip(),
                x=round(x, 2),
                y=round(y, 2),
                width=round(width, 2),
                height=round(height, 2),
                font_size=max(14, min(96, int(getattr(region, "font_size", 28) or 28))),
                alignment=_normalize_alignment(getattr(region, "alignment", "center")),
                text_color=_normalize_color(getattr(region, "text_color", "#111111"), "#111111"),
                background_color=_force_opaque_background(
                    _normalize_color(
                        getattr(region, "background_color", background_fallback),
                        background_fallback,
                    ),
                    kind,
                ),
                font_style=(getattr(region, "font_style", "normal") or "normal").strip().lower(),
                font_name=(getattr(region, "font_name", "") or "").strip(),
                font_weight=("bold" if (getattr(region, "font_weight", "normal") or "normal").strip().lower() == "bold" else "normal"),
                notes=(getattr(region, "notes", "") or "").strip(),
                review_state=(getattr(region, "review_state", "approved") or "approved").strip().lower(),
            )
        )

    return normalized


def _trim_ocr_payload(ocr_payload: dict | OcrPageResponse | None, *, max_blocks: int) -> dict | None:
    if not ocr_payload:
        return None

    if isinstance(ocr_payload, OcrPageResponse):
        data = ocr_payload.model_dump()
    elif isinstance(ocr_payload, dict):
        data = dict(ocr_payload)
    else:
        return None

    blocks = data.get("blocks")
    if isinstance(blocks, list):
        trimmed_blocks: list[dict] = []
        for block in blocks[:max_blocks]:
            if hasattr(block, "model_dump"):
                block_data = block.model_dump()
            elif isinstance(block, dict):
                block_data = dict(block)
            else:
                continue
            trimmed_blocks.append({
                "id": block_data.get("id", ""),
                "text": block_data.get("text", ""),
                "confidence": block_data.get("confidence", 0.0),
                "x": block_data.get("x", 0.0),
                "y": block_data.get("y", 0.0),
                "width": block_data.get("width", 0.0),
                "height": block_data.get("height", 0.0),
            })
        data["blocks"] = trimmed_blocks
        data["raw_text"] = "\n".join(
            str(block.get("text", "")).strip()
            for block in trimmed_blocks
            if str(block.get("text", "")).strip()
        )
    return data


def _trim_approved_translations(items: list[dict] | None) -> list[dict]:
    trimmed: list[dict] = []
    for item in items or []:
        if not isinstance(item, dict):
            continue
        source_text = str(item.get("source_text", "")).strip()
        translated_text = str(item.get("translated_text", "")).strip()
        if not source_text or not translated_text:
            continue
        trimmed.append({
            "source_text": source_text,
            "translated_text": translated_text,
            "kind": str(item.get("kind", "")).strip(),
            "page_key": str(item.get("page_key", "")).strip(),
            "notes": str(item.get("notes", "")).strip(),
        })
        if len(trimmed) >= SUGGESTION_MEMORY_LIMIT:
            break
    return trimmed


def _trim_glossary_entries(items: list[dict] | None) -> list[dict]:
    trimmed: list[dict] = []
    for item in items or []:
        if not isinstance(item, dict):
            continue
        source = str(item.get("source", "")).strip()
        target = str(item.get("target", "")).strip()
        if not source or not target:
            continue
        trimmed.append({
            "source": source,
            "target": target,
            "scope": str(item.get("scope", "global")).strip() or "global",
            "lock": bool(item.get("lock", True)),
            "notes": str(item.get("notes", "")).strip(),
        })
        if len(trimmed) >= SUGGESTION_GLOSSARY_LIMIT:
            break
    return trimmed


def _trim_nearby_ocr_pages(items: list[dict] | None) -> list[dict]:
    trimmed: list[dict] = []
    for item in items or []:
        if not isinstance(item, dict):
            continue
        normalized = _trim_ocr_payload(item, max_blocks=SUGGESTION_BLOCKS_PER_PAGE_LIMIT)
        if not normalized:
            continue
        trimmed.append(normalized)
        if len(trimmed) >= SUGGESTION_NEARBY_PAGE_LIMIT:
            break
    return trimmed


def _build_ocr_suggestion_prompt(
    *,
    current_ocr: OcrPageResponse,
    nearby_ocr_pages: list[dict] | None = None,
    approved_translations: list[dict] | None = None,
    glossary_entries: list[dict] | None = None,
) -> str:
    sections = [OCR_SUGGESTION_PROMPT.strip()]

    current_payload = _trim_ocr_payload(current_ocr, max_blocks=SUGGESTION_BLOCKS_PER_PAGE_LIMIT)
    if current_payload:
        sections.append(
            "CURRENT PAGE OCR (source of truth for region creation):\n```json\n"
            + json.dumps(current_payload, ensure_ascii=False, indent=2)
            + "\n```"
        )

    trimmed_nearby = _trim_nearby_ocr_pages(nearby_ocr_pages)
    if trimmed_nearby:
        sections.append(
            "NEARBY PAGE OCR CONTEXT (for names, pronouns, tone only):\n```json\n"
            + json.dumps(trimmed_nearby, ensure_ascii=False, indent=2)
            + "\n```"
        )

    trimmed_memory = _trim_approved_translations(approved_translations)
    if trimmed_memory:
        sections.append(
            "APPROVED TRANSLATION MEMORY:\n```json\n"
            + json.dumps(trimmed_memory, ensure_ascii=False, indent=2)
            + "\n```"
        )

    trimmed_glossary = _trim_glossary_entries(glossary_entries)
    if trimmed_glossary:
        sections.append(
            "GLOSSARY RULES:\n```json\n"
            + json.dumps(trimmed_glossary, ensure_ascii=False, indent=2)
            + "\n```"
        )

    return "\n\n".join(sections)


def _mark_regions_as_suggested(regions: list[RegionPayload]) -> list[RegionPayload]:
    normalized_regions: list[RegionPayload] = []
    for region in regions:
        normalized_regions.append(region.model_copy(update={
            "review_state": "suggested",
            "notes": region.notes or "Suggested via OCR",
        }))
    return normalized_regions


def _parse_color(color_str: str, fallback: tuple) -> tuple:
    """Parse CSS color string including rgba() format."""
    if not color_str:
        return fallback
    try:
        return ImageColor.getrgb(color_str)
    except (ValueError, AttributeError):
        pass
    # Try rgba(r, g, b, a) format.
    import re
    m = re.match(r"rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)", color_str)
    if m:
        r, g, b = int(float(m.group(1))), int(float(m.group(2))), int(float(m.group(3)))
        if m.group(4) is not None:
            a = int(float(m.group(4)) * 255) if float(m.group(4)) <= 1 else int(float(m.group(4)))
            return (r, g, b, a)
        return (r, g, b)
    return fallback


def _sample_surrounding_fill(image: Image.Image, box: tuple[int, int, int, int]) -> tuple[int, int, int, int]:
    x1, y1, x2, y2 = box
    width, height = image.size
    margin = max(8, int(min(max(1, x2 - x1), max(1, y2 - y1)) * 0.12))
    sample_boxes = [
        (max(0, x1 - margin), y1, x1, y2),
        (x2, y1, min(width, x2 + margin), y2),
        (x1, max(0, y1 - margin), x2, y1),
        (x1, y2, x2, min(height, y2 + margin)),
    ]

    samples: list[tuple[int, int, int, int]] = []
    for sx1, sy1, sx2, sy2 in sample_boxes:
        if sx2 <= sx1 or sy2 <= sy1:
            continue
        crop = image.crop((sx1, sy1, sx2, sy2)).convert("RGBA")
        sample = crop.resize((1, 1), Image.Resampling.BOX).getpixel((0, 0))
        samples.append(sample if len(sample) == 4 else sample + (255,))

    if not samples:
        return (255, 255, 255, 235)

    channel_totals = [0, 0, 0, 0]
    for sample in samples:
        for index, value in enumerate(sample):
            channel_totals[index] += int(value)
    return tuple(int(total / len(samples)) for total in channel_totals)


def _build_local_clean_preview(image: Image.Image, regions: list[RegionPayload]) -> str | None:
    if not regions:
        return None

    composite = image.copy().convert("RGBA")
    draw = ImageDraw.Draw(composite, "RGBA")
    scale_x = composite.width / 1000
    scale_y = composite.height / 1000

    for region in regions:
        x = int(round(region.x * scale_x))
        y = int(round(region.y * scale_y))
        width = max(1, int(round(region.width * scale_x)))
        height = max(1, int(round(region.height * scale_y)))
        padding = max(6, int(min(width, height) * 0.12))

        x1 = max(0, x - padding)
        y1 = max(0, y - padding)
        x2 = min(composite.width, x + width + padding)
        y2 = min(composite.height, y + height + padding)
        if x2 <= x1 or y2 <= y1:
            continue

        fill_color = region.background_color
        if fill_color and fill_color != "transparent":
            fill = _parse_color(fill_color, (255, 255, 255, 235))
            if len(fill) == 3:
                fill = fill + (235,)
        elif region.kind in OPAQUE_BACKGROUND_KINDS:
            fill = _parse_color(_default_background_color(region.kind), (255, 255, 255, 235))
            if len(fill) == 3:
                fill = fill + (235,)
        else:
            fill = _sample_surrounding_fill(composite, (x1, y1, x2, y2))

        radius = max(8, int(min(x2 - x1, y2 - y1) * 0.18))
        draw.rounded_rectangle((x1, y1, x2, y2), radius=radius, fill=fill)

    return _encode_image_base64(composite, format_name="PNG")


def _clamp_normalized_value(value: object, *, minimum: float = 0.0, maximum: float = 1000.0) -> float:
    try:
        number = float(value)
    except (TypeError, ValueError):
        return minimum
    return max(minimum, min(maximum, number))


def extract_page_ocr(
    image_bytes: bytes,
    *,
    page_number: int | None = None,
    api_key: str | None = None,
    model: str | None = None,
    document_key: str | None = None,
) -> OcrPageResponse:
    image = _prepare_image(image_bytes)
    normalized_page_number = max(1, int(page_number or 1))
    image_hash = _sha256_hex(image_bytes)
    if document_key:
        cached = get_cached_ocr_page(
            document_key=document_key,
            page_number=normalized_page_number,
            image_hash=image_hash,
        )
        if cached:
            return cached

    client = _make_client(api_key)
    resolved_model = str(model or OCR_MODEL).strip() or OCR_MODEL
    analysis_image = _make_analysis_image(image)
    warnings: list[str] = []
    analysis, resolved_model, retry_warnings = _generate_content_with_retry(
        client,
        primary_model=resolved_model,
        fallback_model=GEMINI_STRUCTURED_FALLBACK_MODEL,
        contents=[OCR_EXTRACTION_PROMPT, analysis_image],
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=GeminiOcrAnalysis,
        ),
        operation_label="Gemini OCR",
        parse_response=lambda response: _parse_structured_response(response, GeminiOcrAnalysis),
        fallback_on_any_error=True,
    )
    warnings.extend(retry_warnings)

    blocks: list[OcrTextBlock] = []
    confidences: list[float] = []
    for index, block in enumerate(analysis.blocks, start=1):
        text = " ".join(str(block.text or "").split()).strip()
        if not text or _is_low_value_ocr_text(text):
            continue
        x = _clamp_normalized_value(block.x)
        y = _clamp_normalized_value(block.y)
        width = _clamp_normalized_value(block.width, minimum=8.0)
        height = _clamp_normalized_value(block.height, minimum=8.0)
        polygon = []
        for point in block.polygon or []:
            if not isinstance(point, (list, tuple)) or len(point) < 2:
                continue
            polygon.append([
                _clamp_normalized_value(point[0]),
                _clamp_normalized_value(point[1]),
            ])
        confidence = max(0.0, min(1.0, float(block.confidence or 0.0)))
        confidences.append(confidence)
        blocks.append(
            OcrTextBlock(
                id=f"ocr_{normalized_page_number}_{index}",
                page_number=normalized_page_number,
                text=text,
                confidence=round(confidence, 4),
                x=round(x, 2),
                y=round(y, 2),
                width=round(min(width, 1000.0 - x), 2),
                height=round(min(height, 1000.0 - y), 2),
                polygon=polygon,
            )
        )

    if not blocks:
        warnings.append("Gemini OCR ไม่พบบล็อกข้อความที่พร้อมใช้ในหน้านี้")

    ocr_page = OcrPageResponse(
        page_number=normalized_page_number,
        image_width=image.width,
        image_height=image.height,
        raw_text="\n".join(block.text for block in blocks),
        blocks=blocks,
        avg_confidence=round(sum(confidences) / len(confidences), 4) if confidences else 0.0,
        engine_used=resolved_model,
        warnings=warnings,
    )
    if document_key:
        upsert_ocr_page(
            document_key=document_key,
            page_number=normalized_page_number,
            image_hash=image_hash,
            ocr_page=ocr_page,
            detected_language=analysis.detected_language or "unknown",
            page_notes=analysis.page_notes or "",
        )
    return ocr_page


def _render_regions_on_image(image: Image.Image, regions: list[RegionPayload]) -> Image.Image:
    """Render Thai text regions onto the image for Pass 2 review."""
    from PIL import ImageFont
    composite = image.copy().convert("RGB")
    draw = ImageDraw.Draw(composite, "RGBA")
    scale_x = composite.width / 1000
    scale_y = composite.height / 1000

    for region in regions:
        x = region.x * scale_x
        y = region.y * scale_y
        w = region.width * scale_x
        h = region.height * scale_y

        # Draw background
        bg = region.background_color
        if bg and bg != "transparent":
            fill = _parse_color(bg, (255, 255, 255))
            if len(fill) == 3:
                fill = fill + (240,)
            draw.rectangle([x, y, x + w, y + h], fill=fill)

        # Draw text
        font_size = max(12, int(region.font_size * (composite.height / 1000)))
        try:
            font_path = Path(__file__).resolve().parents[2] / "electron" / "fonts" / "Sarabun-Regular.ttf"
            font = ImageFont.truetype(str(font_path), font_size)
        except Exception:
            font = ImageFont.load_default()

        text = region.translated_text or ""
        tc = _parse_color(region.text_color, (17, 17, 17))

        # Center text in box
        bbox = draw.textbbox((0, 0), text, font=font)
        tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
        tx = x + (w - tw) / 2
        ty = y + (h - th) / 2
        draw.text((tx, ty), text, fill=tc, font=font)

    return composite


def _run_refinement(
    client: genai.Client,
    model_name: str,
    composite_image: Image.Image,
    regions: list[RegionPayload],
) -> tuple[list[RegionPayload], list[str]]:
    """Pass 2: Send rendered result to Gemini for review and correction."""
    warnings: list[str] = []

    # Build region summary for context
    region_summary = []
    for r in regions:
        region_summary.append({
            "id": r.id, "kind": r.kind,
            "translated_text": r.translated_text,
            "x": r.x, "y": r.y, "width": r.width, "height": r.height,
            "font_size": r.font_size, "background_color": r.background_color,
        })

    import json as _json
    context = f"\nCurrent regions:\n```json\n{_json.dumps(region_summary, ensure_ascii=False, indent=1)}\n```"

    review_image = _make_analysis_image(composite_image)

    try:
        refined, resolved_model, retry_warnings = _generate_content_with_retry(
            client,
            primary_model=model_name,
            fallback_model=GEMINI_STRUCTURED_FALLBACK_MODEL,
            contents=[REFINEMENT_PROMPT + context, review_image],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=PageAnalysis,
            ),
            operation_label="Pass 2 refinement",
            parse_response=lambda response: _parse_structured_response(response, PageAnalysis),
            fallback_on_any_error=True,
        )
        warnings.extend(retry_warnings)

        if refined.regions and len(refined.regions) > 0:
            refined_regions = _normalize_regions(refined.regions)
            changed = sum(1 for r in refined_regions if "Pass 2" in (r.notes or ""))
            warnings.append(f"Pass 2 ตรวจสอบแล้ว แก้ไข {changed}/{len(refined_regions)} regions")
            return refined_regions, warnings
        else:
            warnings.append("Pass 2: Gemini ไม่ได้ส่ง regions กลับมา ใช้ผลลัพธ์จาก Pass 1")
            return regions, warnings
    except Exception as exc:
        warnings.append(f"Pass 2 ล้มเหลว: {exc} — ใช้ผลลัพธ์จาก Pass 1")
        return regions, warnings


def _run_analysis(
    client: genai.Client,
    model_name: str,
    analysis_image: Image.Image,
) -> tuple[PageAnalysis, str, list[str]]:
    analysis, resolved_model, warnings = _generate_content_with_retry(
        client,
        primary_model=model_name,
        fallback_model=GEMINI_STRUCTURED_FALLBACK_MODEL,
        contents=[ANALYSIS_PROMPT, analysis_image],
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=PageAnalysis,
        ),
        operation_label="Structured region detection",
        parse_response=lambda response: _parse_structured_response(response, PageAnalysis),
        fallback_on_any_error=True,
    )

    # If the primary model returned 0 regions (common with image-generation models
    # that aren't good at structured text analysis), retry with the fallback model.
    fallback = GEMINI_STRUCTURED_FALLBACK_MODEL
    if (
        not analysis.regions
        and fallback
        and resolved_model != fallback
    ):
        _append_warning(
            warnings,
            f"{resolved_model} returned 0 regions — retrying with {fallback}.",
        )
        try:
            analysis2, resolved_model2, warnings2 = _generate_content_with_retry(
                client,
                primary_model=fallback,
                contents=[ANALYSIS_PROMPT, analysis_image],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=PageAnalysis,
                ),
                operation_label="Structured region detection (fallback)",
                parse_response=lambda response: _parse_structured_response(response, PageAnalysis),
            )
            if analysis2.regions:
                analysis = analysis2
                resolved_model = resolved_model2
                warnings.extend(warnings2)
        except Exception as exc:
            _append_warning(warnings, f"Fallback analysis also failed: {exc}")

    return analysis, resolved_model, warnings


def _run_clean_preview(
    client: genai.Client,
    model_name: str,
    clean_image: Image.Image,
) -> tuple[str | None, str, list[str]]:
    warnings: list[str] = []
    cleaned_image_base64: str | None = None
    resolved_model = str(model_name or DEFAULT_MODEL).strip() or DEFAULT_MODEL
    try:
        cleaned_image_base64, resolved_model, retry_warnings = _generate_content_with_retry(
            client,
            primary_model=resolved_model,
            fallback_model=GEMINI_IMAGE_FALLBACK_MODEL,
            contents=[CLEAN_PROMPT, clean_image],
            operation_label="Gemini clean preview",
            parse_response=lambda response: _extract_inline_image_or_raise(
                response,
                operation_label="Gemini clean preview",
            ),
            fallback_on_any_error=True,
        )
        warnings.extend(retry_warnings)
    except Exception as exc:
        warnings.append(f"Gemini clean preview ล้มเหลว: {exc}")
    return cleaned_image_base64, resolved_model, warnings


CLEAN_ONLY_PROMPT = """
Remove ALL text (dialogue, SFX, captions, signs, sound effects) from this manga page.
Reconstruct the cleared areas so the page looks naturally blank — as if no text was ever there.

Critical rules:
- Remove EVERY visible character/glyph. Do not leave partial strokes, outlines, or shadows.
- Where text overlaps artwork, characters, or objects: seamlessly inpaint/reconstruct the artwork underneath.
  The result must look like the original art without any text — not just a white patch.
- Preserve speech bubble shapes, panel lines, screen tones, and all non-text visual elements.
- Inside white bubbles: fill with clean white.
- Inside dark/colored areas: reconstruct the background pattern or solid color.
- Do NOT add any replacement text. Return ONLY the cleaned page.
- The output image must be the same dimensions as the input.
"""


def clean_text_only(
    image_bytes: bytes,
    api_key: str | None = None,
    model: str | None = None,
) -> dict:
    """Remove all text from a manga page without adding translations."""
    client = _make_client(api_key)
    resolved_model = (model or DEFAULT_MODEL).strip() or DEFAULT_MODEL
    image = _prepare_image(image_bytes)
    clean_image = _make_clean_image(image)

    try:
        cleaned_b64, resolved_model, _retry_warnings = _generate_content_with_retry(
            client,
            primary_model=resolved_model,
            fallback_model=GEMINI_IMAGE_FALLBACK_MODEL,
            contents=[CLEAN_ONLY_PROMPT, clean_image],
            operation_label="Gemini clean-only",
            parse_response=lambda response: _extract_inline_image_or_raise(
                response,
                operation_label="Gemini clean-only",
            ),
            fallback_on_any_error=True,
        )
        return {
            "cleaned_image_base64": cleaned_b64,
            "model_used": resolved_model,
        }
    except Exception as exc:
        raise ValueError(f"Clean failed: {exc}") from exc


def _trim_text(value: str, max_chars: int = 240) -> str:
    normalized = " ".join(str(value or "").split())
    if len(normalized) <= max_chars:
        return normalized
    return f"{normalized[: max_chars - 1].rstrip()}…"


def _coerce_ocr_page(value: OcrPageResponse | dict | None) -> OcrPageResponse | None:
    if value is None:
        return None
    if isinstance(value, OcrPageResponse):
        return value
    if isinstance(value, dict):
        return OcrPageResponse.model_validate(value)
    raise ValueError("OCR page payload is invalid.")


def _sanitize_ocr_page_context(page: OcrPageResponse | None, *, include_blocks: bool = True) -> dict | None:
    if page is None:
        return None

    blocks = []
    if include_blocks:
        sorted_blocks = sorted(page.blocks, key=lambda block: (block.y, block.x))
        for block in sorted_blocks[:80]:
            text = (block.text or "").strip()
            if not text or _is_symbol_only(text):
                continue
            blocks.append({
                "id": block.id,
                "text": _trim_text(text, 120),
                "confidence": round(float(block.confidence or 0.0), 4),
                "x": block.x,
                "y": block.y,
                "width": block.width,
                "height": block.height,
            })

    return {
        "page_number": page.page_number,
        "raw_text": _trim_text(page.raw_text or "", 1200),
        "avg_confidence": round(float(page.avg_confidence or 0.0), 4),
        "blocks": blocks,
    }


def _sanitize_memory_entries(entries: list[dict] | None, *, max_items: int = 32) -> list[dict]:
    sanitized: list[dict] = []
    seen: set[tuple[str, str]] = set()
    for item in entries or []:
        if not isinstance(item, dict):
            continue
        source_text = str(item.get("source_text") or "").strip()
        translated_text = str(item.get("translated_text") or "").strip()
        if not source_text or not translated_text:
            continue
        pair = (source_text, translated_text)
        if pair in seen:
            continue
        seen.add(pair)
        sanitized.append({
            "source_text": _trim_text(source_text, 180),
            "translated_text": _trim_text(translated_text, 180),
            "kind": str(item.get("kind") or "").strip(),
            "page_key": str(item.get("page_key") or "").strip(),
            "review_state": str(item.get("review_state") or "approved").strip().lower() or "approved",
            "notes": _trim_text(str(item.get("notes") or "").strip(), 120),
        })
        if len(sanitized) >= max_items:
            break
    return sanitized


def _sanitize_glossary_entries(entries: list[dict] | None, *, max_items: int = 48) -> list[dict]:
    sanitized: list[dict] = []
    seen: set[tuple[str, str]] = set()
    for item in entries or []:
        if not isinstance(item, dict):
            continue
        source_text = str(item.get("source") or item.get("source_text") or "").strip()
        target_text = str(item.get("target") or item.get("target_text") or item.get("translated_text") or "").strip()
        if not source_text or not target_text:
            continue
        pair = (source_text, target_text)
        if pair in seen:
            continue
        seen.add(pair)
        sanitized.append({
            "source": _trim_text(source_text, 120),
            "target": _trim_text(target_text, 120),
            "notes": _trim_text(str(item.get("notes") or "").strip(), 120),
            "lock": bool(item.get("lock", True)),
        })
        if len(sanitized) >= max_items:
            break
    return sanitized


def _sanitize_context_corpus_entries(entries: list[dict] | None, *, max_items: int = 8) -> list[dict]:
    sanitized: list[dict] = []
    seen: set[tuple[str, int]] = set()
    for item in entries or []:
        if not isinstance(item, dict):
            continue
        source_id = str(item.get("source_id") or "").strip()
        chunk_index = int(item.get("chunk_index") or 0)
        chunk_text = " ".join(str(item.get("text_chunk") or "").split()).strip()
        if not source_id or not chunk_text:
            continue
        pair = (source_id, chunk_index)
        if pair in seen:
            continue
        seen.add(pair)
        sanitized.append(
            {
                "source_id": source_id,
                "chunk_index": chunk_index,
                "title": _trim_text(str(item.get("title") or "").strip(), 120),
                "author_name": _trim_text(str(item.get("author_name") or "").strip(), 120),
                "source_type": str(item.get("source_type") or "").strip(),
                "license_label": str(item.get("license_label") or "").strip(),
                "text_chunk": _trim_text(chunk_text, 420),
                "source_url": str(item.get("source_url") or "").strip(),
            }
        )
        if len(sanitized) >= max_items:
            break
    return sanitized


def _suggest_regions_from_ocr_context(
    image_bytes: bytes,
    *,
    current_ocr_page: OcrPageResponse | dict | None = None,
    nearby_ocr_pages: list[dict] | None = None,
    translation_memory: list[dict] | None = None,
    approved_translations: list[dict] | None = None,
    glossary_entries: list[dict] | None = None,
    api_key: str | None = None,
    suggestion_model: str | None = None,
    ocr_model: str | None = None,
    document_key: str | None = None,
    source_kind: str | None = None,
    source_path: str | None = None,
    source_name: str | None = None,
    project_path: str | None = None,
    page_number: int | None = None,
) -> tuple[PageAnalysis, list[RegionPayload], str, str, list[str], OcrPageResponse]:
    warnings: list[str] = []
    resolved_document_key = build_document_key(
        source_kind=source_kind,
        source_path=source_path,
        source_name=source_name,
        project_path=project_path,
        document_key=document_key,
    )
    resolved_page_number = max(1, int(page_number or 1))

    if resolved_document_key:
        upsert_translation_memory(document_key=resolved_document_key, entries=translation_memory)
        upsert_translation_memory(document_key=resolved_document_key, entries=approved_translations)
        upsert_glossary_terms(document_key=resolved_document_key, entries=glossary_entries)

    resolved_current_ocr = _coerce_ocr_page(current_ocr_page)
    if resolved_current_ocr is None or not resolved_current_ocr.blocks:
        resolved_current_ocr = extract_page_ocr(
            image_bytes,
            page_number=resolved_page_number,
            api_key=api_key,
            model=ocr_model,
            document_key=resolved_document_key,
        )
    warnings.extend(resolved_current_ocr.warnings)
    source_image = _prepare_image(image_bytes)
    analysis_image = _make_analysis_image(source_image)
    resolved_provider = "gemini-rag"
    provider_label = "Gemini RAG suggest"
    resolved_suggestion_model = str(suggestion_model or SUGGESTION_MODEL).strip() or SUGGESTION_MODEL

    current_page_context = _sanitize_ocr_page_context(resolved_current_ocr, include_blocks=True)
    if not current_page_context or not current_page_context["blocks"]:
        warnings.append("OCR ไม่มีบล็อกข้อความพอสำหรับสร้าง Suggest layer")
        empty_analysis = PageAnalysis(detected_language="unknown", page_notes="No OCR blocks available.", regions=[])
        return empty_analysis, [], resolved_provider, resolved_suggestion_model, warnings, resolved_current_ocr

    nearby_pages_context: list[dict] = []
    merged_nearby_pages: list[OcrPageResponse] = []
    seen_nearby_pages: set[int] = set()
    for page_payload in nearby_ocr_pages or []:
        try:
            coerced_page = _coerce_ocr_page(page_payload)
        except Exception:
            continue
        if coerced_page is None or coerced_page.page_number is None:
            continue
        if coerced_page.page_number in seen_nearby_pages:
            continue
        seen_nearby_pages.add(coerced_page.page_number)
        merged_nearby_pages.append(coerced_page)

    if resolved_document_key:
        for cached_page in get_nearby_ocr_pages(
            document_key=resolved_document_key,
            center_page_number=resolved_page_number,
            distance=2,
            limit=4,
        ):
            if cached_page.page_number is None or cached_page.page_number in seen_nearby_pages:
                continue
            seen_nearby_pages.add(cached_page.page_number)
            merged_nearby_pages.append(cached_page)

    for coerced_page in merged_nearby_pages:
        sanitized_page = _sanitize_ocr_page_context(coerced_page, include_blocks=False)
        if sanitized_page and sanitized_page.get("raw_text"):
            nearby_pages_context.append(sanitized_page)
        if len(nearby_pages_context) >= 4:
            break

    query_texts = [block.text for block in resolved_current_ocr.blocks if (block.text or "").strip()]
    if resolved_current_ocr.raw_text:
        query_texts.append(resolved_current_ocr.raw_text)

    retrieved_memory = (
        get_relevant_translation_memory(
            document_key=resolved_document_key,
            query_texts=query_texts,
            limit=24,
        )
        if resolved_document_key
        else []
    )
    retrieved_glossary = (
        get_relevant_glossary_terms(
            document_key=resolved_document_key,
            query_texts=query_texts,
            limit=24,
        )
        if resolved_document_key
        else []
    )
    retrieved_context_corpus = get_relevant_context_corpus(
        document_key=resolved_document_key,
        query_texts=query_texts,
        limit=8,
        include_global=True,
    )

    memory_context = _merge_unique_dict_items(
        _sanitize_memory_entries(translation_memory, max_items=32),
        retrieved_memory,
        key_fields=("source_text", "translated_text"),
        limit=32,
    )
    approved_context = _merge_unique_dict_items(
        _sanitize_memory_entries(approved_translations, max_items=24),
        retrieved_memory,
        key_fields=("source_text", "translated_text"),
        limit=24,
    )
    glossary_context = _merge_unique_dict_items(
        _sanitize_glossary_entries(glossary_entries, max_items=48),
        retrieved_glossary,
        key_fields=("source", "target"),
        limit=48,
    )
    context_corpus = _sanitize_context_corpus_entries(retrieved_context_corpus, max_items=8)

    context_payload = {
        "current_page": current_page_context,
        "nearby_pages": nearby_pages_context,
        "translation_memory": memory_context,
        "approved_translations": approved_context,
        "glossary_entries": glossary_context,
        "context_corpus": context_corpus,
        "rag_strategy": {
            "engine": "sqlite-rag",
            "document_key": resolved_document_key,
            "retrieval_priority": [
                "project_translation_memory",
                "project_glossary",
                "global_translation_memory",
                "global_glossary",
                "public_domain_context_corpus",
            ],
            "retrieved_translation_hits": len(retrieved_memory),
            "retrieved_glossary_hits": len(retrieved_glossary),
            "retrieved_context_chunks": len(context_corpus),
        },
    }
    context_json = json.dumps(context_payload, ensure_ascii=False, indent=2)

    prompt_text = (
        f"{OCR_SUGGESTION_PROMPT}\n\n"
        "Use the attached page image to verify grouping, reading order, bubble boundaries, and layout.\n\n"
        f"Context JSON:\n```json\n{context_json}\n```"
    )
    resolved_suggestion_model = str(suggestion_model or SUGGESTION_MODEL).strip() or SUGGESTION_MODEL
    try:
        client = _make_client(api_key)
        analysis, resolved_suggestion_model, retry_warnings = _generate_content_with_retry(
            client,
            primary_model=resolved_suggestion_model,
            fallback_model=GEMINI_STRUCTURED_FALLBACK_MODEL,
            contents=[prompt_text, analysis_image],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=PageAnalysis,
            ),
            operation_label="Gemini suggest",
            parse_response=lambda response: _parse_structured_response(response, PageAnalysis),
            fallback_on_any_error=True,
        )
        warnings.extend(retry_warnings)
    except Exception as exc:
        warnings.append(f"Gemini suggest ล้มเหลว: {exc}")
        analysis = PageAnalysis(
            detected_language="unknown",
            page_notes=f"{provider_label} failed. OCR text is available but no regions were generated.",
            regions=[],
        )
        return analysis, [], resolved_provider, resolved_suggestion_model, warnings, resolved_current_ocr

    normalized_regions = _normalize_regions(analysis.regions)
    for region in normalized_regions:
        region.review_state = "suggested"
        if not region.notes:
            region.notes = "Suggested via Gemini OCR + RAG"
        elif not str(region.notes).lower().startswith("suggested via ocr"):
            region.notes = f"Suggested via Gemini OCR + RAG | {region.notes}"

    return analysis, normalized_regions, resolved_provider, resolved_suggestion_model, warnings, resolved_current_ocr


def clean_and_suggest_page(
    image_bytes: bytes,
    *,
    current_ocr_page: OcrPageResponse | dict | None = None,
    nearby_ocr_pages: list[dict] | None = None,
    translation_memory: list[dict] | None = None,
    approved_translations: list[dict] | None = None,
    glossary_entries: list[dict] | None = None,
    api_key: str | None = None,
    clean_model: str | None = None,
    suggestion_model: str | None = None,
    ocr_model: str | None = None,
    document_key: str | None = None,
    source_kind: str | None = None,
    source_path: str | None = None,
    source_name: str | None = None,
    project_path: str | None = None,
    page_number: int | None = None,
) -> CleanSuggestResponse:
    image = _prepare_image(image_bytes)
    analysis, suggested_regions, resolved_provider, resolved_suggestion_model, suggest_warnings, resolved_current_ocr = _suggest_regions_from_ocr_context(
        image_bytes,
        current_ocr_page=current_ocr_page,
        nearby_ocr_pages=nearby_ocr_pages,
        translation_memory=translation_memory,
        approved_translations=approved_translations,
        glossary_entries=glossary_entries,
        api_key=api_key,
        suggestion_model=suggestion_model,
        ocr_model=ocr_model,
        document_key=document_key,
        source_kind=source_kind,
        source_path=source_path,
        source_name=source_name,
        project_path=project_path,
        page_number=page_number,
    )

    clean_result: dict[str, str | None] = {
        "cleaned_image_base64": None,
        "model_used": str(clean_model or DEFAULT_MODEL),
    }
    clean_warnings: list[str] = []
    try:
        clean_result = clean_text_only(image_bytes=image_bytes, api_key=api_key, model=clean_model)
    except Exception as exc:
        clean_warnings.append(f"Gemini clean failed: {exc}")
        fallback_clean_base64 = _build_local_clean_preview(image, suggested_regions)
        if fallback_clean_base64:
            clean_result = {
                "cleaned_image_base64": fallback_clean_base64,
                "model_used": "local-region-mask-fallback",
            }
            clean_warnings.append(
                "Used local clean fallback built from Suggest regions because Gemini clean was unavailable."
            )
        else:
            clean_warnings.append("No clean preview was produced because there were no Suggest regions to mask.")

    return CleanSuggestResponse(
        clean_model_used=str(clean_result.get("model_used") or (clean_model or DEFAULT_MODEL)),
        suggestion_model_used=resolved_suggestion_model,
        suggestion_provider=resolved_provider,
        image_width=image.width,
        image_height=image.height,
        detected_language=analysis.detected_language or "unknown",
        page_notes=analysis.page_notes or "",
        ocr_blocks_used=len(resolved_current_ocr.blocks),
        regions=suggested_regions,
        cleaned_image_base64=clean_result.get("cleaned_image_base64"),
        warnings=[*suggest_warnings, *clean_warnings],
    )


EDIT_PROMPT_MAX_LENGTH = 2000
EDIT_IMAGE_MAX_SIZE = 2000  # Thumbnail limit for edit images.


def _attempt_translate_ocr_fallback(
    image_bytes: bytes,
    *,
    api_key: str | None = None,
) -> tuple[PageAnalysis, list[RegionPayload], str, list[str]]:
    analysis, fallback_regions, _provider, suggestion_model, fallback_warnings, resolved_current_ocr = _suggest_regions_from_ocr_context(
        image_bytes,
        api_key=api_key,
        suggestion_model=SUGGESTION_MODEL,
        ocr_model=OCR_MODEL,
        page_number=1,
    )
    warnings: list[str] = []
    for warning in fallback_warnings:
        _append_warning(warnings, warning)

    if fallback_regions:
        _append_warning(
            warnings,
            f"Pass 1 returned 0 regions - used Gemini OCR fallback with {suggestion_model}.",
        )
    else:
        ocr_block_count = len(getattr(resolved_current_ocr, "blocks", []) or [])
        _append_warning(
            warnings,
            f"Pass 1 returned 0 regions and OCR fallback found {ocr_block_count} usable OCR blocks.",
        )

    return analysis, fallback_regions, suggestion_model, warnings


def edit_image(
    image_bytes: bytes,
    prompt: str,
    api_key: str | None = None,
    model: str | None = None,
) -> "EditImageResponse":
    """Send a painted/marked image + prompt to Gemini for editing.

    The image should contain user-drawn brush marks (semi-transparent color)
    indicating areas to edit. Gemini sees the marks visually and follows the prompt.
    """
    from .models import EditImageResponse

    if len(prompt) > EDIT_PROMPT_MAX_LENGTH:
        raise ValueError(f"Prompt ยาวเกินไป ({len(prompt)}/{EDIT_PROMPT_MAX_LENGTH} ตัวอักษร)")

    client = _make_client(api_key)
    resolved_model = (model or DEFAULT_MODEL).strip() or DEFAULT_MODEL
    image = _prepare_image(image_bytes)

    # Fix #14: Limit image dimensions to prevent excessive API costs.
    image.thumbnail((EDIT_IMAGE_MAX_SIZE, EDIT_IMAGE_MAX_SIZE))

    # Build the edit instruction — user prompt is wrapped with delimiters to mitigate injection.
    edit_instruction = (
        "ในภาพนี้มีบริเวณที่ถูกระบายสีทับไว้เพื่อบอกตำแหน่งที่ต้องแก้ไข "
        "ให้ดูบริเวณที่มีสีระบายทับ แล้วทำตามคำสั่งต่อไปนี้:\n\n"
        "--- USER REQUEST ---\n"
        f"{prompt}\n"
        "--- END REQUEST ---\n\n"
        "กฎ:\n"
        "- แก้ไขเฉพาะบริเวณที่ถูกระบายสีทับ ห้ามแก้ไขส่วนอื่น\n"
        "- ลบรอยระบายสีออกด้วย\n"
        "- เติมพื้นหลังให้กลมกลืนกับบริเวณรอบข้าง\n"
        "- รักษาสไตล์มังงะของภาพต้นฉบับ\n"
        "- ส่งภาพที่แก้ไขแล้วกลับมาทั้งภาพ"
    )

    edited_base64, resolved_model, retry_warnings = _generate_content_with_retry(
        client,
        primary_model=resolved_model,
        fallback_model=GEMINI_IMAGE_FALLBACK_MODEL,
        contents=[edit_instruction, image],
        operation_label="Gemini edit image",
        parse_response=lambda response: _extract_inline_image_or_raise(
            response,
            operation_label="Gemini edit image",
        ),
        fallback_on_any_error=True,
    )

    warnings: list[str] = list(retry_warnings)

    return EditImageResponse(edited_image_base64=edited_base64, warnings=warnings)


def translate_page(image_bytes: bytes, api_key: str | None = None, model: str | None = None) -> TranslateResponse:
    """Non-streaming translation (kept for backward compatibility)."""
    result: TranslateResponse | None = None
    for _event in translate_page_stream(image_bytes, api_key=api_key, model=model):
        if isinstance(_event, TranslateResponse):
            result = _event
    if result is None:
        raise RuntimeError("Translation pipeline produced no result.")
    return result


def clean_and_suggest(
    image_bytes: bytes,
    *,
    api_key: str | None = None,
    clean_model: str | None = None,
    suggest_model: str | None = None,
    current_ocr: dict | OcrPageResponse | None = None,
    nearby_ocr_pages: list[dict] | None = None,
    approved_translations: list[dict] | None = None,
    glossary_entries: list[dict] | None = None,
) -> CleanSuggestResponse:
    image = _prepare_image(image_bytes)
    client = _make_client(api_key)
    resolved_clean_model = (clean_model or DEFAULT_MODEL).strip() or DEFAULT_MODEL
    resolved_suggest_model = (suggest_model or SUGGESTION_MODEL).strip() or SUGGESTION_MODEL

    current_ocr_response = current_ocr
    if isinstance(current_ocr_response, dict):
        current_ocr_response = OcrPageResponse.model_validate(current_ocr_response)
    if current_ocr_response is None or not current_ocr_response.blocks:
        current_ocr_response = extract_page_ocr(image_bytes, api_key=api_key)

    analysis_image = _make_analysis_image(image)
    clean_image = _make_clean_image(image)
    suggestion_prompt = _build_ocr_suggestion_prompt(
        current_ocr=current_ocr_response,
        nearby_ocr_pages=nearby_ocr_pages,
        approved_translations=approved_translations,
        glossary_entries=glossary_entries,
    )

    warnings: list[str] = []

    def _suggest_worker():
        parsed, _resolved_model, retry_warnings = _generate_content_with_retry(
            client,
            primary_model=resolved_suggest_model,
            fallback_model=GEMINI_STRUCTURED_FALLBACK_MODEL,
            contents=[suggestion_prompt, analysis_image],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=PageAnalysis,
            ),
            operation_label="Legacy clean-and-suggest",
            parse_response=lambda response: _parse_structured_response(response, PageAnalysis),
            fallback_on_any_error=True,
        )
        for warning in retry_warnings:
            _append_warning(warnings, warning)
        return parsed

    def _clean_worker():
        return _run_clean_preview(client, resolved_clean_model, clean_image)

    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
        suggestion_future = pool.submit(_suggest_worker)
        clean_future = pool.submit(_clean_worker)
        suggestion_analysis = suggestion_future.result(timeout=300)
        clean_result, resolved_clean_model, clean_warnings = clean_future.result(timeout=300)
        warnings.extend(clean_warnings)

    normalized_regions = _normalize_regions(suggestion_analysis.regions)
    normalized_regions = _mark_regions_as_suggested(normalized_regions)

    return CleanSuggestResponse(
        clean_model_used=resolved_clean_model,
        suggestion_model_used=resolved_suggest_model,
        image_width=image.width,
        image_height=image.height,
        detected_language=suggestion_analysis.detected_language or "ไม่ทราบ",
        page_notes=suggestion_analysis.page_notes or "",
        ocr_blocks_used=len(current_ocr_response.blocks),
        regions=normalized_regions,
        cleaned_image_base64=clean_result,
        warnings=warnings,
    )


# ─── Progress animation messages while waiting for Gemini ───
# เปลี่ยนข้อความทุก ~3 วินาที เพื่อให้ดูไม่ค้าง
_ANALYSIS_WAIT_MESSAGES = [
    "กำลังอัปโหลดภาพไปยัง Gemini API...",
    "Gemini กำลังรับภาพมังงะ...",
    "Gemini กำลังวิเคราะห์โครงสร้างหน้ามังงะ...",
    "Gemini กำลังแยกแยะ panel กับ bubble...",
    "Gemini กำลังสแกนหาข้อความในภาพ...",
    "Gemini กำลังระบุตำแหน่ง dialogue bubble...",
    "Gemini กำลังระบุตำแหน่ง SFX และ caption...",
    "Gemini กำลังอ่านข้อความภาษาต้นฉบับ...",
    "Gemini กำลังทำความเข้าใจบริบทของบทสนทนา...",
    "Gemini กำลังแปลข้อความเป็นภาษาไทย...",
    "Gemini กำลังปรับคำแปลให้เป็นธรรมชาติ...",
    "Gemini กำลังย่อข้อความให้พอดี bubble...",
    "Gemini กำลังวิเคราะห์สไตล์ตัวอักษรต้นฉบับ...",
    "Gemini กำลังเลือกฟอนต์ไทยที่เหมาะสม...",
    "Gemini กำลังกำหนด font weight (หนา/บาง)...",
    "Gemini กำลังคำนวณขนาดตัวอักษร...",
    "Gemini กำลังตรวจสอบว่าข้อความไม่ล้น bubble...",
    "Gemini กำลังจัดวางตำแหน่ง x, y ของข้อความ...",
    "Gemini กำลังกำหนดสีข้อความและพื้นหลัง...",
    "Gemini กำลังตรวจสอบผลลัพธ์ทั้งหมด...",
    "Gemini กำลังจัดเรียงตาม reading order...",
    "Gemini กำลังสร้าง JSON response...",
    "เกือบเสร็จแล้ว รอ Gemini ส่งผลลัพธ์กลับ...",
    "รอ Gemini ตอบกลับ...",
]

_CLEAN_WAIT_MESSAGES = [
    "กำลังอัปโหลดภาพไปยัง Gemini สำหรับ clean...",
    "Gemini กำลังรับภาพสำหรับลบข้อความ...",
    "Gemini กำลังวิเคราะห์พื้นหลังรอบข้อความ...",
    "Gemini กำลังระบุบริเวณที่ต้องลบ...",
    "Gemini กำลังลบข้อความใน dialogue bubble...",
    "Gemini กำลังลบ SFX และ caption...",
    "Gemini กำลังเติมพื้นหลังแทนที่ข้อความ...",
    "Gemini กำลัง inpaint บริเวณ bubble...",
    "Gemini กำลังปรับให้พื้นหลังเรียบเนียน...",
    "Gemini กำลังรักษาเส้นขอบ bubble ไว้...",
    "Gemini กำลัง generate ภาพ clean...",
    "Gemini กำลังตรวจสอบว่าไม่มีข้อความเหลือ...",
    "Gemini กำลังเข้ารหัสภาพ clean เป็น base64...",
    "Gemini กำลังส่งภาพ clean กลับมา...",
    "เกือบเสร็จแล้ว รอภาพ clean...",
    "รอ Gemini สร้างภาพ clean เสร็จ...",
]


def translate_page_stream(
    image_bytes: bytes,
    api_key: str | None = None,
    model: str | None = None,
):
    """Generator that yields progress dicts and finally a TranslateResponse."""
    progress_queue: queue.Queue = queue.Queue()
    _high_water = [0]

    def _emit(step: str, progress: int, message: str):
        progress_queue.put({"step": step, "progress": progress, "message": message})

    def _drain_monotonic():
        while not progress_queue.empty():
            try:
                evt = progress_queue.get_nowait()
            except queue.Empty:
                break
            if evt["progress"] >= _high_water[0]:
                _high_water[0] = evt["progress"]
                yield evt

    def _yield_progress(step: str, progress: int, message: str):
        if progress >= _high_water[0]:
            _high_water[0] = progress
            return {"step": step, "progress": progress, "message": message}
        return None

    # ── Step 1: Prepare (0-10%) ──
    yield {"step": "prepare", "progress": 1, "message": "กำลังอ่านไฟล์ภาพ..."}
    _high_water[0] = 1
    image = _prepare_image(image_bytes)

    yield {"step": "prepare_rgb", "progress": 2, "message": f"แปลงภาพเป็น RGB ({image.width}x{image.height})..."}

    yield {"step": "prepare_api", "progress": 3, "message": "กำลังเชื่อมต่อ Gemini API..."}
    client = _make_client(api_key)
    resolved_model = (model or DEFAULT_MODEL).strip() or DEFAULT_MODEL

    yield {"step": "prepare_analysis_img", "progress": 5, "message": f"กำลังย่อภาพสำหรับวิเคราะห์ (max 1400px)..."}
    analysis_image = _make_analysis_image(image)

    yield {"step": "prepare_clean_img", "progress": 7, "message": f"กำลังย่อภาพสำหรับ clean (max 2000px)..."}
    clean_image = _make_clean_image(image)

    yield {"step": "prepare_done", "progress": 9, "message": f"เตรียมภาพเสร็จแล้ว — ใช้โมเดล {resolved_model}"}

    # ── Step 2: Send to Gemini (analysis + clean preview in parallel) ──
    warnings: list[str] = []
    cleaned_image_base64: str | None = None
    clean_model_used = resolved_model

    yield {"step": "gemini_start", "progress": 10, "message": f"กำลังส่งภาพไปให้ Gemini ({resolved_model})..."}

    def _analysis_worker():
        _emit("analysis_send", 12, "ส่งภาพไปวิเคราะห์ข้อความ...")
        result = _run_analysis(client, resolved_model, analysis_image)
        _emit("analysis_done", 55, "Gemini วิเคราะห์ข้อความเสร็จแล้ว")
        return result

    def _clean_worker():
        _emit("clean_send", 14, "ส่งภาพไปลบข้อความต้นฉบับ...")
        result = _run_clean_preview(client, resolved_model, clean_image)
        _emit("clean_done", 88, "Gemini สร้างภาพ clean เสร็จแล้ว")
        return result

    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
        analysis_future = pool.submit(_analysis_worker)
        clean_future = pool.submit(_clean_worker)

        analysis_done = False
        clean_done = False
        poll_count = 0
        start_time = time.monotonic()

        while not (analysis_done and clean_done):
            yield from _drain_monotonic()

            if not analysis_done and analysis_future.done():
                analysis_done = True
            if not clean_done and clean_future.done():
                clean_done = True

            if not (analysis_done and clean_done):
                poll_count += 1
                elapsed = time.monotonic() - start_time
                elapsed_int = int(elapsed)

                if not analysis_done:
                    # Analysis progress: 15 → 45, grows ~1 unit/sec.
                    analysis_progress = min(45, 15 + int(elapsed))
                    msg_idx = min(elapsed_int // 3, len(_ANALYSIS_WAIT_MESSAGES) - 1)
                    msg = f"{_ANALYSIS_WAIT_MESSAGES[msg_idx]} ({elapsed_int}s)"
                    evt = _yield_progress("analysis_wait", analysis_progress, msg)
                    if evt:
                        yield evt

                elif not clean_done:
                    # Clean progress: 46 → 56, grows ~0.3 unit/sec.
                    clean_progress = min(56, 46 + int(elapsed * 0.3))
                    msg_idx = min(elapsed_int // 3, len(_CLEAN_WAIT_MESSAGES) - 1)
                    msg = f"{_CLEAN_WAIT_MESSAGES[msg_idx]} ({elapsed_int}s)"
                    evt = _yield_progress("clean_wait", clean_progress, msg)
                    if evt:
                        yield evt

                time.sleep(0.4)

        # Final drain.
        yield from _drain_monotonic()

        # Get results (timeout after 5 minutes to prevent infinite hang).
        try:
            analysis, analysis_model, analysis_warnings = analysis_future.result(timeout=300)
            warnings.extend(analysis_warnings)
        except concurrent.futures.TimeoutError:
            analysis_future.cancel()
            raise TimeoutError("Gemini analysis timed out after 5 minutes")

        try:
            clean_result, clean_model_used, clean_warnings = clean_future.result(timeout=300)
            warnings.extend(clean_warnings)
        except concurrent.futures.TimeoutError:
            clean_future.cancel()
            clean_result = None
            warnings.append("Clean preview timed out — skipped.")
        if clean_result:
            cleaned_image_base64 = clean_result

    # ── Step 3: Process Pass 1 results (58-65%) ──
    region_count = len(analysis.regions)
    detected_lang = analysis.detected_language or "ไม่ทราบ"
    print(f"[translate] Analysis done: {region_count} regions, lang={detected_lang}, model={analysis_model}, warnings={warnings}")
    if region_count == 0:
        print(f"[translate] WARNING: 0 regions from analysis. Check if the model supports structured output.")

    evt = _yield_progress("parse_lang", 58, f"ตรวจพบภาษาต้นฉบับ: {detected_lang}")
    if evt: yield evt

    evt = _yield_progress("parse_regions", 59, f"Pass 1 พบ {region_count} กล่องข้อความ")
    if evt: yield evt

    evt = _yield_progress("normalize_coords", 60, f"กำลังแปลงพิกัด {region_count} กล่อง...")
    if evt: yield evt

    normalized_regions = _normalize_regions(analysis.regions)

    evt = _yield_progress("normalize_done", 62, f"จัดรูปแบบ {len(normalized_regions)} regions เสร็จ")
    if evt: yield evt

    # ── Step 4: Pass 2 — Refinement (63-90%) ──
    # Skip refinement if Pass 1 found no regions — nothing to review.
    if not normalized_regions:
        evt = _yield_progress("ocr_fallback_start", 61, "Pass 1 returned 0 regions. Trying Gemini OCR fallback...")
        if evt: yield evt
        try:
            fallback_analysis, fallback_regions, fallback_model, fallback_warnings = _attempt_translate_ocr_fallback(
                image_bytes,
                api_key=api_key,
            )
            for warning in fallback_warnings:
                _append_warning(warnings, warning)
            if fallback_regions:
                analysis = fallback_analysis
                analysis_model = fallback_model
                normalized_regions = fallback_regions
                region_count = len(normalized_regions)
                detected_lang = analysis.detected_language or detected_lang
                evt = _yield_progress("ocr_fallback_done", 62, f"Gemini OCR fallback found {region_count} regions")
                if evt: yield evt
            else:
                evt = _yield_progress("ocr_fallback_empty", 62, "Gemini OCR fallback also found no usable regions")
                if evt: yield evt
        except Exception as exc:
            _append_warning(warnings, f"Gemini OCR fallback failed: {exc}")
            evt = _yield_progress("ocr_fallback_fail", 62, "Gemini OCR fallback failed")
            if evt: yield evt

    if not normalized_regions:
        evt = _yield_progress("refine_skip", 90, "ข้ามขั้นตอน Pass 2 เพราะไม่พบกล่องข้อความจาก Pass 1")
        if evt: yield evt
        warnings.append("Pass 1 ไม่พบกล่องข้อความ — ข้าม Pass 2")
    else:
        evt = _yield_progress("refine_start", 63, "เริ่ม Pass 2: ตรวจสอบและแก้ไขผลลัพธ์...")
        if evt: yield evt

        evt = _yield_progress("refine_render", 65, "กำลัง render ข้อความไทยลงบนภาพเพื่อตรวจสอบ...")
        if evt: yield evt

        composite = _render_regions_on_image(image, normalized_regions)

        evt = _yield_progress("refine_send", 67, "ส่งภาพที่ render แล้วไปให้ Gemini ตรวจสอบ...")
        if evt: yield evt

    if normalized_regions:
        _REFINE_WAIT_MESSAGES = [
            "Gemini กำลังตรวจสอบผลลัพธ์จาก Pass 1...",
            "Gemini กำลังเทียบข้อความกับ bubble...",
            "Gemini กำลังตรวจว่าข้อความล้น bubble หรือไม่...",
            "Gemini กำลังตรวจขนาดฟอนต์...",
            "Gemini กำลังตรวจตำแหน่งข้อความ...",
            "Gemini กำลังปรับแก้ region ที่มีปัญหา...",
            "Gemini กำลังตรวจสอบ background color...",
            "Gemini กำลังปรับคำแปลให้กระชับขึ้น...",
            "Gemini กำลังสร้างผลลัพธ์ที่แก้ไขแล้ว...",
            "เกือบเสร็จแล้ว รอ Gemini ส่งผลลัพธ์ Pass 2...",
            "รอ Gemini ตอบกลับ...",
        ]

        refine_start_time = time.monotonic()
        _refine_pool = concurrent.futures.ThreadPoolExecutor(max_workers=1)
        refine_future = _refine_pool.submit(
            _run_refinement, client, resolved_model, composite, normalized_regions
        )

        while not refine_future.done():
            yield from _drain_monotonic()
            elapsed = time.monotonic() - refine_start_time
            elapsed_int = int(elapsed)
            refine_progress = min(88, 68 + int(elapsed * 0.7))
            msg_idx = min(elapsed_int // 3, len(_REFINE_WAIT_MESSAGES) - 1)
            msg = f"{_REFINE_WAIT_MESSAGES[msg_idx]} ({elapsed_int}s)"
            evt2 = _yield_progress("refine_wait", refine_progress, msg)
            if evt2:
                yield evt2
            time.sleep(0.4)

        yield from _drain_monotonic()

        try:
            refined_regions, refine_warnings = refine_future.result(timeout=120)
            normalized_regions = refined_regions
            warnings.extend(refine_warnings)
            evt = _yield_progress("refine_done", 90, f"Pass 2 เสร็จแล้ว: {len(normalized_regions)} regions")
            if evt: yield evt
        except Exception as exc:
            warnings.append(f"Pass 2 ล้มเหลว: {exc} — ใช้ผลลัพธ์จาก Pass 1")
            evt = _yield_progress("refine_fail", 90, f"Pass 2 ล้มเหลว ใช้ผลลัพธ์จาก Pass 1")
            if evt: yield evt
        finally:
            _refine_pool.shutdown(wait=False)

    # ── Step 5: Final output (90-100%) ──
    clean_status = "สำเร็จ" if cleaned_image_base64 else "ไม่สำเร็จ"
    evt = _yield_progress("clean_status", 92, f"สถานะ Clean Preview: {clean_status}")
    if evt: yield evt

    evt = _yield_progress("build", 95, "กำลังสร้างข้อมูลผลลัพธ์...")
    if evt: yield evt

    result = TranslateResponse(
        model_used=analysis_model,
        image_width=image.width,
        image_height=image.height,
        detected_language=analysis.detected_language,
        page_notes=analysis.page_notes,
        regions=normalized_regions,
        cleaned_image_base64=cleaned_image_base64,
        warnings=warnings,
    )

    evt = _yield_progress("encode", 97, f"กำลังเข้ารหัสผลลัพธ์ ({image.width}x{image.height})...")
    if evt: yield evt

    summary = f"พบ {region_count} กล่องข้อความ, ภาษา: {detected_lang}, clean: {clean_status}"
    evt = _yield_progress("done", 100, f"เสร็จสิ้น! {summary}")
    if evt: yield evt
    yield result
