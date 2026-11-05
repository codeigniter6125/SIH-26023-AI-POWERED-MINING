# Setup

Tested on Windows 11 with Node 24 and Python 3.11+. Commands work in Git Bash; PowerShell notes are inline.

## Prerequisites
- Node.js ≥ 20, npm ≥ 10
- Python 3.11+ (3.13 works)
- Optional: Tesseract OCR on PATH (offline OCR fallback)
- Optional: a Gemini API key and a Google Cloud Vision key

## 1. Backend (port 8000)

```bash
cd backend
python -m venv venv
source venv/Scripts/activate        # PowerShell: .\venv\Scripts\Activate.ps1
pip install -r requirements.txt -r ../agents/requirements.txt -r ../ingestion/requirements.txt
cp .env.example .env                # then put your keys in .env
alembic upgrade head
python -m app.db.seed_db
uvicorn app.main:app --reload --port 8000
```
Check: open http://localhost:8000/docs.

Without `GEMINI_API_KEY` queries still answer from SQL and calculators, without LLM wording.
Without `GOOGLE_VISION_API_KEY` ingestion uses Tesseract; without either, uploads end as `NO_TEXT_DETECTED`.

## 2. The Core Sample — 3D world (port 5173)

```bash
cd web
npm install
npm run dev
```
Open http://localhost:5173. The dev server proxies `/api` and `/health` to `http://localhost:8000`, so no CORS change
is needed. To point at another backend: `VITE_API_URL=https://api.example.org npm run dev` (that origin must allow CORS).

Flat mode: add `?flat=1` to the URL, or turn on "reduce motion" in your OS.

## 3. Officer Workspace (port 3000)

```bash
cd frontend
npm install
npm run dev
```

## Environment variables

| Var | Used by | Default |
|---|---|---|
| `GEMINI_API_KEY` | agents | — |
| `GOOGLE_VISION_API_KEY` | ingestion | — |
| `DATABASE_URL` | backend | `sqlite:///./geomine.db` |
| `BACKEND_CORS_ORIGINS` | backend | `["http://localhost:3000","http://127.0.0.1:3000"]` |
| `STORAGE_DIR` | backend | `./uploads` |
| `VITE_API_URL` | web | empty (uses dev proxy) |
| `NEXT_PUBLIC_API_URL` | frontend | `http://localhost:8000` |

Never commit `.env`. `.gitignore` already covers it.
