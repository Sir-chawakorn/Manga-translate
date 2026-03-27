from __future__ import annotations

import asyncio
import json
import re
import tempfile
from pathlib import Path

from fastapi import FastAPI, File, Form, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, StreamingResponse

from .gemini_service import DEFAULT_MODEL, OCR_MODEL, clean_and_suggest_page, clean_text_only, edit_image, extract_page_ocr, translate_page, translate_page_stream
from .models import CleanSuggestResponse, EditImageResponse, OcrPageResponse, PdfPreviewResponse, PdfRenderResponse, TranslateResponse
from .pdf_service import build_pdf_preview, build_translated_pdf, render_pdf_page
from .rag_store import (
    build_document_key,
    clear_store_data,
    create_backup,
    get_store_stats,
    list_backups,
    list_context_corpus_entries,
    list_context_documents,
    list_glossary_entries,
    list_ocr_pages,
    list_translation_memory_entries,
    merge_store,
    restore_backup,
    upsert_translation_memory,
)

# Maximum allowed render dimensions to prevent OOM.
MAX_RENDER_WIDTH = 4000
MAX_THUMB_WIDTH = 1000


def _parse_json_form_field(raw_value: str | None, *, field_name: str, default: object) -> object:
    if raw_value in (None, ""):
        return default
    try:
        return json.loads(raw_value)
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=400, detail=f"{field_name} payload is invalid JSON.") from exc


async def _save_uploaded_sqlite_temp(file: UploadFile) -> Path:
    file_name = file.filename or "rag-store.sqlite3"
    if not file_name.lower().endswith(".sqlite3"):
        raise HTTPException(status_code=400, detail="Please upload a .sqlite3 backup file.")

    file_bytes = await file.read()
    await file.close()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="The uploaded backup file is empty.")

    with tempfile.NamedTemporaryFile(suffix=".sqlite3", delete=False) as temp_file:
        temp_path = Path(temp_file.name)
        temp_file.write(file_bytes)
    return temp_path


def _cleanup_temp_path(path: Path | None) -> None:
    if path is None:
        return
    try:
        path.unlink(missing_ok=True)
    except PermissionError:
        pass
    except OSError:
        pass

app = FastAPI(title="Manga Translate Studio API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "file://"],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


@app.get("/health")
def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/translate", response_model=TranslateResponse)
async def translate_manga_page(
    file: UploadFile = File(...),
    api_key: str | None = Form(default=None),
    model: str = Form(default=DEFAULT_MODEL),
) -> TranslateResponse:
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Please upload an image file.")

    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="The uploaded file is empty.")

    try:
        return await asyncio.to_thread(
            translate_page,
            image_bytes=image_bytes,
            api_key=api_key,
            model=model,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Gemini request failed: {exc}") from exc


@app.post("/api/translate-stream")
async def translate_manga_page_stream(
    file: UploadFile = File(...),
    api_key: str | None = Form(default=None),
    model: str = Form(default=DEFAULT_MODEL),
):
    """SSE endpoint that streams progress events, then the final result."""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Please upload an image file.")

    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="The uploaded file is empty.")

    async def _generate():
        q: asyncio.Queue = asyncio.Queue()
        loop = asyncio.get_running_loop()

        def _run_sync():
            try:
                for event in translate_page_stream(image_bytes=image_bytes, api_key=api_key, model=model):
                    if isinstance(event, TranslateResponse):
                        loop.call_soon_threadsafe(q.put_nowait, ("result", event.model_dump_json()))
                    else:
                        loop.call_soon_threadsafe(q.put_nowait, ("progress", json.dumps(event, ensure_ascii=False)))
            except Exception as exc:
                loop.call_soon_threadsafe(q.put_nowait, ("error", json.dumps({"error": str(exc)}, ensure_ascii=False)))
            finally:
                loop.call_soon_threadsafe(q.put_nowait, (None, None))

        task = loop.run_in_executor(None, _run_sync)

        try:
            while True:
                event_type, data = await q.get()
                if event_type is None:
                    break
                yield f"event: {event_type}\ndata: {data}\n\n"
        finally:
            await task

    return StreamingResponse(_generate(), media_type="text/event-stream")


@app.post("/api/edit-image", response_model=EditImageResponse)
async def edit_manga_image(
    file: UploadFile = File(...),
    prompt: str = Form(...),
    api_key: str | None = Form(default=None),
    model: str = Form(default=DEFAULT_MODEL),
) -> EditImageResponse:
    """Send a painted image + prompt to Gemini for editing."""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Please upload an image file.")

    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="The uploaded file is empty.")

    if not prompt.strip():
        raise HTTPException(status_code=400, detail="Please provide an edit prompt.")

    try:
        return await asyncio.to_thread(
            edit_image,
            image_bytes=image_bytes,
            prompt=prompt.strip(),
            api_key=api_key,
            model=model,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Gemini edit failed: {exc}") from exc


@app.post("/api/ocr/page", response_model=OcrPageResponse)
async def ocr_page(
    file: UploadFile = File(...),
    page_number: int | None = Form(default=None),
    api_key: str | None = Form(default=None),
    model: str | None = Form(default=OCR_MODEL),
    document_key: str | None = Form(default=None),
) -> OcrPageResponse:
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Please upload an image file.")

    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="The uploaded file is empty.")

    try:
        return await asyncio.to_thread(
            extract_page_ocr,
            image_bytes=image_bytes,
            page_number=page_number,
            api_key=api_key,
            model=model,
            document_key=document_key,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Gemini OCR failed: {exc}") from exc


@app.post("/api/clean-only")
async def clean_manga_page(
    file: UploadFile = File(...),
    api_key: str | None = Form(default=None),
    model: str = Form(default=DEFAULT_MODEL),
):
    """Remove all text from a manga page without adding translations."""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Please upload an image file.")

    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="The uploaded file is empty.")

    try:
        return await asyncio.to_thread(
            clean_text_only,
            image_bytes=image_bytes,
            api_key=api_key,
            model=model,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Gemini clean failed: {exc}") from exc


@app.post("/api/clean-suggest", response_model=CleanSuggestResponse)
async def clean_and_suggest_manga_page(
    file: UploadFile = File(...),
    api_key: str | None = Form(default=None),
    clean_model: str = Form(default=DEFAULT_MODEL),
    suggestion_model: str | None = Form(default=None),
    ocr_model: str | None = Form(default=OCR_MODEL),
    document_key: str | None = Form(default=None),
    source_kind: str | None = Form(default=None),
    source_path: str | None = Form(default=None),
    source_name: str | None = Form(default=None),
    project_path: str | None = Form(default=None),
    page_number: int | None = Form(default=None),
    current_ocr_json: str | None = Form(default=None),
    nearby_ocr_json: str | None = Form(default=None),
    translation_memory_json: str | None = Form(default=None),
    approved_translations_json: str | None = Form(default=None),
    glossary_json: str | None = Form(default=None),
) -> CleanSuggestResponse:
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Please upload an image file.")

    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="The uploaded file is empty.")

    current_ocr_page = _parse_json_form_field(current_ocr_json, field_name="current_ocr_json", default=None)
    nearby_ocr_pages = _parse_json_form_field(nearby_ocr_json, field_name="nearby_ocr_json", default=[])
    translation_memory = _parse_json_form_field(translation_memory_json, field_name="translation_memory_json", default=[])
    approved_translations = _parse_json_form_field(approved_translations_json, field_name="approved_translations_json", default=[])
    glossary_entries = _parse_json_form_field(glossary_json, field_name="glossary_json", default=[])

    try:
        return await asyncio.to_thread(
            clean_and_suggest_page,
            image_bytes=image_bytes,
            current_ocr_page=current_ocr_page,
            nearby_ocr_pages=nearby_ocr_pages,
            translation_memory=translation_memory,
            approved_translations=approved_translations,
            glossary_entries=glossary_entries,
            api_key=api_key,
            clean_model=clean_model,
            suggestion_model=suggestion_model,
            ocr_model=ocr_model,
            document_key=document_key,
            source_kind=source_kind,
            source_path=source_path,
            source_name=source_name,
            project_path=project_path,
            page_number=page_number,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Clean+Suggest failed: {exc}") from exc


@app.post("/api/rag/translation-memory/upsert")
async def upsert_translation_memory_entries(
    document_key: str | None = Form(default=None),
    source_kind: str | None = Form(default=None),
    source_path: str | None = Form(default=None),
    source_name: str | None = Form(default=None),
    project_path: str | None = Form(default=None),
    entries_json: str | None = Form(default=None),
) -> dict[str, object]:
    entries = _parse_json_form_field(entries_json, field_name="entries_json", default=[])
    if not isinstance(entries, list):
        raise HTTPException(status_code=400, detail="entries_json must be a JSON array.")

    resolved_document_key = build_document_key(
        source_kind=source_kind,
        source_path=source_path,
        source_name=source_name,
        project_path=project_path,
        document_key=document_key,
    )
    inserted = upsert_translation_memory(document_key=resolved_document_key, entries=entries)
    return {
        "document_key": resolved_document_key,
        "inserted": inserted,
    }


@app.get("/api/rag/admin/stats")
async def rag_admin_stats(
    document_key: str | None = Query(default=None),
    include_global: bool = Query(default=True),
) -> dict[str, object]:
    return get_store_stats(document_key=document_key, include_global=include_global)


@app.get("/api/rag/admin/translation-memory")
async def rag_admin_translation_memory(
    document_key: str | None = Query(default=None),
    include_global: bool = Query(default=True),
    query: str | None = Query(default=None),
    page_key: str | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
) -> dict[str, object]:
    return list_translation_memory_entries(
        document_key=document_key,
        include_global=include_global,
        query=query,
        page_key=page_key,
        limit=limit,
        offset=offset,
    )


@app.get("/api/rag/admin/glossary")
async def rag_admin_glossary(
    document_key: str | None = Query(default=None),
    include_global: bool = Query(default=True),
    query: str | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
) -> dict[str, object]:
    return list_glossary_entries(
        document_key=document_key,
        include_global=include_global,
        query=query,
        limit=limit,
        offset=offset,
    )


@app.get("/api/rag/admin/ocr-pages")
async def rag_admin_ocr_pages(
    document_key: str | None = Query(default=None),
    include_global: bool = Query(default=False),
    page_number: int | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
) -> dict[str, object]:
    return list_ocr_pages(
        document_key=document_key,
        include_global=include_global,
        page_number=page_number,
        limit=limit,
        offset=offset,
    )


@app.get("/api/rag/admin/context-documents")
async def rag_admin_context_documents(
    document_key: str | None = Query(default=None),
    include_global: bool = Query(default=True),
    source_type: str | None = Query(default=None),
    import_status: str | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=200),
) -> dict[str, object]:
    items = list_context_documents(
        document_key=document_key,
        include_global=include_global,
        source_type=source_type,
        import_status=import_status,
        limit=limit,
    )
    return {
        "table": "context_documents",
        "total": len(items),
        "limit": limit,
        "items": items,
    }


@app.get("/api/rag/admin/context-corpus")
async def rag_admin_context_corpus(
    document_key: str | None = Query(default=None),
    include_global: bool = Query(default=True),
    source_id: str | None = Query(default=None),
    query: str | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
) -> dict[str, object]:
    return list_context_corpus_entries(
        document_key=document_key,
        include_global=include_global,
        source_id=source_id,
        query=query,
        limit=limit,
        offset=offset,
    )


@app.post("/api/rag/admin/clear")
async def rag_admin_clear(
    table: str = Form(...),
    confirm: bool = Form(default=False),
    dry_run: bool = Form(default=False),
    document_key: str | None = Form(default=None),
    source_id: str | None = Form(default=None),
    page_number: int | None = Form(default=None),
    page_key: str | None = Form(default=None),
) -> dict[str, object]:
    if not confirm:
        raise HTTPException(status_code=400, detail="Set confirm=true before clearing RAG data.")
    try:
        return clear_store_data(
            table=table,
            document_key=document_key,
            source_id=source_id,
            page_number=page_number,
            page_key=page_key,
            dry_run=dry_run,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.post("/api/rag/admin/backup")
async def rag_admin_backup(
    destination: str | None = Form(default=None),
) -> dict[str, object]:
    safe_destination = Path(destination).name if destination else None
    return create_backup(destination=safe_destination)


@app.get("/api/rag/admin/backups")
async def rag_admin_backups() -> dict[str, object]:
    items = list_backups()
    return {
        "total": len(items),
        "items": items,
    }


@app.post("/api/rag/admin/restore")
async def rag_admin_restore(
    file: UploadFile = File(...),
    confirm: bool = Form(default=False),
    create_pre_restore_backup: bool = Form(default=True),
) -> dict[str, object]:
    if not confirm:
        raise HTTPException(status_code=400, detail="Set confirm=true before restoring the RAG database.")
    temp_path = await _save_uploaded_sqlite_temp(file)
    try:
        return restore_backup(
            backup_path=temp_path,
            create_pre_restore_backup=create_pre_restore_backup,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    finally:
        _cleanup_temp_path(temp_path)


@app.post("/api/rag/admin/merge")
async def rag_admin_merge(
    file: UploadFile = File(...),
    tables_json: str | None = Form(default=None),
) -> dict[str, object]:
    selected_tables = _parse_json_form_field(tables_json, field_name="tables_json", default=list())
    if selected_tables is not None and not isinstance(selected_tables, list):
        raise HTTPException(status_code=400, detail="tables_json must be a JSON array.")
    temp_path = await _save_uploaded_sqlite_temp(file)
    try:
        return merge_store(
            source_path=temp_path,
            tables=selected_tables or None,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    finally:
        _cleanup_temp_path(temp_path)


@app.post("/api/pdf/preview", response_model=PdfPreviewResponse)
async def preview_pdf(
    file: UploadFile = File(...),
    thumb_width: int = Form(default=420),
) -> PdfPreviewResponse:
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Please upload a PDF file.")

    pdf_bytes = await file.read()
    if not pdf_bytes:
        raise HTTPException(status_code=400, detail="The uploaded PDF is empty.")

    thumb_width = max(50, min(thumb_width, MAX_THUMB_WIDTH))

    try:
        return build_pdf_preview(pdf_bytes=pdf_bytes, file_name=file.filename or "document.pdf", thumb_width=thumb_width)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"PDF preview failed: {exc}") from exc


@app.post("/api/pdf/render-page", response_model=PdfRenderResponse)
async def pdf_render_page(
    file: UploadFile = File(...),
    page_number: int = Form(...),
    page_width: int = Form(default=1600),
) -> PdfRenderResponse:
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Please upload a PDF file.")

    pdf_bytes = await file.read()
    if not pdf_bytes:
        raise HTTPException(status_code=400, detail="The uploaded PDF is empty.")

    if page_number < 1:
        raise HTTPException(status_code=400, detail="Page number must be at least 1.")

    page_width = max(100, min(page_width, MAX_RENDER_WIDTH))

    try:
        return render_pdf_page(
            pdf_bytes=pdf_bytes,
            file_name=file.filename or "document.pdf",
            page_number=page_number,
            page_width=page_width,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"PDF page render failed: {exc}") from exc


@app.post("/api/pdf/export")
async def export_translated_pdf(
    file: UploadFile = File(...),
    page_numbers_json: str = Form(...),
    images: list[UploadFile] = File(...),
) -> Response:
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Please upload a PDF file.")

    pdf_bytes = await file.read()
    if not pdf_bytes:
        raise HTTPException(status_code=400, detail="The uploaded PDF is empty.")

    try:
        page_numbers = json.loads(page_numbers_json)
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=400, detail="The selected PDF pages payload is invalid.") from exc

    if not isinstance(page_numbers, list) or not page_numbers:
        raise HTTPException(status_code=400, detail="Select at least one PDF page to export.")
    if len(images) != len(page_numbers):
        raise HTTPException(status_code=400, detail="Each exported PDF page must include a rendered image.")

    exported_pages: list[tuple[int, bytes]] = []
    for index, (page_number, image_file) in enumerate(zip(page_numbers, images, strict=True), start=1):
        if not isinstance(page_number, int):
            raise HTTPException(status_code=400, detail=f"Export page #{index} is invalid.")
        if image_file.content_type and not image_file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail=f"Export page {page_number} must be an image.")

        image_bytes = await image_file.read()
        if not image_bytes:
            raise HTTPException(status_code=400, detail=f"Export page {page_number} is empty.")

        exported_pages.append((page_number, image_bytes))

    try:
        pdf_output = build_translated_pdf(pdf_bytes=pdf_bytes, exported_pages=exported_pages)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"PDF export failed: {exc}") from exc

    raw_stem = Path(file.filename or "translated-document.pdf").stem
    safe_stem = re.sub(r'[^\w\s\-]', '', raw_stem).strip() or "translated"
    safe_stem = safe_stem[:100]  # Limit filename length.
    download_name = f"{safe_stem}-thai.pdf"
    return Response(
        content=pdf_output,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{download_name}"'},
    )
