from __future__ import annotations

import base64
from pathlib import Path

import fitz

from .models import PdfPreviewPage, PdfPreviewResponse, PdfRenderResponse


def _render_page_png_bytes(page: fitz.Page, target_width: int) -> tuple[bytes, int, int]:
    page_rect = page.rect
    scale = max(target_width / page_rect.width, 0.1)
    matrix = fitz.Matrix(scale, scale)
    pixmap = page.get_pixmap(matrix=matrix, alpha=False)
    return pixmap.tobytes("png"), pixmap.width, pixmap.height


def build_pdf_preview(pdf_bytes: bytes, file_name: str, thumb_width: int = 420) -> PdfPreviewResponse:
    document = fitz.open(stream=pdf_bytes, filetype="pdf")
    try:
        pages: list[PdfPreviewPage] = []
        for page_index in range(document.page_count):
            page = document.load_page(page_index)
            png_bytes, width, height = _render_page_png_bytes(page, thumb_width)
            pages.append(
                PdfPreviewPage(
                    page_number=page_index + 1,
                    width=width,
                    height=height,
                    thumbnail_base64=base64.b64encode(png_bytes).decode("utf-8"),
                )
            )

        return PdfPreviewResponse(
            file_name=Path(file_name).name,
            page_count=document.page_count,
            selected_page=1 if document.page_count > 0 else None,
            pages=pages,
        )
    finally:
        document.close()


def render_pdf_page(
    pdf_bytes: bytes,
    file_name: str,
    page_number: int,
    page_width: int = 1600,
) -> PdfRenderResponse:
    document = fitz.open(stream=pdf_bytes, filetype="pdf")
    try:
        if page_number < 1 or page_number > document.page_count:
            raise ValueError(f"Page number {page_number} is out of range for this PDF.")

        page = document.load_page(page_number - 1)
        png_bytes, width, height = _render_page_png_bytes(page, page_width)
        return PdfRenderResponse(
            file_name=Path(file_name).name,
            page_number=page_number,
            image_width=width,
            image_height=height,
            image_base64=base64.b64encode(png_bytes).decode("utf-8"),
        )
    finally:
        document.close()

def build_translated_pdf(
    pdf_bytes: bytes,
    exported_pages: list[tuple[int, bytes]],
) -> bytes:
    if not exported_pages:
        raise ValueError("No PDF pages were provided for export.")

    source_document = fitz.open(stream=pdf_bytes, filetype="pdf")
    export_document = fitz.open()
    try:
        for page_number, image_bytes in exported_pages:
            if page_number < 1 or page_number > source_document.page_count:
                raise ValueError(f"Page number {page_number} is out of range for this PDF.")
            if not image_bytes:
                raise ValueError(f"Translated page {page_number} is empty.")

            source_page = source_document.load_page(page_number - 1)
            exported_page = export_document.new_page(width=source_page.rect.width, height=source_page.rect.height)
            exported_page.insert_image(exported_page.rect, stream=image_bytes, keep_proportion=False)

        return export_document.tobytes(garbage=3, deflate=True)
    finally:
        export_document.close()
        source_document.close()
