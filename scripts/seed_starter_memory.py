from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from backend.app.rag_store import GLOBAL_DOCUMENT_KEY, initialize_store, upsert_translation_memory  # noqa: E402


DEFAULT_MEMORY_PATH = REPO_ROOT / "backend" / "data" / "starter_translation_memory.json"


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Seed the SQLite RAG store with starter translation memory.")
    parser.add_argument("--document-key", default=GLOBAL_DOCUMENT_KEY, help="Target document key. Default: __global__")
    parser.add_argument("--memory-path", default=str(DEFAULT_MEMORY_PATH), help="Path to the starter translation memory JSON file.")
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()

    memory_path = Path(args.memory_path)
    if not memory_path.exists():
        raise FileNotFoundError(f"Starter translation memory file not found: {memory_path}")

    entries = json.loads(memory_path.read_text(encoding="utf-8"))
    initialize_store()
    inserted = upsert_translation_memory(
        document_key=str(args.document_key).strip() or GLOBAL_DOCUMENT_KEY,
        entries=entries,
    )
    print(json.dumps({"document_key": args.document_key, "translation_memory_entries": inserted}, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
