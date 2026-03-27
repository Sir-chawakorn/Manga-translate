from __future__ import annotations

import json
import os
import re
import sqlite3
import threading
import tempfile
import unicodedata
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable

from .models import OcrPageResponse


PROJECT_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_DB_PATH = PROJECT_ROOT / "backend" / "data" / "rag_store.sqlite3"
_DB_PATH = Path(os.getenv("RAG_DATABASE_PATH", str(DEFAULT_DB_PATH))).expanduser()
_DB_LOCK = threading.RLock()
GLOBAL_DOCUMENT_KEY = "__global__"
BACKUP_DIR = _DB_PATH.parent / "backups"

RAG_TABLES = (
    "ocr_pages",
    "translation_memory",
    "glossary_terms",
    "context_documents",
    "context_corpus",
)
RAG_TABLE_UPDATED_AT_COLUMNS = {
    "ocr_pages": "updated_at",
    "translation_memory": "last_seen_at",
    "glossary_terms": "last_seen_at",
    "context_documents": "updated_at",
    "context_corpus": "updated_at",
}
RAG_ADMIN_LIST_LIMIT_MAX = 200

_LOOKUP_PUNCT_RE = re.compile(r"[^\w\u3040-\u30ff\u3400-\u9fff]+", re.UNICODE)


def _utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def get_database_path() -> Path:
    return _DB_PATH


def build_document_key(
    *,
    source_kind: str | None = None,
    source_path: str | None = None,
    source_name: str | None = None,
    project_path: str | None = None,
    document_key: str | None = None,
) -> str:
    if document_key:
        return str(document_key).strip()

    normalized_kind = str(source_kind or "image").strip().lower() or "image"
    if source_path:
        return f"{normalized_kind}|{str(source_path).strip().lower()}"
    if project_path:
        return f"project|{str(project_path).strip().lower()}"
    if source_name:
        return f"{normalized_kind}|{str(source_name).strip()}"
    return normalized_kind


def normalize_lookup_text(value: str | None) -> str:
    text = unicodedata.normalize("NFKC", str(value or ""))
    text = " ".join(text.split()).strip().lower()
    if not text:
        return ""
    text = _LOOKUP_PUNCT_RE.sub(" ", text)
    return " ".join(text.split()).strip()


def _ensure_parent_dir() -> None:
    _DB_PATH.parent.mkdir(parents=True, exist_ok=True)


def _connect() -> sqlite3.Connection:
    _ensure_parent_dir()
    connection = sqlite3.connect(_DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def _connect_path(path: str | Path) -> sqlite3.Connection:
    resolved_path = Path(path).expanduser()
    resolved_path.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(resolved_path)
    connection.row_factory = sqlite3.Row
    return connection


def _normalize_list_limit(limit: int, *, default: int = 50, maximum: int = RAG_ADMIN_LIST_LIMIT_MAX) -> int:
    try:
        resolved_limit = int(limit or default)
    except (TypeError, ValueError):
        resolved_limit = default
    return max(1, min(maximum, resolved_limit))


def _normalize_list_offset(offset: int) -> int:
    try:
        resolved_offset = int(offset or 0)
    except (TypeError, ValueError):
        resolved_offset = 0
    return max(0, resolved_offset)


def _build_document_scope_clause(
    document_key: str | None,
    *,
    include_global: bool = False,
) -> tuple[str, list[object]]:
    keys = _resolve_document_keys(document_key, include_global=include_global) if document_key else []
    if not keys:
        return "", []
    return f"document_key IN ({','.join('?' for _ in keys)})", list(keys)


def _json_or_default(raw_value: object, default: object) -> object:
    try:
        return json.loads(str(raw_value or ""))
    except (TypeError, ValueError, json.JSONDecodeError):
        return default


def _list_existing_tables(connection: sqlite3.Connection) -> set[str]:
    rows = connection.execute(
        """
        SELECT name
        FROM sqlite_master
        WHERE type = 'table'
        """
    ).fetchall()
    return {str(row[0] or "") for row in rows}


def _validate_rag_database(
    path: str | Path,
    *,
    required_tables: Iterable[str] | None = None,
) -> dict[str, object]:
    resolved_path = Path(path).expanduser()
    if not resolved_path.exists():
        raise ValueError(f"SQLite file not found: {resolved_path}")
    try:
        with _connect_path(resolved_path) as connection:
            tables = _list_existing_tables(connection)
    except sqlite3.DatabaseError as exc:
        raise ValueError(f"Invalid SQLite database: {resolved_path}") from exc
    selected_required_tables = [
        str(table_name).strip()
        for table_name in (required_tables or RAG_TABLES)
        if str(table_name).strip() in RAG_TABLES
    ]
    missing_tables = [table_name for table_name in selected_required_tables if table_name not in tables]
    if missing_tables:
        raise ValueError(
            "SQLite database is missing required RAG tables: "
            + ", ".join(missing_tables)
        )
    return {
        "path": str(resolved_path),
        "tables": sorted(table for table in tables if table in RAG_TABLES),
        "size_bytes": resolved_path.stat().st_size,
    }


def _cleanup_temp_sqlite_artifacts(path: str | Path) -> None:
    resolved_path = Path(path).expanduser()
    for candidate in (
        resolved_path,
        resolved_path.with_name(f"{resolved_path.name}-wal"),
        resolved_path.with_name(f"{resolved_path.name}-shm"),
    ):
        try:
            candidate.unlink(missing_ok=True)
        except PermissionError:
            continue
        except OSError:
            continue


def initialize_store() -> None:
    with _DB_LOCK:
        with _connect() as connection:
            connection.executescript(
                """
                PRAGMA journal_mode=WAL;

                CREATE TABLE IF NOT EXISTS ocr_pages (
                    document_key TEXT NOT NULL,
                    page_number INTEGER NOT NULL,
                    image_hash TEXT NOT NULL,
                    image_width INTEGER NOT NULL,
                    image_height INTEGER NOT NULL,
                    detected_language TEXT NOT NULL DEFAULT 'unknown',
                    page_notes TEXT NOT NULL DEFAULT '',
                    raw_text TEXT NOT NULL DEFAULT '',
                    avg_confidence REAL NOT NULL DEFAULT 0,
                    blocks_json TEXT NOT NULL DEFAULT '[]',
                    warnings_json TEXT NOT NULL DEFAULT '[]',
                    engine_used TEXT NOT NULL DEFAULT 'gemini-vision-ocr',
                    updated_at TEXT NOT NULL,
                    PRIMARY KEY (document_key, page_number, image_hash)
                );

                CREATE INDEX IF NOT EXISTS idx_ocr_pages_lookup
                    ON ocr_pages (document_key, page_number, updated_at DESC);

                CREATE TABLE IF NOT EXISTS translation_memory (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    document_key TEXT NOT NULL,
                    page_key TEXT NOT NULL DEFAULT '',
                    source_text TEXT NOT NULL,
                    source_text_norm TEXT NOT NULL,
                    translated_text TEXT NOT NULL,
                    kind TEXT NOT NULL DEFAULT '',
                    notes TEXT NOT NULL DEFAULT '',
                    review_state TEXT NOT NULL DEFAULT 'approved',
                    usage_count INTEGER NOT NULL DEFAULT 1,
                    last_seen_at TEXT NOT NULL,
                    UNIQUE (document_key, page_key, source_text_norm, translated_text)
                );

                CREATE INDEX IF NOT EXISTS idx_translation_memory_lookup
                    ON translation_memory (document_key, source_text_norm, last_seen_at DESC);

                CREATE TABLE IF NOT EXISTS glossary_terms (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    document_key TEXT NOT NULL,
                    source_term TEXT NOT NULL,
                    source_term_norm TEXT NOT NULL,
                    target_term TEXT NOT NULL,
                    notes TEXT NOT NULL DEFAULT '',
                    locked INTEGER NOT NULL DEFAULT 1,
                    last_seen_at TEXT NOT NULL,
                    UNIQUE (document_key, source_term_norm, target_term)
                );

                CREATE INDEX IF NOT EXISTS idx_glossary_terms_lookup
                    ON glossary_terms (document_key, source_term_norm, last_seen_at DESC);

                CREATE TABLE IF NOT EXISTS context_documents (
                    document_key TEXT NOT NULL,
                    source_id TEXT NOT NULL,
                    title TEXT NOT NULL DEFAULT '',
                    title_reading TEXT NOT NULL DEFAULT '',
                    author_name TEXT NOT NULL DEFAULT '',
                    card_url TEXT NOT NULL DEFAULT '',
                    text_url TEXT NOT NULL DEFAULT '',
                    html_url TEXT NOT NULL DEFAULT '',
                    source_type TEXT NOT NULL DEFAULT '',
                    license_label TEXT NOT NULL DEFAULT '',
                    import_status TEXT NOT NULL DEFAULT 'ready',
                    chunk_count INTEGER NOT NULL DEFAULT 0,
                    fetched_at TEXT NOT NULL DEFAULT '',
                    metadata_json TEXT NOT NULL DEFAULT '{}',
                    updated_at TEXT NOT NULL,
                    PRIMARY KEY (document_key, source_id)
                );

                CREATE INDEX IF NOT EXISTS idx_context_documents_lookup
                    ON context_documents (document_key, source_type, updated_at DESC);

                CREATE TABLE IF NOT EXISTS context_corpus (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    document_key TEXT NOT NULL,
                    source_id TEXT NOT NULL,
                    chunk_index INTEGER NOT NULL,
                    title TEXT NOT NULL DEFAULT '',
                    author_name TEXT NOT NULL DEFAULT '',
                    source_url TEXT NOT NULL DEFAULT '',
                    source_type TEXT NOT NULL DEFAULT '',
                    license_label TEXT NOT NULL DEFAULT '',
                    text_chunk TEXT NOT NULL,
                    text_chunk_norm TEXT NOT NULL,
                    metadata_json TEXT NOT NULL DEFAULT '{}',
                    updated_at TEXT NOT NULL,
                    UNIQUE (document_key, source_id, chunk_index)
                );

                CREATE INDEX IF NOT EXISTS idx_context_corpus_lookup
                    ON context_corpus (document_key, source_id, chunk_index);
                """
            )


def upsert_ocr_page(
    *,
    document_key: str,
    page_number: int,
    image_hash: str,
    ocr_page: OcrPageResponse,
    detected_language: str = "unknown",
    page_notes: str = "",
) -> None:
    initialize_store()
    with _DB_LOCK:
        with _connect() as connection:
            connection.execute(
                """
                INSERT INTO ocr_pages (
                    document_key,
                    page_number,
                    image_hash,
                    image_width,
                    image_height,
                    detected_language,
                    page_notes,
                    raw_text,
                    avg_confidence,
                    blocks_json,
                    warnings_json,
                    engine_used,
                    updated_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(document_key, page_number, image_hash) DO UPDATE SET
                    image_width = excluded.image_width,
                    image_height = excluded.image_height,
                    detected_language = excluded.detected_language,
                    page_notes = excluded.page_notes,
                    raw_text = excluded.raw_text,
                    avg_confidence = excluded.avg_confidence,
                    blocks_json = excluded.blocks_json,
                    warnings_json = excluded.warnings_json,
                    engine_used = excluded.engine_used,
                    updated_at = excluded.updated_at
                """,
                (
                    document_key,
                    int(page_number),
                    str(image_hash),
                    int(ocr_page.image_width),
                    int(ocr_page.image_height),
                    str(detected_language or "unknown"),
                    str(page_notes or ""),
                    str(ocr_page.raw_text or ""),
                    float(ocr_page.avg_confidence or 0),
                    json.dumps([block.model_dump() for block in ocr_page.blocks], ensure_ascii=False),
                    json.dumps(list(ocr_page.warnings or []), ensure_ascii=False),
                    str(ocr_page.engine_used or "gemini-vision-ocr"),
                    _utc_now_iso(),
                ),
            )


def get_cached_ocr_page(*, document_key: str, page_number: int, image_hash: str) -> OcrPageResponse | None:
    initialize_store()
    with _DB_LOCK:
        with _connect() as connection:
            row = connection.execute(
                """
                SELECT *
                FROM ocr_pages
                WHERE document_key = ? AND page_number = ? AND image_hash = ?
                LIMIT 1
                """,
                (document_key, int(page_number), str(image_hash)),
            ).fetchone()

    if not row:
        return None

    blocks = json.loads(row["blocks_json"] or "[]")
    warnings = json.loads(row["warnings_json"] or "[]")
    return OcrPageResponse(
        page_number=int(row["page_number"]),
        image_width=int(row["image_width"]),
        image_height=int(row["image_height"]),
        raw_text=str(row["raw_text"] or ""),
        blocks=blocks,
        avg_confidence=float(row["avg_confidence"] or 0),
        engine_used=str(row["engine_used"] or "gemini-vision-ocr"),
        warnings=[str(item) for item in warnings],
    )


def get_nearby_ocr_pages(
    *,
    document_key: str,
    center_page_number: int,
    distance: int = 2,
    limit: int = 4,
) -> list[OcrPageResponse]:
    initialize_store()
    start_page = max(1, int(center_page_number) - max(1, int(distance)))
    end_page = int(center_page_number) + max(1, int(distance))

    with _DB_LOCK:
        with _connect() as connection:
            rows = connection.execute(
                """
                SELECT *
                FROM ocr_pages
                WHERE document_key = ?
                  AND page_number BETWEEN ? AND ?
                  AND page_number != ?
                ORDER BY page_number ASC, updated_at DESC
                """,
                (document_key, start_page, end_page, int(center_page_number)),
            ).fetchall()

    pages: list[OcrPageResponse] = []
    seen_pages: set[int] = set()
    for row in rows:
        page_number = int(row["page_number"])
        if page_number in seen_pages:
            continue
        seen_pages.add(page_number)
        blocks = json.loads(row["blocks_json"] or "[]")
        warnings = json.loads(row["warnings_json"] or "[]")
        pages.append(
            OcrPageResponse(
                page_number=page_number,
                image_width=int(row["image_width"]),
                image_height=int(row["image_height"]),
                raw_text=str(row["raw_text"] or ""),
                blocks=blocks,
                avg_confidence=float(row["avg_confidence"] or 0),
                engine_used=str(row["engine_used"] or "gemini-vision-ocr"),
                warnings=[str(item) for item in warnings],
            )
        )
        if len(pages) >= max(1, int(limit)):
            break
    return pages


def _iter_unique_memory_entries(entries: Iterable[dict] | None) -> list[tuple[str, str, str, str, str, str]]:
    unique: list[tuple[str, str, str, str, str, str]] = []
    seen: set[tuple[str, str, str]] = set()
    for item in entries or []:
        if not isinstance(item, dict):
            continue
        source_text = " ".join(str(item.get("source_text") or "").split()).strip()
        translated_text = " ".join(str(item.get("translated_text") or "").split()).strip()
        if not source_text or not translated_text:
            continue
        page_key = str(item.get("page_key") or "").strip()
        source_norm = normalize_lookup_text(source_text)
        if not source_norm:
            continue
        pair = (page_key, source_norm, translated_text)
        if pair in seen:
            continue
        seen.add(pair)
        unique.append(
            (
                page_key,
                source_text,
                source_norm,
                translated_text,
                str(item.get("kind") or "").strip(),
                str(item.get("notes") or "").strip(),
            )
        )
    return unique


def upsert_translation_memory(*, document_key: str, entries: Iterable[dict] | None) -> int:
    initialize_store()
    normalized_entries = _iter_unique_memory_entries(entries)
    if not normalized_entries:
        return 0

    now = _utc_now_iso()
    with _DB_LOCK:
        with _connect() as connection:
            for page_key, source_text, source_norm, translated_text, kind, notes in normalized_entries:
                connection.execute(
                    """
                    INSERT INTO translation_memory (
                        document_key,
                        page_key,
                        source_text,
                        source_text_norm,
                        translated_text,
                        kind,
                        notes,
                        review_state,
                        usage_count,
                        last_seen_at
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, 'approved', 1, ?)
                    ON CONFLICT(document_key, page_key, source_text_norm, translated_text) DO UPDATE SET
                        kind = excluded.kind,
                        notes = excluded.notes,
                        usage_count = translation_memory.usage_count + 1,
                        last_seen_at = excluded.last_seen_at
                    """,
                    (
                        document_key,
                        page_key,
                        source_text,
                        source_norm,
                        translated_text,
                        kind,
                        notes,
                        now,
                    ),
                )
    return len(normalized_entries)


def upsert_glossary_terms(*, document_key: str, entries: Iterable[dict] | None) -> int:
    initialize_store()
    normalized_entries: list[tuple[str, str, str, int]] = []
    seen: set[tuple[str, str]] = set()
    for item in entries or []:
        if not isinstance(item, dict):
            continue
        source_term = " ".join(str(item.get("source") or item.get("source_text") or "").split()).strip()
        target_term = " ".join(
            str(item.get("target") or item.get("target_text") or item.get("translated_text") or "").split()
        ).strip()
        if not source_term or not target_term:
            continue
        source_norm = normalize_lookup_text(source_term)
        if not source_norm:
            continue
        pair = (source_norm, target_term)
        if pair in seen:
            continue
        seen.add(pair)
        normalized_entries.append(
            (
                source_term,
                source_norm,
                target_term,
                0 if item.get("lock") is False else 1,
            )
        )

    if not normalized_entries:
        return 0

    now = _utc_now_iso()
    with _DB_LOCK:
        with _connect() as connection:
            for source_term, source_norm, target_term, locked in normalized_entries:
                connection.execute(
                    """
                    INSERT INTO glossary_terms (
                        document_key,
                        source_term,
                        source_term_norm,
                        target_term,
                        notes,
                        locked,
                        last_seen_at
                    )
                    VALUES (?, ?, ?, ?, '', ?, ?)
                    ON CONFLICT(document_key, source_term_norm, target_term) DO UPDATE SET
                        locked = excluded.locked,
                        last_seen_at = excluded.last_seen_at
                    """,
                    (
                        document_key,
                        source_term,
                        source_norm,
                        target_term,
                        locked,
                        now,
                    ),
                )
    return len(normalized_entries)


def _resolve_document_keys(document_key: str | None, *, include_global: bool = False) -> list[str]:
    keys: list[str] = []
    normalized_key = str(document_key or "").strip()
    if normalized_key:
        keys.append(normalized_key)
    if include_global and GLOBAL_DOCUMENT_KEY not in keys:
        keys.append(GLOBAL_DOCUMENT_KEY)
    return keys


def upsert_context_document(
    *,
    document_key: str,
    source_id: str,
    title: str = "",
    title_reading: str = "",
    author_name: str = "",
    card_url: str = "",
    text_url: str = "",
    html_url: str = "",
    source_type: str = "",
    license_label: str = "",
    import_status: str = "ready",
    chunk_count: int = 0,
    fetched_at: str = "",
    metadata: dict | None = None,
) -> None:
    initialize_store()
    with _DB_LOCK:
        with _connect() as connection:
            connection.execute(
                """
                INSERT INTO context_documents (
                    document_key,
                    source_id,
                    title,
                    title_reading,
                    author_name,
                    card_url,
                    text_url,
                    html_url,
                    source_type,
                    license_label,
                    import_status,
                    chunk_count,
                    fetched_at,
                    metadata_json,
                    updated_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(document_key, source_id) DO UPDATE SET
                    title = excluded.title,
                    title_reading = excluded.title_reading,
                    author_name = excluded.author_name,
                    card_url = excluded.card_url,
                    text_url = excluded.text_url,
                    html_url = excluded.html_url,
                    source_type = excluded.source_type,
                    license_label = excluded.license_label,
                    import_status = excluded.import_status,
                    chunk_count = excluded.chunk_count,
                    fetched_at = excluded.fetched_at,
                    metadata_json = excluded.metadata_json,
                    updated_at = excluded.updated_at
                """,
                (
                    str(document_key or "").strip() or GLOBAL_DOCUMENT_KEY,
                    str(source_id or "").strip(),
                    str(title or "").strip(),
                    str(title_reading or "").strip(),
                    str(author_name or "").strip(),
                    str(card_url or "").strip(),
                    str(text_url or "").strip(),
                    str(html_url or "").strip(),
                    str(source_type or "").strip(),
                    str(license_label or "").strip(),
                    str(import_status or "ready").strip(),
                    max(0, int(chunk_count or 0)),
                    str(fetched_at or "").strip(),
                    json.dumps(metadata or {}, ensure_ascii=False),
                    _utc_now_iso(),
                ),
            )


def list_context_documents(
    *,
    document_key: str | None = None,
    source_type: str | None = None,
    import_status: str | None = None,
    limit: int = 0,
    include_global: bool = False,
) -> list[dict]:
    initialize_store()
    where_clauses: list[str] = []
    params: list[object] = []
    document_scope_clause, document_scope_params = _build_document_scope_clause(
        document_key,
        include_global=include_global,
    )
    if document_scope_clause:
        where_clauses.append(document_scope_clause)
        params.extend(document_scope_params)
    if source_type:
        where_clauses.append("source_type = ?")
        params.append(str(source_type).strip())
    if import_status:
        where_clauses.append("import_status = ?")
        params.append(str(import_status).strip())

    limit_clause = ""
    if int(limit or 0) > 0:
        limit_clause = f" LIMIT {_normalize_list_limit(limit)}"

    with _DB_LOCK:
        with _connect() as connection:
            rows = connection.execute(
                f"""
                SELECT document_key, source_id, title, title_reading, author_name, card_url, text_url, html_url,
                       source_type, license_label, import_status, chunk_count, fetched_at, metadata_json, updated_at
                FROM context_documents
                {'WHERE ' + ' AND '.join(where_clauses) if where_clauses else ''}
                ORDER BY updated_at DESC{limit_clause}
                """,
                params,
            ).fetchall()

    documents: list[dict] = []
    for row in rows:
        documents.append(
            {
                "document_key": str(row["document_key"] or ""),
                "source_id": str(row["source_id"] or ""),
                "title": str(row["title"] or ""),
                "title_reading": str(row["title_reading"] or ""),
                "author_name": str(row["author_name"] or ""),
                "card_url": str(row["card_url"] or ""),
                "text_url": str(row["text_url"] or ""),
                "html_url": str(row["html_url"] or ""),
                "source_type": str(row["source_type"] or ""),
                "license_label": str(row["license_label"] or ""),
                "import_status": str(row["import_status"] or ""),
                "chunk_count": int(row["chunk_count"] or 0),
                "fetched_at": str(row["fetched_at"] or ""),
                "metadata": json.loads(row["metadata_json"] or "{}"),
                "updated_at": str(row["updated_at"] or ""),
            }
        )
    return documents


def replace_context_chunks(
    *,
    document_key: str,
    source_id: str,
    title: str,
    author_name: str,
    source_url: str,
    source_type: str,
    license_label: str,
    chunks: Iterable[str],
    metadata: dict | None = None,
) -> int:
    initialize_store()
    resolved_document_key = str(document_key or "").strip() or GLOBAL_DOCUMENT_KEY
    resolved_source_id = str(source_id or "").strip()
    if not resolved_source_id:
        return 0

    normalized_chunks: list[tuple[int, str, str]] = []
    for chunk_index, chunk in enumerate(chunks):
        text_chunk = " ".join(str(chunk or "").split()).strip()
        if not text_chunk:
            continue
        text_chunk_norm = normalize_lookup_text(text_chunk)
        if not text_chunk_norm:
            continue
        normalized_chunks.append((chunk_index, text_chunk, text_chunk_norm))

    with _DB_LOCK:
        with _connect() as connection:
            connection.execute(
                """
                DELETE FROM context_corpus
                WHERE document_key = ? AND source_id = ?
                """,
                (resolved_document_key, resolved_source_id),
            )

            for chunk_index, text_chunk, text_chunk_norm in normalized_chunks:
                connection.execute(
                    """
                    INSERT INTO context_corpus (
                        document_key,
                        source_id,
                        chunk_index,
                        title,
                        author_name,
                        source_url,
                        source_type,
                        license_label,
                        text_chunk,
                        text_chunk_norm,
                        metadata_json,
                        updated_at
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        resolved_document_key,
                        resolved_source_id,
                        chunk_index,
                        str(title or "").strip(),
                        str(author_name or "").strip(),
                        str(source_url or "").strip(),
                        str(source_type or "").strip(),
                        str(license_label or "").strip(),
                        text_chunk,
                        text_chunk_norm,
                        json.dumps(metadata or {}, ensure_ascii=False),
                        _utc_now_iso(),
                    ),
                )
    return len(normalized_chunks)


def get_relevant_context_corpus(
    *,
    document_key: str | None,
    query_texts: Iterable[str] | None,
    limit: int = 12,
    include_global: bool = True,
) -> list[dict]:
    initialize_store()
    keys = _resolve_document_keys(document_key, include_global=include_global)
    if not keys:
        return []

    raw_queries = [" ".join(str(item or "").split()).strip() for item in (query_texts or [])]
    raw_queries = [item for item in raw_queries if item]
    if not raw_queries:
        return []

    query_norms = [normalize_lookup_text(item) for item in raw_queries]
    query_norms = [item for item in query_norms if item]
    if not query_norms:
        return []

    significant_queries: list[str] = []
    seen_queries: set[str] = set()
    for item in query_norms:
        if len(item) < 2 or item in seen_queries:
            continue
        seen_queries.add(item)
        significant_queries.append(item)
        if len(significant_queries) >= 8:
            break
    if not significant_queries:
        return []

    key_clause = ",".join("?" for _ in keys)
    query_clause = " OR ".join("instr(text_chunk_norm, ?) > 0" for _ in significant_queries)
    params: list[object] = list(keys) + significant_queries

    with _DB_LOCK:
        with _connect() as connection:
            rows = connection.execute(
                f"""
                SELECT document_key, source_id, chunk_index, title, author_name, source_url, source_type,
                       license_label, text_chunk, text_chunk_norm, metadata_json, updated_at
                FROM context_corpus
                WHERE document_key IN ({key_clause})
                  AND ({query_clause})
                ORDER BY updated_at DESC
                LIMIT 1200
                """,
                params,
            ).fetchall()

    scored: list[tuple[float, sqlite3.Row]] = []
    for row in rows:
        chunk_norm = str(row["text_chunk_norm"] or "")
        score = _score_text_match(chunk_norm, significant_queries)
        title_norm = normalize_lookup_text(str(row["title"] or ""))
        author_norm = normalize_lookup_text(str(row["author_name"] or ""))
        if title_norm:
            score = max(score, _score_text_match(title_norm, significant_queries) + 5.0)
        if author_norm:
            score = max(score, _score_text_match(author_norm, significant_queries) + 2.5)
        if score <= 0:
            continue
        row_document_key = str(row["document_key"] or "")
        if document_key and row_document_key == document_key:
            score += 6.0
        elif row_document_key == GLOBAL_DOCUMENT_KEY:
            score += 1.0
        scored.append((score, row))

    scored.sort(key=lambda item: (item[0], str(item[1]["updated_at"])), reverse=True)

    results: list[dict] = []
    seen: set[tuple[str, int]] = set()
    for _score, row in scored:
        pair = (str(row["source_id"] or ""), int(row["chunk_index"] or 0))
        if pair in seen:
            continue
        seen.add(pair)
        results.append(
            {
                "document_key": str(row["document_key"] or ""),
                "source_id": str(row["source_id"] or ""),
                "chunk_index": int(row["chunk_index"] or 0),
                "title": str(row["title"] or ""),
                "author_name": str(row["author_name"] or ""),
                "source_url": str(row["source_url"] or ""),
                "source_type": str(row["source_type"] or ""),
                "license_label": str(row["license_label"] or ""),
                "text_chunk": str(row["text_chunk"] or ""),
                "metadata": json.loads(row["metadata_json"] or "{}"),
            }
        )
        if len(results) >= max(1, int(limit)):
            break
    return results


def _score_text_match(source_norm: str, query_norms: list[str]) -> float:
    best_score = 0.0
    for query_norm in query_norms:
        if not query_norm:
            continue
        if source_norm == query_norm:
            return 100.0
        if query_norm in source_norm or source_norm in query_norm:
            best_score = max(best_score, 82.0)
            continue
        query_tokens = set(query_norm.split())
        source_tokens = set(source_norm.split())
        if query_tokens and source_tokens:
            overlap = len(query_tokens & source_tokens) / max(len(query_tokens), len(source_tokens))
            if overlap >= 0.5:
                best_score = max(best_score, 40.0 + overlap * 40.0)
    return best_score


def get_relevant_translation_memory(
    *,
    document_key: str | None,
    query_texts: Iterable[str] | None,
    limit: int = 24,
    include_global: bool = True,
) -> list[dict]:
    initialize_store()
    keys = _resolve_document_keys(document_key, include_global=include_global)
    if not keys:
        return []
    query_norms = [normalize_lookup_text(item) for item in (query_texts or [])]
    query_norms = [item for item in query_norms if item]
    if not query_norms:
        return []

    with _DB_LOCK:
        with _connect() as connection:
            rows = connection.execute(
                f"""
                SELECT document_key, page_key, source_text, source_text_norm, translated_text, kind, notes, review_state, usage_count, last_seen_at
                FROM translation_memory
                WHERE document_key IN ({','.join('?' for _ in keys)})
                ORDER BY last_seen_at DESC
                LIMIT 600
                """,
                keys,
            ).fetchall()

    scored: list[tuple[float, sqlite3.Row]] = []
    for row in rows:
        score = _score_text_match(str(row["source_text_norm"] or ""), query_norms)
        if score <= 0:
            continue
        score += min(8.0, float(row["usage_count"] or 0) * 0.2)
        row_document_key = str(row["document_key"] or "")
        if document_key and row_document_key == document_key:
            score += 6.0
        elif row_document_key == GLOBAL_DOCUMENT_KEY:
            score += 1.0
        scored.append((score, row))

    scored.sort(key=lambda item: (item[0], str(item[1]["last_seen_at"])), reverse=True)

    results: list[dict] = []
    seen: set[tuple[str, str]] = set()
    for _score, row in scored:
        pair = (str(row["source_text"] or ""), str(row["translated_text"] or ""))
        if pair in seen:
            continue
        seen.add(pair)
        results.append(
            {
                "page_key": str(row["page_key"] or ""),
                "source_text": str(row["source_text"] or ""),
                "translated_text": str(row["translated_text"] or ""),
                "kind": str(row["kind"] or ""),
                "notes": str(row["notes"] or ""),
                "review_state": str(row["review_state"] or "approved"),
            }
        )
        if len(results) >= max(1, int(limit)):
            break
    return results


def get_relevant_glossary_terms(
    *,
    document_key: str | None,
    query_texts: Iterable[str] | None,
    limit: int = 24,
    include_global: bool = True,
) -> list[dict]:
    initialize_store()
    keys = _resolve_document_keys(document_key, include_global=include_global)
    if not keys:
        return []
    raw_queries = [" ".join(str(item or "").split()).strip() for item in (query_texts or [])]
    query_norms = [normalize_lookup_text(item) for item in raw_queries if item]
    joined_query = " ".join(raw_queries).lower()
    if not query_norms and not joined_query:
        return []

    with _DB_LOCK:
        with _connect() as connection:
            rows = connection.execute(
                f"""
                SELECT document_key, source_term, source_term_norm, target_term, notes, locked, last_seen_at
                FROM glossary_terms
                WHERE document_key IN ({','.join('?' for _ in keys)})
                ORDER BY last_seen_at DESC
                LIMIT 400
                """,
                keys,
            ).fetchall()

    scored: list[tuple[float, sqlite3.Row]] = []
    for row in rows:
        source_term = str(row["source_term"] or "")
        source_norm = str(row["source_term_norm"] or "")
        score = _score_text_match(source_norm, query_norms)
        if source_term and joined_query and source_term.lower() in joined_query:
            score = max(score, 88.0)
        if score <= 0:
            continue
        row_document_key = str(row["document_key"] or "")
        if document_key and row_document_key == document_key:
            score += 6.0
        elif row_document_key == GLOBAL_DOCUMENT_KEY:
            score += 1.0
        scored.append((score, row))

    scored.sort(key=lambda item: (item[0], str(item[1]["last_seen_at"])), reverse=True)

    results: list[dict] = []
    seen: set[tuple[str, str]] = set()
    for _score, row in scored:
        pair = (str(row["source_term"] or ""), str(row["target_term"] or ""))
        if pair in seen:
            continue
        seen.add(pair)
        results.append(
            {
                "source": str(row["source_term"] or ""),
                "target": str(row["target_term"] or ""),
                "notes": str(row["notes"] or ""),
                "lock": bool(row["locked"]),
            }
        )
        if len(results) >= max(1, int(limit)):
            break
    return results


def get_store_stats(
    *,
    document_key: str | None = None,
    include_global: bool = True,
) -> dict[str, object]:
    initialize_store()
    database_path = get_database_path()
    table_stats: dict[str, dict[str, object]] = {}
    document_keys: set[str] = set()

    with _DB_LOCK:
        with _connect() as connection:
            for table_name in RAG_TABLES:
                updated_at_column = RAG_TABLE_UPDATED_AT_COLUMNS[table_name]
                document_scope_clause, document_scope_params = _build_document_scope_clause(
                    document_key,
                    include_global=include_global,
                )
                where_clause = f"WHERE {document_scope_clause}" if document_scope_clause else ""
                count_row = connection.execute(
                    f"SELECT COUNT(*) AS row_count FROM {table_name} {where_clause}",
                    document_scope_params,
                ).fetchone()
                latest_row = connection.execute(
                    f"SELECT MAX({updated_at_column}) AS latest_updated_at FROM {table_name} {where_clause}",
                    document_scope_params,
                ).fetchone()
                table_stats[table_name] = {
                    "row_count": int(count_row["row_count"] or 0),
                    "latest_updated_at": str(latest_row["latest_updated_at"] or ""),
                }
                document_key_rows = connection.execute(
                    f"SELECT DISTINCT document_key FROM {table_name} {where_clause}",
                    document_scope_params,
                ).fetchall()
                document_keys.update(
                    str(row["document_key"] or "").strip()
                    for row in document_key_rows
                    if str(row["document_key"] or "").strip()
                )

    return {
        "database_path": str(database_path),
        "database_exists": database_path.exists(),
        "database_size_bytes": database_path.stat().st_size if database_path.exists() else 0,
        "backup_directory": str(BACKUP_DIR),
        "distinct_document_keys": len(document_keys),
        "document_keys": sorted(document_keys)[:100],
        "tables": table_stats,
    }


def list_translation_memory_entries(
    *,
    document_key: str | None = None,
    include_global: bool = True,
    query: str | None = None,
    page_key: str | None = None,
    limit: int = 50,
    offset: int = 0,
) -> dict[str, object]:
    initialize_store()
    where_clauses: list[str] = []
    params: list[object] = []
    document_scope_clause, document_scope_params = _build_document_scope_clause(
        document_key,
        include_global=include_global,
    )
    if document_scope_clause:
        where_clauses.append(document_scope_clause)
        params.extend(document_scope_params)
    if page_key:
        where_clauses.append("page_key = ?")
        params.append(str(page_key).strip())
    normalized_query = normalize_lookup_text(query)
    if normalized_query:
        where_clauses.append("(source_text_norm LIKE ? OR translated_text LIKE ?)")
        params.extend([f"%{normalized_query}%", f"%{str(query).strip()}%"])

    where_sql = f"WHERE {' AND '.join(where_clauses)}" if where_clauses else ""
    normalized_limit = _normalize_list_limit(limit)
    normalized_offset = _normalize_list_offset(offset)

    with _DB_LOCK:
        with _connect() as connection:
            total_row = connection.execute(
                f"SELECT COUNT(*) AS row_count FROM translation_memory {where_sql}",
                params,
            ).fetchone()
            rows = connection.execute(
                f"""
                SELECT id, document_key, page_key, source_text, translated_text, kind, notes,
                       review_state, usage_count, last_seen_at
                FROM translation_memory
                {where_sql}
                ORDER BY last_seen_at DESC, id DESC
                LIMIT ? OFFSET ?
                """,
                [*params, normalized_limit, normalized_offset],
            ).fetchall()

    return {
        "table": "translation_memory",
        "total": int(total_row["row_count"] or 0),
        "limit": normalized_limit,
        "offset": normalized_offset,
        "items": [
            {
                "id": int(row["id"] or 0),
                "document_key": str(row["document_key"] or ""),
                "page_key": str(row["page_key"] or ""),
                "source_text": str(row["source_text"] or ""),
                "translated_text": str(row["translated_text"] or ""),
                "kind": str(row["kind"] or ""),
                "notes": str(row["notes"] or ""),
                "review_state": str(row["review_state"] or ""),
                "usage_count": int(row["usage_count"] or 0),
                "last_seen_at": str(row["last_seen_at"] or ""),
            }
            for row in rows
        ],
    }


def list_glossary_entries(
    *,
    document_key: str | None = None,
    include_global: bool = True,
    query: str | None = None,
    limit: int = 50,
    offset: int = 0,
) -> dict[str, object]:
    initialize_store()
    where_clauses: list[str] = []
    params: list[object] = []
    document_scope_clause, document_scope_params = _build_document_scope_clause(
        document_key,
        include_global=include_global,
    )
    if document_scope_clause:
        where_clauses.append(document_scope_clause)
        params.extend(document_scope_params)
    normalized_query = normalize_lookup_text(query)
    if normalized_query:
        where_clauses.append("(source_term_norm LIKE ? OR target_term LIKE ?)")
        params.extend([f"%{normalized_query}%", f"%{str(query).strip()}%"])

    where_sql = f"WHERE {' AND '.join(where_clauses)}" if where_clauses else ""
    normalized_limit = _normalize_list_limit(limit)
    normalized_offset = _normalize_list_offset(offset)

    with _DB_LOCK:
        with _connect() as connection:
            total_row = connection.execute(
                f"SELECT COUNT(*) AS row_count FROM glossary_terms {where_sql}",
                params,
            ).fetchone()
            rows = connection.execute(
                f"""
                SELECT id, document_key, source_term, target_term, notes, locked, last_seen_at
                FROM glossary_terms
                {where_sql}
                ORDER BY last_seen_at DESC, id DESC
                LIMIT ? OFFSET ?
                """,
                [*params, normalized_limit, normalized_offset],
            ).fetchall()

    return {
        "table": "glossary_terms",
        "total": int(total_row["row_count"] or 0),
        "limit": normalized_limit,
        "offset": normalized_offset,
        "items": [
            {
                "id": int(row["id"] or 0),
                "document_key": str(row["document_key"] or ""),
                "source_term": str(row["source_term"] or ""),
                "target_term": str(row["target_term"] or ""),
                "notes": str(row["notes"] or ""),
                "locked": bool(row["locked"]),
                "last_seen_at": str(row["last_seen_at"] or ""),
            }
            for row in rows
        ],
    }


def list_ocr_pages(
    *,
    document_key: str | None = None,
    include_global: bool = False,
    page_number: int | None = None,
    limit: int = 50,
    offset: int = 0,
) -> dict[str, object]:
    initialize_store()
    where_clauses: list[str] = []
    params: list[object] = []
    document_scope_clause, document_scope_params = _build_document_scope_clause(
        document_key,
        include_global=include_global,
    )
    if document_scope_clause:
        where_clauses.append(document_scope_clause)
        params.extend(document_scope_params)
    if page_number is not None:
        where_clauses.append("page_number = ?")
        params.append(int(page_number))

    where_sql = f"WHERE {' AND '.join(where_clauses)}" if where_clauses else ""
    normalized_limit = _normalize_list_limit(limit)
    normalized_offset = _normalize_list_offset(offset)

    with _DB_LOCK:
        with _connect() as connection:
            total_row = connection.execute(
                f"SELECT COUNT(*) AS row_count FROM ocr_pages {where_sql}",
                params,
            ).fetchone()
            rows = connection.execute(
                f"""
                SELECT document_key, page_number, image_hash, image_width, image_height, detected_language,
                       page_notes, raw_text, avg_confidence, warnings_json, engine_used, updated_at
                FROM ocr_pages
                {where_sql}
                ORDER BY updated_at DESC, page_number DESC
                LIMIT ? OFFSET ?
                """,
                [*params, normalized_limit, normalized_offset],
            ).fetchall()

    return {
        "table": "ocr_pages",
        "total": int(total_row["row_count"] or 0),
        "limit": normalized_limit,
        "offset": normalized_offset,
        "items": [
            {
                "document_key": str(row["document_key"] or ""),
                "page_number": int(row["page_number"] or 0),
                "image_hash": str(row["image_hash"] or ""),
                "image_width": int(row["image_width"] or 0),
                "image_height": int(row["image_height"] or 0),
                "detected_language": str(row["detected_language"] or ""),
                "page_notes": str(row["page_notes"] or ""),
                "raw_text": str(row["raw_text"] or ""),
                "avg_confidence": float(row["avg_confidence"] or 0),
                "warnings": _json_or_default(row["warnings_json"], []),
                "engine_used": str(row["engine_used"] or ""),
                "updated_at": str(row["updated_at"] or ""),
            }
            for row in rows
        ],
    }


def list_context_corpus_entries(
    *,
    document_key: str | None = None,
    include_global: bool = True,
    source_id: str | None = None,
    query: str | None = None,
    limit: int = 50,
    offset: int = 0,
) -> dict[str, object]:
    initialize_store()
    where_clauses: list[str] = []
    params: list[object] = []
    document_scope_clause, document_scope_params = _build_document_scope_clause(
        document_key,
        include_global=include_global,
    )
    if document_scope_clause:
        where_clauses.append(document_scope_clause)
        params.extend(document_scope_params)
    if source_id:
        where_clauses.append("source_id = ?")
        params.append(str(source_id).strip())
    normalized_query = normalize_lookup_text(query)
    if normalized_query:
        where_clauses.append("(text_chunk_norm LIKE ? OR title LIKE ? OR author_name LIKE ?)")
        params.extend([f"%{normalized_query}%", f"%{str(query).strip()}%", f"%{str(query).strip()}%"])

    where_sql = f"WHERE {' AND '.join(where_clauses)}" if where_clauses else ""
    normalized_limit = _normalize_list_limit(limit)
    normalized_offset = _normalize_list_offset(offset)

    with _DB_LOCK:
        with _connect() as connection:
            total_row = connection.execute(
                f"SELECT COUNT(*) AS row_count FROM context_corpus {where_sql}",
                params,
            ).fetchone()
            rows = connection.execute(
                f"""
                SELECT id, document_key, source_id, chunk_index, title, author_name, source_url, source_type,
                       license_label, text_chunk, metadata_json, updated_at
                FROM context_corpus
                {where_sql}
                ORDER BY updated_at DESC, source_id ASC, chunk_index ASC
                LIMIT ? OFFSET ?
                """,
                [*params, normalized_limit, normalized_offset],
            ).fetchall()

    return {
        "table": "context_corpus",
        "total": int(total_row["row_count"] or 0),
        "limit": normalized_limit,
        "offset": normalized_offset,
        "items": [
            {
                "id": int(row["id"] or 0),
                "document_key": str(row["document_key"] or ""),
                "source_id": str(row["source_id"] or ""),
                "chunk_index": int(row["chunk_index"] or 0),
                "title": str(row["title"] or ""),
                "author_name": str(row["author_name"] or ""),
                "source_url": str(row["source_url"] or ""),
                "source_type": str(row["source_type"] or ""),
                "license_label": str(row["license_label"] or ""),
                "text_chunk": str(row["text_chunk"] or ""),
                "metadata": _json_or_default(row["metadata_json"], {}),
                "updated_at": str(row["updated_at"] or ""),
            }
            for row in rows
        ],
    }


def _count_rows_for_clear(
    connection: sqlite3.Connection,
    *,
    table_name: str,
    document_key: str | None = None,
    source_id: str | None = None,
    page_number: int | None = None,
    page_key: str | None = None,
) -> int:
    where_clauses: list[str] = []
    params: list[object] = []
    if document_key:
        where_clauses.append("document_key = ?")
        params.append(str(document_key).strip())
    if source_id and table_name in {"context_documents", "context_corpus"}:
        where_clauses.append("source_id = ?")
        params.append(str(source_id).strip())
    if page_number is not None and table_name == "ocr_pages":
        where_clauses.append("page_number = ?")
        params.append(int(page_number))
    if page_key and table_name == "translation_memory":
        where_clauses.append("page_key = ?")
        params.append(str(page_key).strip())
    where_sql = f"WHERE {' AND '.join(where_clauses)}" if where_clauses else ""
    row = connection.execute(
        f"SELECT COUNT(*) AS row_count FROM {table_name} {where_sql}",
        params,
    ).fetchone()
    return int(row["row_count"] or 0)


def clear_store_data(
    *,
    table: str,
    document_key: str | None = None,
    source_id: str | None = None,
    page_number: int | None = None,
    page_key: str | None = None,
    dry_run: bool = False,
) -> dict[str, object]:
    initialize_store()
    normalized_table = str(table or "").strip().lower()
    if normalized_table not in {*RAG_TABLES, "all"}:
        raise ValueError(f"Unknown RAG table: {table}")

    target_tables = list(RAG_TABLES) if normalized_table == "all" else [normalized_table]
    if "context_documents" in target_tables and "context_corpus" not in target_tables:
        target_tables.insert(target_tables.index("context_documents"), "context_corpus")

    deleted_counts: dict[str, int] = {}
    filters = {
        "document_key": str(document_key or "").strip(),
        "source_id": str(source_id or "").strip(),
        "page_number": int(page_number) if page_number is not None else None,
        "page_key": str(page_key or "").strip(),
    }

    with _DB_LOCK:
        with _connect() as connection:
            for table_name in target_tables:
                row_count = _count_rows_for_clear(
                    connection,
                    table_name=table_name,
                    document_key=document_key,
                    source_id=source_id,
                    page_number=page_number,
                    page_key=page_key,
                )
                deleted_counts[table_name] = row_count
                if dry_run or row_count <= 0:
                    continue

                where_clauses: list[str] = []
                params: list[object] = []
                if document_key:
                    where_clauses.append("document_key = ?")
                    params.append(str(document_key).strip())
                if source_id and table_name in {"context_documents", "context_corpus"}:
                    where_clauses.append("source_id = ?")
                    params.append(str(source_id).strip())
                if page_number is not None and table_name == "ocr_pages":
                    where_clauses.append("page_number = ?")
                    params.append(int(page_number))
                if page_key and table_name == "translation_memory":
                    where_clauses.append("page_key = ?")
                    params.append(str(page_key).strip())
                where_sql = f"WHERE {' AND '.join(where_clauses)}" if where_clauses else ""
                connection.execute(f"DELETE FROM {table_name} {where_sql}", params)

    return {
        "table": normalized_table,
        "dry_run": bool(dry_run),
        "filters": filters,
        "deleted": deleted_counts,
    }


def _ensure_backup_dir() -> Path:
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    return BACKUP_DIR


def _resolve_backup_path(destination: str | Path | None = None) -> Path:
    backup_dir = _ensure_backup_dir()
    if destination:
        destination_path = Path(destination).expanduser()
        if not destination_path.is_absolute():
            destination_path = backup_dir / destination_path
    else:
        destination_path = backup_dir / f"rag_store-{datetime.now(timezone.utc).strftime('%Y%m%d-%H%M%S')}.sqlite3"
    if destination_path.suffix.lower() != ".sqlite3":
        destination_path = destination_path.with_suffix(".sqlite3")
    destination_path.parent.mkdir(parents=True, exist_ok=True)
    return destination_path


def create_backup(*, destination: str | Path | None = None) -> dict[str, object]:
    initialize_store()
    destination_path = _resolve_backup_path(destination)
    with _DB_LOCK:
        with _connect() as source_connection:
            source_connection.execute("PRAGMA wal_checkpoint(FULL)")
            with _connect_path(destination_path) as destination_connection:
                source_connection.backup(destination_connection)
    return {
        "path": str(destination_path),
        "name": destination_path.name,
        "size_bytes": destination_path.stat().st_size,
        "created_at": datetime.fromtimestamp(destination_path.stat().st_mtime, timezone.utc).isoformat(),
    }


def list_backups() -> list[dict[str, object]]:
    backup_dir = _ensure_backup_dir()
    backups: list[dict[str, object]] = []
    for path in sorted(backup_dir.glob("*.sqlite3"), key=lambda item: item.stat().st_mtime, reverse=True):
        backups.append(
            {
                "name": path.name,
                "path": str(path),
                "size_bytes": path.stat().st_size,
                "updated_at": datetime.fromtimestamp(path.stat().st_mtime, timezone.utc).isoformat(),
            }
        )
    return backups


def restore_backup(
    *,
    backup_path: str | Path,
    create_pre_restore_backup: bool = True,
) -> dict[str, object]:
    source_path = Path(backup_path).expanduser()
    source_info = _validate_rag_database(source_path)
    pre_restore_backup: dict[str, object] | None = None

    with _DB_LOCK:
        if create_pre_restore_backup and get_database_path().exists():
            pre_restore_backup = create_backup()

        current_db_path = get_database_path()
        current_db_path.parent.mkdir(parents=True, exist_ok=True)
        with tempfile.NamedTemporaryFile(
            suffix=".sqlite3",
            delete=False,
            dir=current_db_path.parent,
            prefix="rag-restore-",
        ) as temp_file:
            temp_restore_path = Path(temp_file.name)
        try:
            with _connect_path(source_path) as source_connection:
                with _connect_path(temp_restore_path) as destination_connection:
                    source_connection.backup(destination_connection)
            _validate_rag_database(temp_restore_path)
            with _connect_path(current_db_path) as destination_connection:
                with _connect_path(temp_restore_path) as source_connection:
                    source_connection.backup(destination_connection)
                destination_connection.commit()
        finally:
            _cleanup_temp_sqlite_artifacts(temp_restore_path)

    initialize_store()
    return {
        "restored_from": source_info,
        "pre_restore_backup": pre_restore_backup,
        "stats": get_store_stats(),
    }


def merge_store(
    *,
    source_path: str | Path,
    tables: Iterable[str] | None = None,
) -> dict[str, object]:
    initialize_store()
    resolved_source_path = Path(source_path).expanduser()
    selected_tables = [
        str(table_name).strip()
        for table_name in (tables or RAG_TABLES)
        if str(table_name).strip() in RAG_TABLES
    ]
    if not selected_tables:
        raise ValueError("No valid RAG tables were selected for merge.")
    source_info = _validate_rag_database(resolved_source_path, required_tables=selected_tables)
    if resolved_source_path.resolve() == get_database_path().resolve():
        raise ValueError("Cannot merge the active RAG database into itself.")

    merge_counts: dict[str, int] = {}
    with _DB_LOCK:
        with _connect() as connection:
            connection.execute("ATTACH DATABASE ? AS merge_source", (str(resolved_source_path),))
            try:
                for table_name in selected_tables:
                    source_row = connection.execute(
                        f"SELECT COUNT(*) AS row_count FROM merge_source.{table_name}"
                    ).fetchone()
                    source_row_count = int(source_row["row_count"] or 0)
                    merge_counts[table_name] = source_row_count
                    if source_row_count <= 0:
                        continue

                    if table_name == "ocr_pages":
                        connection.execute(
                            """
                            INSERT INTO ocr_pages (
                                document_key, page_number, image_hash, image_width, image_height,
                                detected_language, page_notes, raw_text, avg_confidence, blocks_json,
                                warnings_json, engine_used, updated_at
                            )
                            SELECT document_key, page_number, image_hash, image_width, image_height,
                                   detected_language, page_notes, raw_text, avg_confidence, blocks_json,
                                   warnings_json, engine_used, updated_at
                            FROM merge_source.ocr_pages
                            WHERE 1=1
                            ON CONFLICT(document_key, page_number, image_hash) DO UPDATE SET
                                image_width = excluded.image_width,
                                image_height = excluded.image_height,
                                detected_language = excluded.detected_language,
                                page_notes = excluded.page_notes,
                                raw_text = excluded.raw_text,
                                avg_confidence = excluded.avg_confidence,
                                blocks_json = excluded.blocks_json,
                                warnings_json = excluded.warnings_json,
                                engine_used = excluded.engine_used,
                                updated_at = CASE
                                    WHEN excluded.updated_at > ocr_pages.updated_at THEN excluded.updated_at
                                    ELSE ocr_pages.updated_at
                                END
                            """
                        )
                    elif table_name == "translation_memory":
                        connection.execute(
                            """
                            INSERT INTO translation_memory (
                                document_key, page_key, source_text, source_text_norm, translated_text,
                                kind, notes, review_state, usage_count, last_seen_at
                            )
                            SELECT document_key, page_key, source_text, source_text_norm, translated_text,
                                   kind, notes, review_state, usage_count, last_seen_at
                            FROM merge_source.translation_memory
                            WHERE 1=1
                            ON CONFLICT(document_key, page_key, source_text_norm, translated_text) DO UPDATE SET
                                source_text = excluded.source_text,
                                kind = CASE WHEN excluded.kind != '' THEN excluded.kind ELSE translation_memory.kind END,
                                notes = CASE
                                    WHEN LENGTH(excluded.notes) > LENGTH(translation_memory.notes) THEN excluded.notes
                                    ELSE translation_memory.notes
                                END,
                                review_state = CASE
                                    WHEN translation_memory.review_state = 'approved' OR excluded.review_state = 'approved' THEN 'approved'
                                    ELSE excluded.review_state
                                END,
                                usage_count = MAX(translation_memory.usage_count, excluded.usage_count),
                                last_seen_at = CASE
                                    WHEN excluded.last_seen_at > translation_memory.last_seen_at THEN excluded.last_seen_at
                                    ELSE translation_memory.last_seen_at
                                END
                            """
                        )
                    elif table_name == "glossary_terms":
                        connection.execute(
                            """
                            INSERT INTO glossary_terms (
                                document_key, source_term, source_term_norm, target_term, notes, locked, last_seen_at
                            )
                            SELECT document_key, source_term, source_term_norm, target_term, notes, locked, last_seen_at
                            FROM merge_source.glossary_terms
                            WHERE 1=1
                            ON CONFLICT(document_key, source_term_norm, target_term) DO UPDATE SET
                                notes = CASE
                                    WHEN LENGTH(excluded.notes) > LENGTH(glossary_terms.notes) THEN excluded.notes
                                    ELSE glossary_terms.notes
                                END,
                                locked = MAX(glossary_terms.locked, excluded.locked),
                                last_seen_at = CASE
                                    WHEN excluded.last_seen_at > glossary_terms.last_seen_at THEN excluded.last_seen_at
                                    ELSE glossary_terms.last_seen_at
                                END
                            """
                        )
                    elif table_name == "context_documents":
                        connection.execute(
                            """
                            INSERT INTO context_documents (
                                document_key, source_id, title, title_reading, author_name, card_url,
                                text_url, html_url, source_type, license_label, import_status, chunk_count,
                                fetched_at, metadata_json, updated_at
                            )
                            SELECT document_key, source_id, title, title_reading, author_name, card_url,
                                   text_url, html_url, source_type, license_label, import_status, chunk_count,
                                   fetched_at, metadata_json, updated_at
                            FROM merge_source.context_documents
                            WHERE 1=1
                            ON CONFLICT(document_key, source_id) DO UPDATE SET
                                title = CASE WHEN excluded.title != '' THEN excluded.title ELSE context_documents.title END,
                                title_reading = CASE
                                    WHEN excluded.title_reading != '' THEN excluded.title_reading
                                    ELSE context_documents.title_reading
                                END,
                                author_name = CASE
                                    WHEN excluded.author_name != '' THEN excluded.author_name
                                    ELSE context_documents.author_name
                                END,
                                card_url = CASE WHEN excluded.card_url != '' THEN excluded.card_url ELSE context_documents.card_url END,
                                text_url = CASE WHEN excluded.text_url != '' THEN excluded.text_url ELSE context_documents.text_url END,
                                html_url = CASE WHEN excluded.html_url != '' THEN excluded.html_url ELSE context_documents.html_url END,
                                source_type = CASE
                                    WHEN excluded.source_type != '' THEN excluded.source_type
                                    ELSE context_documents.source_type
                                END,
                                license_label = CASE
                                    WHEN excluded.license_label != '' THEN excluded.license_label
                                    ELSE context_documents.license_label
                                END,
                                import_status = CASE
                                    WHEN excluded.import_status != '' THEN excluded.import_status
                                    ELSE context_documents.import_status
                                END,
                                chunk_count = MAX(context_documents.chunk_count, excluded.chunk_count),
                                fetched_at = CASE
                                    WHEN excluded.fetched_at > context_documents.fetched_at THEN excluded.fetched_at
                                    ELSE context_documents.fetched_at
                                END,
                                metadata_json = CASE
                                    WHEN excluded.metadata_json NOT IN ('', '{}') THEN excluded.metadata_json
                                    ELSE context_documents.metadata_json
                                END,
                                updated_at = CASE
                                    WHEN excluded.updated_at > context_documents.updated_at THEN excluded.updated_at
                                    ELSE context_documents.updated_at
                                END
                            """
                        )
                    elif table_name == "context_corpus":
                        connection.execute(
                            """
                            INSERT INTO context_corpus (
                                document_key, source_id, chunk_index, title, author_name, source_url,
                                source_type, license_label, text_chunk, text_chunk_norm, metadata_json, updated_at
                            )
                            SELECT document_key, source_id, chunk_index, title, author_name, source_url,
                                   source_type, license_label, text_chunk, text_chunk_norm, metadata_json, updated_at
                            FROM merge_source.context_corpus
                            WHERE 1=1
                            ON CONFLICT(document_key, source_id, chunk_index) DO UPDATE SET
                                title = CASE WHEN excluded.title != '' THEN excluded.title ELSE context_corpus.title END,
                                author_name = CASE
                                    WHEN excluded.author_name != '' THEN excluded.author_name
                                    ELSE context_corpus.author_name
                                END,
                                source_url = CASE
                                    WHEN excluded.source_url != '' THEN excluded.source_url
                                    ELSE context_corpus.source_url
                                END,
                                source_type = CASE
                                    WHEN excluded.source_type != '' THEN excluded.source_type
                                    ELSE context_corpus.source_type
                                END,
                                license_label = CASE
                                    WHEN excluded.license_label != '' THEN excluded.license_label
                                    ELSE context_corpus.license_label
                                END,
                                text_chunk = excluded.text_chunk,
                                text_chunk_norm = excluded.text_chunk_norm,
                                metadata_json = CASE
                                    WHEN excluded.metadata_json NOT IN ('', '{}') THEN excluded.metadata_json
                                    ELSE context_corpus.metadata_json
                                END,
                                updated_at = CASE
                                    WHEN excluded.updated_at > context_corpus.updated_at THEN excluded.updated_at
                                    ELSE context_corpus.updated_at
                                END
                            """
                        )
                connection.commit()
            finally:
                try:
                    connection.commit()
                except sqlite3.DatabaseError:
                    pass
                connection.execute("DETACH DATABASE merge_source")

    return {
        "source": source_info,
        "tables": selected_tables,
        "processed_rows": merge_counts,
        "stats": get_store_stats(),
    }


initialize_store()
