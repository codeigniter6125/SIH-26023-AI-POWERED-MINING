# GeoMine — AI-Powered Geological, Mining and Reporting Solution

**Smart India Hackathon 2026 · Problem Statement SIH26023 · Ministry of Coal (CMPDI / CIL) · Team Race Condition**

CMPDI officers spend hours digging through scanned drill logs, old survey reports and spreadsheets to answer one
question about one seam. GeoMine reads those records, stores every fact with a link back to the page it came from,
and answers questions and drafts reports in seconds. Every number carries a citation and a SHA-256 hash.

## What's in the repo

| Folder | What it is | Run |
|---|---|---|
| [`web/`](web) | **The Core Sample**: a scroll-driven 3D world. Front door and live demo | `npm run dev` → :5173 |
| [`frontend/`](frontend) | **Officer Workspace**: GIGW-style portal for daily work | `npm run dev` → :3000 |
| [`backend/`](backend) | FastAPI service, SQLAlchemy models, Alembic | `uvicorn app.main:app --reload` → :8000 |
| [`agents/`](agents) | Router → Core → Validation agents, mining calculators | imported by backend |
| [`ingestion/`](ingestion) | OCR (Vision / Tesseract / PyMuPDF) and borehole parser | imported by backend |
| [`docs/`](docs) | All documentation | — |

## Quick start

```bash
cd backend && python -m venv venv && source venv/Scripts/activate
pip install -r requirements.txt -r ../agents/requirements.txt -r ../ingestion/requirements.txt
cp .env.example .env && alembic upgrade head && python -m app.db.seed_db
uvicorn app.main:app --reload --port 8000
```
```bash
cd web && npm install && npm run dev
```
Full steps: [docs/setup.md](docs/setup.md).

## Docs

[Architecture](docs/architecture.md) · [Design](docs/design_doc.md) · [Features & status](docs/feature.md) ·
[Plan](docs/plan.md) · [API](docs/api.md) · [Database](docs/database.md) · [Agents](docs/agents.md) ·
[Auth](docs/auth.md) · [Integrations](docs/integration.md) · [MCP](docs/mcp.md) · [Testing](docs/testing.md) ·
[Debugging](docs/debugging.md) · [PRD](docs/prd.md) · [Tech stack](docs/techstack.md)

## Status (6 Nov 2026)

Built: ingestion for images and PDFs, cited multi-agent query, 4-mode report generation, discrepancy sign-off with audit
trail, the workspace screens, and the 3D world. Not built yet: auth, vector retrieval, GIS map, PDF evidence viewer,
word cloud, exports, CI. See [docs/plan.md](docs/plan.md).

Developed for Smart India Hackathon 2026 under Problem Statement SIH26023.
