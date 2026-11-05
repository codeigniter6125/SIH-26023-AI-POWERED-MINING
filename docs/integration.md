# Integrations

| Service | Used for | Where | Status | If it's down |
|---|---|---|---|---|
| Google Gemini (`google-genai`) | Wording answers, report prose | `agents/core/core_agent.py` | Built | Structured answer without LLM wording |
| Google Cloud Vision | OCR on scans | `ingestion/ocr/ocr_processor.py` | Built | Tesseract |
| Tesseract | Offline OCR | same | Built | Job ends `NO_TEXT_DETECTED` |
| PyMuPDF | PDF text + page rendering | ingestion | Built | — |
| Firebase Auth | Sign-in, role claims | backend + frontends | Planned | Writes refused (401) |
| Supabase Postgres | Deploy DB | `DATABASE_URL` | Planned | — |
| Bhuvan WMS (ISRO) | Base map tiles | workspace map | Planned, needs credentials | OpenStreetMap tiles |
| OpenStreetMap | Fallback tiles | workspace map | Planned | — |
| Vercel / Render | Hosting | — | Planned | — |
| Google Fonts | Bricolage Grotesque, Atkinson Hyperlegible, JetBrains Mono | `web/index.html` | Built | System fallbacks |

## Frontend ↔ backend

- `web/` uses `src/lib/api.ts`. In dev, requests go to `/api/...` on the Vite server, which proxies to `:8000`.
  In deploys, set `VITE_API_URL` and add the web origin to `BACKEND_CORS_ORIGINS`.
- `frontend/` should use `NEXT_PUBLIC_API_URL` (some components still hard-code it; see [plan.md](plan.md)).
- Both send and receive camelCase JSON matching `backend/app/models/schemas.py`.

## Backend ↔ agents ↔ ingestion

Imported in-process. `backend/app/api/v1/endpoints/query.py` builds one `MultiAgentOrchestrator` and runs
`handle_query` in a thread pool. `ingestion.py` calls the pipeline per upload. Moving either to a worker means
wrapping the same function in an `arq` task.

## Keys and quotas

- Gemini free tier is rate-limited. Pre-cache demo queries before judging and label cached answers as cached.
- Vision API bills per page. Cap upload page count (default 50).
- Keys live in `backend/.env` only. Rotate any key that was ever pasted into chat or a commit.
