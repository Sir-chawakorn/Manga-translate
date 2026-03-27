# Manga Translate Repo Guidance

This repository is an Electron desktop app backed by FastAPI and the Gemini image-editing API.

## Architecture Focus

- `electron/main.js` owns window setup, Python backend spawning, file access, and IPC handlers.
- `electron/preload.js` is the only renderer bridge. Treat IPC surface area as a security boundary.
- `electron/renderer.js` owns UI state, PDF page flow, editor interactions, and export behavior.
- `backend/app/main.py` exposes the HTTP contract used by Electron.
- `backend/app/gemini_service.py` owns Gemini prompts, region normalization, fallback behavior, and clean-preview generation.
- `backend/app/pdf_service.py` owns PDF preview and page rendering.

## Working Agreements

- Preserve the end-to-end flow: open file or PDF -> select page -> translate -> edit regions -> export PNG.
- Keep Electron, preload, backend routes, and response models in sync. Treat contract mismatches as correctness bugs.
- Be careful with API keys, file reads, path handling, child-process spawning, and export writes. These are high-risk boundaries.
- Keep Gemini model names, prompts, and UI labels aligned when changing any of them.
- Prefer focused fixes over broad rewrites. This repo is small enough that over-abstracting usually hurts velocity.
- After JavaScript changes, run `npm run check:js`.
- After backend Python changes, run `python -m compileall backend/app`.

## Subagent Routing

- For vague bugs in the translation or export flow, start with `issue_triager`, then use `debugger`.
- For backend API, Gemini integration, validation, or PDF service work, lead with `backend_guardian`.
- For renderer, interaction, layout, or state-flow issues, lead with `frontend_refiner`.
- For visual redesign, premium polish, or frontend work where aesthetics matter as much as behavior, lead with `frontend_visionary`.
- For preload, IPC, file access, API keys, subprocess launching, or trust-boundary changes, use `security_checker`.
- For response-shape mismatches between Electron and FastAPI, spawn `frontend_refiner` and `backend_guardian` in parallel, then use `api_designer` to reconcile the contract.
- For Gemini SDK, FastAPI, Electron, or dependency-version questions, use `docs_researcher` to verify upstream behavior before changing code.
- For risky fixes, use `debugger`, then `test_writer`, then `reviewer`.
- For regression scans after UI or backend changes, use `bug_hunter`.
- For release or packaging work around `setup.bat`, `run-all.bat`, or launch readiness, use `release_packager` and `ci_guardian`.

## Parallel Patterns

- UI bug that may cross the stack: spawn `frontend_refiner` and `backend_guardian` in parallel, wait for both, then summarize the first failing boundary.
- Visual redesign with interaction risk: spawn `frontend_visionary` and `interaction_crafter`, then use `ui_accessibility` if keyboard, focus, or contrast may regress.
- Contract debugging: spawn `api_designer` plus whichever side owns the change (`frontend_refiner` or `backend_guardian`).
- Upgrade review: spawn `migration_checker`, `dependency_auditor`, and `docs_researcher`, then consolidate into one compatibility plan.
- Pre-ship review: spawn `reviewer`, `bug_hunter`, and `security_checker` when the change touches IPC, file IO, or secrets.

## Delegation Discipline

- Prefer 1 focused specialist first. Add a second only when the task clearly spans boundaries.
- Keep fan-out to 2 or 3 agents for this repo unless the task is naturally batch-shaped.
- Ask for explicit parallel work when you want it, for example: `Spawn frontend_refiner and backend_guardian in parallel, wait for both, then summarize the mismatch.`
