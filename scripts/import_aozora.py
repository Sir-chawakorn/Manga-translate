from __future__ import annotations

import argparse
import csv
import io
import json
import re
import sys
import time
import urllib.error
import urllib.request
import zipfile
from collections import OrderedDict
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from backend.app.rag_store import (  # noqa: E402
    GLOBAL_DOCUMENT_KEY,
    initialize_store,
    list_context_documents,
    replace_context_chunks,
    upsert_context_document,
)


CATALOG_ZIP_URL = "https://www.aozora.gr.jp/index_pages/list_person_all_extended_utf8.zip"
COPYRIGHT_ACTIVE_FLAG = "\u3042\u308a"
COPYRIGHT_PUBLIC_FLAG = "\u306a\u3057"
DEFAULT_SOURCE_TYPE = "aozora-text"
DEFAULT_LICENSE_LABEL = "public-domain"
DEFAULT_USER_AGENT = "MangaTranslateStudio/0.1 (Aozora Importer)"

WORK_ID_IDX = 0
TITLE_IDX = 1
TITLE_READING_IDX = 2
COPYRIGHT_FLAG_IDX = 10
CARD_URL_IDX = 13
PERSON_FAMILY_IDX = 15
PERSON_GIVEN_IDX = 16
ROLE_IDX = 23
TEXT_URL_IDX = 45
TEXT_ENCODING_IDX = 47
HTML_URL_IDX = 50

AOZORA_NOTE_RE = re.compile(r"\uFF3B\uFF03.*?\uFF3D")
AOZORA_RUBY_RE = re.compile(r"\u300A.*?\u300B")
AOZORA_RULES_BLOCK_RE = re.compile(r"-{20,}\s*.*?\s*-{20,}\s*", re.DOTALL)
AOZORA_FOOTER_RE = re.compile(r"\n\u5E95\u672C\uff1a.*", re.DOTALL)
MULTISPACE_RE = re.compile(r"[ \t\u3000]+")
MULTIBLANK_RE = re.compile(r"\n{3,}")


def fetch_bytes(url: str, *, timeout: int = 60) -> bytes:
    request = urllib.request.Request(url, headers={"User-Agent": DEFAULT_USER_AGENT})
    with urllib.request.urlopen(request, timeout=timeout) as response:
        return response.read()


def parse_catalog_rows(csv_bytes: bytes) -> list[dict]:
    text = csv_bytes.decode("utf-8-sig", errors="replace")
    reader = csv.reader(io.StringIO(text))
    header = next(reader, None)
    if not header:
        return []

    works: OrderedDict[str, dict] = OrderedDict()
    for row in reader:
        if len(row) < 55:
            continue
        work_id = row[WORK_ID_IDX].strip()
        if not work_id:
            continue

        work = works.setdefault(
            work_id,
            {
                "source_id": f"aozora:{work_id}",
                "work_id": work_id,
                "title": row[TITLE_IDX].strip(),
                "title_reading": row[TITLE_READING_IDX].strip(),
                "copyright_flag": row[COPYRIGHT_FLAG_IDX].strip(),
                "card_url": row[CARD_URL_IDX].strip(),
                "text_url": row[TEXT_URL_IDX].strip(),
                "text_encoding": row[TEXT_ENCODING_IDX].strip(),
                "html_url": row[HTML_URL_IDX].strip(),
                "contributors": [],
            },
        )

        if row[TEXT_URL_IDX].strip():
            work["text_url"] = row[TEXT_URL_IDX].strip()
        if row[TEXT_ENCODING_IDX].strip():
            work["text_encoding"] = row[TEXT_ENCODING_IDX].strip()
        if row[HTML_URL_IDX].strip():
            work["html_url"] = row[HTML_URL_IDX].strip()

        contributor_name = " ".join(part for part in [row[PERSON_FAMILY_IDX].strip(), row[PERSON_GIVEN_IDX].strip()] if part)
        contributor_role = row[ROLE_IDX].strip()
        if contributor_name:
            contributor = {
                "name": contributor_name,
                "role": contributor_role,
            }
            if contributor not in work["contributors"]:
                work["contributors"].append(contributor)

    return list(works.values())


def build_author_name(contributors: list[dict]) -> str:
    labels: list[str] = []
    for contributor in contributors:
        name = str(contributor.get("name") or "").strip()
        role = str(contributor.get("role") or "").strip()
        if not name:
            continue
        if role:
            labels.append(f"{name} ({role})")
        else:
            labels.append(name)
    return " / ".join(labels)


def decode_aozora_text(payload: bytes, declared_encoding: str) -> str:
    normalized = str(declared_encoding or "").strip().lower()
    candidates = []
    if normalized in {"shiftjis", "shift_jis", "sjis", "cp932"}:
        candidates.extend(["cp932", "shift_jis"])
    elif normalized in {"utf-8", "utf8"}:
        candidates.extend(["utf-8-sig", "utf-8"])
    elif normalized:
        candidates.append(normalized)
    candidates.extend(["cp932", "shift_jis", "utf-8-sig", "utf-8"])

    seen: set[str] = set()
    for encoding in candidates:
        if encoding in seen:
            continue
        seen.add(encoding)
        try:
            return payload.decode(encoding)
        except UnicodeDecodeError:
            continue
    return payload.decode("utf-8", errors="replace")


def extract_text_from_zip(zip_bytes: bytes, declared_encoding: str) -> str:
    archive = zipfile.ZipFile(io.BytesIO(zip_bytes))
    for name in archive.namelist():
        if name.lower().endswith(".txt"):
            return decode_aozora_text(archive.read(name), declared_encoding)
    raise ValueError("No .txt file found in Aozora archive.")


def clean_aozora_text(text: str) -> str:
    cleaned = str(text or "").replace("\r\n", "\n").replace("\r", "\n")
    cleaned = AOZORA_RULES_BLOCK_RE.sub("", cleaned, count=1)
    cleaned = cleaned.replace("\uFF5C", "")
    cleaned = cleaned.replace("|", "")
    cleaned = AOZORA_RUBY_RE.sub("", cleaned)
    cleaned = AOZORA_NOTE_RE.sub("", cleaned)
    cleaned = AOZORA_FOOTER_RE.sub("", cleaned)

    normalized_lines: list[str] = []
    for line in cleaned.splitlines():
        line = MULTISPACE_RE.sub(" ", line).strip()
        normalized_lines.append(line)

    cleaned = "\n".join(normalized_lines).strip()
    cleaned = MULTIBLANK_RE.sub("\n\n", cleaned)
    return cleaned


def chunk_text(text: str, *, chunk_size: int, max_chunks: int) -> list[str]:
    paragraphs = [segment.strip() for segment in re.split(r"\n{2,}", text) if segment.strip()]
    chunks: list[str] = []
    current: list[str] = []
    current_size = 0

    def flush() -> None:
        nonlocal current, current_size
        if not current:
            return
        chunks.append("\n\n".join(current).strip())
        current = []
        current_size = 0

    for paragraph in paragraphs:
        paragraph = paragraph.strip()
        if not paragraph:
            continue

        if len(paragraph) > chunk_size:
            flush()
            start = 0
            while start < len(paragraph):
                piece = paragraph[start:start + chunk_size].strip()
                if piece:
                    chunks.append(piece)
                start += chunk_size
                if max_chunks > 0 and len(chunks) >= max_chunks:
                    return chunks[:max_chunks]
            continue

        projected_size = current_size + len(paragraph) + (2 if current else 0)
        if current and projected_size > chunk_size:
            flush()
        current.append(paragraph)
        current_size += len(paragraph) + (2 if current_size else 0)
        if max_chunks > 0 and len(chunks) >= max_chunks:
            return chunks[:max_chunks]

    flush()
    if max_chunks > 0:
        return chunks[:max_chunks]
    return chunks


def sync_catalog(
    *,
    works: list[dict],
    document_key: str,
    public_only: bool,
) -> dict:
    catalog_count = 0
    skipped_non_public = 0
    for work in works:
        is_public = work["copyright_flag"] != COPYRIGHT_ACTIVE_FLAG
        if public_only and not is_public:
            skipped_non_public += 1
            continue

        author_name = build_author_name(work["contributors"])
        metadata = {
            "provider": "aozora",
            "work_id": work["work_id"],
            "contributors": work["contributors"],
            "copyright_flag": work["copyright_flag"],
            "html_url": work["html_url"],
        }
        status = "catalog"
        if not is_public:
            status = "copyright-restricted"
        elif not work["text_url"]:
            status = "no-text-url"

        upsert_context_document(
            document_key=document_key,
            source_id=work["source_id"],
            title=work["title"],
            title_reading=work["title_reading"],
            author_name=author_name,
            card_url=work["card_url"],
            text_url=work["text_url"],
            html_url=work["html_url"],
            source_type=DEFAULT_SOURCE_TYPE,
            license_label=DEFAULT_LICENSE_LABEL if is_public else "restricted",
            import_status=status,
            chunk_count=0,
            metadata=metadata,
        )
        catalog_count += 1

    return {
        "catalog_count": catalog_count,
        "skipped_non_public": skipped_non_public,
    }


def import_texts(
    *,
    works: list[dict],
    document_key: str,
    public_only: bool,
    max_works: int,
    chunk_size: int,
    max_chunks_per_work: int,
    skip_existing: bool,
    sleep_ms: int,
    timeout: int,
    report_every: int,
) -> dict:
    existing_imports = {}
    if skip_existing:
        for item in list_context_documents(document_key=document_key, source_type=DEFAULT_SOURCE_TYPE):
            existing_imports[item["source_id"]] = int(item.get("chunk_count") or 0)

    imported = 0
    skipped_existing = 0
    skipped_non_public = 0
    skipped_no_text = 0
    errors = 0

    for index, work in enumerate(works, start=1):
        is_public = work["copyright_flag"] != COPYRIGHT_ACTIVE_FLAG
        if public_only and not is_public:
            skipped_non_public += 1
            continue

        if not work["text_url"]:
            skipped_no_text += 1
            continue

        if skip_existing and existing_imports.get(work["source_id"], 0) > 0:
            skipped_existing += 1
            continue

        author_name = build_author_name(work["contributors"])
        metadata = {
            "provider": "aozora",
            "work_id": work["work_id"],
            "contributors": work["contributors"],
            "copyright_flag": work["copyright_flag"],
            "html_url": work["html_url"],
        }

        try:
            zip_bytes = fetch_bytes(work["text_url"], timeout=timeout)
            raw_text = extract_text_from_zip(zip_bytes, work["text_encoding"])
            cleaned_text = clean_aozora_text(raw_text)
            chunks = chunk_text(
                cleaned_text,
                chunk_size=max(240, int(chunk_size)),
                max_chunks=max(0, int(max_chunks_per_work)),
            )
            if not chunks:
                raise ValueError("No usable text chunks after cleaning.")

            chunk_count = replace_context_chunks(
                document_key=document_key,
                source_id=work["source_id"],
                title=work["title"],
                author_name=author_name,
                source_url=work["card_url"] or work["text_url"],
                source_type=DEFAULT_SOURCE_TYPE,
                license_label=DEFAULT_LICENSE_LABEL,
                chunks=chunks,
                metadata=metadata,
            )
            upsert_context_document(
                document_key=document_key,
                source_id=work["source_id"],
                title=work["title"],
                title_reading=work["title_reading"],
                author_name=author_name,
                card_url=work["card_url"],
                text_url=work["text_url"],
                html_url=work["html_url"],
                source_type=DEFAULT_SOURCE_TYPE,
                license_label=DEFAULT_LICENSE_LABEL,
                import_status="imported",
                chunk_count=chunk_count,
                fetched_at=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                metadata=metadata,
            )
            imported += 1
        except (urllib.error.URLError, zipfile.BadZipFile, ValueError, OSError) as exc:
            errors += 1
            metadata_with_error = dict(metadata)
            metadata_with_error["error"] = str(exc)
            upsert_context_document(
                document_key=document_key,
                source_id=work["source_id"],
                title=work["title"],
                title_reading=work["title_reading"],
                author_name=author_name,
                card_url=work["card_url"],
                text_url=work["text_url"],
                html_url=work["html_url"],
                source_type=DEFAULT_SOURCE_TYPE,
                license_label=DEFAULT_LICENSE_LABEL,
                import_status="error",
                chunk_count=0,
                metadata=metadata_with_error,
            )

        if report_every > 0 and index % report_every == 0:
            print(
                json.dumps(
                    {
                        "progress_index": index,
                        "imported": imported,
                        "skipped_existing": skipped_existing,
                        "skipped_no_text": skipped_no_text,
                        "errors": errors,
                    },
                    ensure_ascii=False,
                )
            )

        if max_works > 0 and imported >= max_works:
            break

        if sleep_ms > 0:
            time.sleep(sleep_ms / 1000.0)

    return {
        "imported": imported,
        "skipped_existing": skipped_existing,
        "skipped_non_public": skipped_non_public,
        "skipped_no_text": skipped_no_text,
        "errors": errors,
    }


def build_argument_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Import public-domain Aozora texts into the SQLite RAG store.")
    parser.add_argument("--document-key", default=GLOBAL_DOCUMENT_KEY, help="Target RAG document key. Default: __global__")
    parser.add_argument("--catalog-url", default=CATALOG_ZIP_URL, help="Official Aozora catalog ZIP URL.")
    parser.add_argument("--catalog-only", action="store_true", help="Sync catalog metadata only. Do not download text archives.")
    parser.add_argument("--skip-catalog-sync", action="store_true", help="Download the catalog for routing, but skip writing catalog rows to SQLite.")
    parser.add_argument("--max-works", type=int, default=0, help="Maximum number of works to download. 0 means no explicit limit.")
    parser.add_argument("--chunk-size", type=int, default=900, help="Approximate max characters per context chunk.")
    parser.add_argument("--max-chunks-per-work", type=int, default=40, help="Maximum chunks to keep per work. 0 means unlimited.")
    parser.add_argument("--sleep-ms", type=int, default=120, help="Delay between downloads in milliseconds.")
    parser.add_argument("--timeout", type=int, default=60, help="Network timeout in seconds.")
    parser.add_argument("--report-every", type=int, default=25, help="Print progress JSON every N catalog items processed.")
    parser.add_argument("--refresh-existing", action="store_true", help="Re-import works even if they already have chunks.")
    parser.add_argument("--include-restricted", action="store_true", help="Include non-public works in catalog sync. Text import still skips them by default.")
    return parser


def main() -> int:
    parser = build_argument_parser()
    args = parser.parse_args()

    initialize_store()

    catalog_zip_bytes = fetch_bytes(args.catalog_url, timeout=args.timeout)
    with zipfile.ZipFile(io.BytesIO(catalog_zip_bytes)) as archive:
        csv_name = archive.namelist()[0]
        catalog_rows = parse_catalog_rows(archive.read(csv_name))

    catalog_public_only = not bool(args.include_restricted)
    if args.skip_catalog_sync:
        catalog_summary = {
            "catalog_count": 0,
            "skipped_non_public": 0,
            "catalog_sync_skipped": True,
        }
    else:
        catalog_summary = sync_catalog(
            works=catalog_rows,
            document_key=args.document_key,
            public_only=catalog_public_only,
        )

    import_summary = {
        "imported": 0,
        "skipped_existing": 0,
        "skipped_non_public": 0,
        "skipped_no_text": 0,
        "errors": 0,
    }
    if not args.catalog_only:
        import_summary = import_texts(
            works=catalog_rows,
            document_key=args.document_key,
            public_only=True,
            max_works=max(0, int(args.max_works)),
            chunk_size=max(240, int(args.chunk_size)),
            max_chunks_per_work=max(0, int(args.max_chunks_per_work)),
            skip_existing=not bool(args.refresh_existing),
            sleep_ms=max(0, int(args.sleep_ms)),
            timeout=max(10, int(args.timeout)),
            report_every=max(0, int(args.report_every)),
        )

    summary = {
        "document_key": args.document_key,
        "catalog_summary": catalog_summary,
        "import_summary": import_summary,
    }
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
