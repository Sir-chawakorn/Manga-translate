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
    background_color: str = Field(description="CSS color for the box fill behind translated text.")
    notes: str = Field(description="Short placement or tone note for the editor.")


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
    notes: str = ""


class TranslateResponse(BaseModel):
    model_used: str
    image_width: int
    image_height: int
    detected_language: str
    page_notes: str
    regions: list[RegionPayload]
    cleaned_image_base64: str | None = None
    warnings: list[str] = Field(default_factory=list)
