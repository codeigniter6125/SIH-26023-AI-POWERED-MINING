# Debugging

## Quick checks
1. Backend up? `curl http://localhost:8000/health`
2. Data seeded? `curl http://localhost:8000/api/v1/boreholes/` should return a non-empty list.
3. Which DB file? The backend uses `DATABASE_URL` relative to where you start uvicorn. There are two `geomine.db`
   files (repo root and `backend/`); start uvicorn from `backend/` so you use `backend/geomine.db`.

## Common problems

| Symptom | Cause | Fix |
|---|---|---|
| Workspace shows "Failed to fetch" | Backend not running, or CORS | Start uvicorn; add your origin to `BACKEND_CORS_ORIGINS` |
| 3D world: "Couldn't reach the core" | Backend down, or `VITE_API_URL` set to an origin without CORS | Start backend; unset `VITE_API_URL` to use the dev proxy |
| Query answers have no LLM wording | No `GEMINI_API_KEY` or quota exceeded | Check `backend/.env`; check the uvicorn log for 429 |
| Upload returns `NO_TEXT_DETECTED` | No Vision key and Tesseract not on PATH, or a blank scan | `tesseract --version`; try the sample PNG in `uploads/` |
| `ModuleNotFoundError: agents` | Started uvicorn outside `backend/` | `cd backend` first; `query.py` and `reports.py` add the repo root to `sys.path` from there |
| Alembic "table already exists" | DB created by `create_all` before migrations | Delete the dev DB and run `alembic upgrade head` again |
| Windows console garbles symbols | cp1252 encoding | `set PYTHONIOENCODING=utf-8` |
| 3D world is blank / black | WebGL off or GPU blocklisted | Try `?flat=1`; check `chrome://gpu` |
| 3D world stutters | Low-end GPU | Flat mode toggle; DPR already capped; close DevTools (it slows WebGL) |
| Camera doesn't move on scroll | Lenis not started or ScrollTrigger not refreshed | Check console; resize the window once (triggers refresh) |

## Tools
- **API:** http://localhost:8000/docs to try every endpoint.
- **SQL:** `sqlite3 backend/geomine.db ".tables"`, or DB Browser for SQLite.
- **3D world:** add `?debug=1` to show an fps meter and the current stop/progress in the corner.
- **React:** React DevTools. **WebGL:** Spector.js extension for draw calls.

## Logging
- Backend logs to stdout through uvicorn. Run with `--log-level debug` for more.
- Agents put each step into `agentSteps` in the query response; read them before reading code.
