from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from backend.app.rag_store import GLOBAL_DOCUMENT_KEY, initialize_store, upsert_glossary_terms  # noqa: E402


DEFAULT_GLOSSARY_PATH = REPO_ROOT / "backend" / "data" / "starter_glossary.json"


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Seed the SQLite RAG store with a starter glossary.")
    parser.add_argument("--document-key", default=GLOBAL_DOCUMENT_KEY, help="Target document key. Default: __global__")
    parser.add_argument("--glossary-path", default=str(DEFAULT_GLOSSARY_PATH), help="Path to the starter glossary JSON file.")
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()

    glossary_path = Path(args.glossary_path)
    if not glossary_path.exists():
        raise FileNotFoundError(f"Starter glossary file not found: {glossary_path}")

    entries = json.loads(glossary_path.read_text(encoding="utf-8"))
    initialize_store()
    inserted = upsert_glossary_terms(document_key=str(args.document_key).strip() or GLOBAL_DOCUMENT_KEY, entries=entries)
    print(json.dumps({"document_key": args.document_key, "glossary_entries": inserted}, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
