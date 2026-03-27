from __future__ import annotations

from pydantic import BaseModel, Field


class RegionAnalysis(BaseModel):
    id: str = Field(description="Stable id like bubble_1, caption_2, or sfx_3.")
    kind: str = Field(description="dialogue, caption, sign, sfx, narration, or other.")
    source_text: str = Field(description="Original text found in the page.")
    translated_text: str = Field(description="Natural Thai translation ready to render.")
    x: float = Field(description="Top-left X coordinate normalized to a 0-1000 grid.")
    y: float = Field(description="Top-left Y coordinate normalized to a 0-1000 grid.")
    width: float = Field(description="Box width normalized to a 0-1000 grid.")
    height: float = Field(description="Box height normalized to a 0-1000 grid.")
    font_size: int = Field(description="Suggested font size in pixels for the original page.")
    alignment: str = Field(description="left, center, or right.")
    text_color: str = Field(description="CSS color for translated text.")
    background_color: str = Field(
        description="CSS color behind translated text. Use transparent when the clean image should preserve the original art or SFX plate without a new box."
    )
    font_style: str = Field(
        description="One of: normal, shout, whisper, narration, handwritten, comic, bold_display. "
        "Choose based on how the text looks and feels in context."
    )
    font_name: str = Field(
        description="Pick one Thai font name from the available catalog that best matches "
        "the original text's visual style. Choose based on weight, roundness, formality, and mood."
    )
    font_weight: str = Field(
        description="normal or bold. Use bold for shouting, emphasis, titles, SFX, or thick original text. "
        "Use normal for standard dialogue and narration."
    )
    notes: str = Field(description="Short placement or tone note for the editor.")
    review_state: str = Field(
        default="approved",
        description="approved for final translations or suggested for OCR-assisted draft regions."
    )


class PageAnalysis(BaseModel):
    detected_language: str = Field(description="Best guess for the source page language.")
    page_notes: str = Field(description="Short note about reading order or page style.")
    regions: list[RegionAnalysis] = Field(description="All editable text regions in reading order.")


class RegionPayload(BaseModel):
    id: str
    kind: str
    source_text: str
    translated_text: str
    x: float
    y: float
    width: float
    height: float
    font_size: int
    alignment: str
    text_color: str
    background_color: str
    font_style: str = "normal"
    font_name: str = ""
    font_weight: str = "normal"
    notes: str = ""
    review_state: str = "approved"


class TranslateResponse(BaseModel):
    model_used: str
    image_width: int
    image_height: int
    detected_language: str
    page_notes: str
    regions: list[RegionPayload]
    cleaned_image_base64: str | None = None
    warnings: list[str] = Field(default_factory=list)


class OcrTextBlock(BaseModel):
    id: str
    page_number: int | None = None
    text: str
    confidence: float = Field(description="OCR confidence score between 0 and 1.")
    x: float = Field(description="Top-left X coordinate normalized to a 0-1000 grid.")
    y: float = Field(description="Top-left Y coordinate normalized to a 0-1000 grid.")
    width: float = Field(description="Box width normalized to a 0-1000 grid.")
    height: float = Field(description="Box height normalized to a 0-1000 grid.")
    polygon: list[list[float]] = Field(default_factory=list, description="Normalized OCR polygon points.")


class OcrPageResponse(BaseModel):
    page_number: int | None = None
    image_width: int
    image_height: int
    raw_text: str = ""
    blocks: list[OcrTextBlock] = Field(default_factory=list)
    avg_confidence: float = 0.0
    engine_used: str = "gemini-vision-ocr"
    warnings: list[str] = Field(default_factory=list)


class GeminiOcrBlock(BaseModel):
    text: str = ""
    confidence: float = 0.0
    x: float = 0.0
    y: float = 0.0
    width: float = 0.0
    height: float = 0.0
    polygon: list[list[float]] = Field(default_factory=list)


class GeminiOcrAnalysis(BaseModel):
    detected_language: str = "unknown"
    page_notes: str = ""
    blocks: list[GeminiOcrBlock] = Field(default_factory=list)


class CleanSuggestResponse(BaseModel):
    clean_model_used: str
    suggestion_model_used: str
    suggestion_provider: str = "gemini-rag"
    image_width: int
    image_height: int
    detected_language: str
    page_notes: str
    ocr_blocks_used: int = 0
    regions: list[RegionPayload] = Field(default_factory=list)
    cleaned_image_base64: str | None = None
    warnings: list[str] = Field(default_factory=list)


class PdfPreviewPage(BaseModel):
    page_number: int
    width: int
    height: int
    thumbnail_base64: str


class PdfPreviewResponse(BaseModel):
    file_name: str
    page_count: int
    selected_page: int | None = None
    pages: list[PdfPreviewPage]


class EditImageResponse(BaseModel):
    edited_image_base64: str
    warnings: list[str] = Field(default_factory=list)


class PdfRenderResponse(BaseModel):
    file_name: str
    page_number: int
    image_width: int
    image_height: int
    image_base64: str
