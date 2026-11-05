# Architecture

GeoMine turns scanned geological records into checked, cited answers. It has four parts: two web frontends, one API,
an agent engine and an ingestion pipeline. They all share one database.

```
                 ┌───────────────────────┐      ┌────────────────────────┐
  Visitors ───►  │ web/  "The Core Sample"│      │ frontend/ Officer       │ ◄─── Officers
                 │ Vite + R3F 3D world    │      │ Workspace (Next.js 14)  │
                 └───────────┬───────────┘      └───────────┬────────────┘
                             │   REST /api/v1 (JSON)          │
                             └──────────────┬─────────────────┘
                                ┌───────────▼───────────┐
                                │ backend/  FastAPI      │── auth (Firebase ID token, planned)
                                │ routers: boreholes,    │
                                │ discrepancies, reports,│
                                │ query, ingestion       │
                                └──┬─────────┬────────┬──┘
                     in-process    │         │        │  in-process
                 ┌─────────────────▼─┐  ┌────▼─────┐ ┌▼──────────────────┐
                 │ agents/            │  │ SQL DB   │ │ ingestion/         │
                 │ Router → Core →    │  │ SQLite → │ │ OCR (Vision /      │
                 │ Validation         │  │ Postgres │ │ Tesseract) →       │
                 │ Gemini + calcs     │  │ Alembic  │ │ borehole parser    │
                 └────────────────────┘  └──────────┘ └────────────────────┘
```

## Folder structure

```
sih-26023-geological-mining/
├── README.md                 # Start here
├── web/                      # NEW: "The Core Sample" 3D world (public front door + live demo)
│   ├── index.html
│   ├── vite.config.ts        # dev proxy /api → http://localhost:8000
│   ├── tailwind.config.js    # reads CSS variable tokens
│   └── src/
│       ├── main.tsx, App.tsx
│       ├── config/           # world.ts (stops, depths, camera path), copy.ts (all text)
│       ├── state/            # tiny store: theme, sound, mode, open field note
│       ├── lib/              # api.ts, device.ts, spring.ts, sound.ts, useSmoothScroll.ts
│       ├── scene/            # WorldCanvas, CameraRig, Strata, Surface, toon.ts, objects/*
│       ├── ui/               # Cursor, MagneticButton, StickerCard, Scribble, Header, Loader, FieldNote
│       ├── stops/            # Collar, Alluvium, Sandstone, SeamIX, Interburden, SeamX, Bedrock, CoreShed
│       ├── fallback/         # FlatWorld (2D strata for reduced motion / low power)
│       └── styles/           # tokens.css, globals.css
├── frontend/                 # Officer Workspace (Next.js 14, GIGW portal)
│   └── src/{app,components,types}
├── backend/                  # FastAPI service
│   ├── app/main.py           # app, CORS, /health
│   ├── app/api/v1/endpoints/ # boreholes, discrepancies, reports, query, ingestion
│   ├── app/core/             # config.py (pydantic-settings), crypto.py (SHA-256)
│   ├── app/db/               # database.py, models.py, seed_data.py, seed_db.py
│   ├── app/models/schemas.py # Pydantic contracts (camelCase, match TS types)
│   ├── alembic/              # migrations
│   └── tests/                # pytest
├── agents/                   # Multi-agent engine (imported by backend)
│   ├── orchestrator.py       # Router → Core → Validation
│   ├── router/ core/ validation/
├── ingestion/                # OCR + parsing pipeline (imported by backend)
│   ├── pipeline.py, ocr/, parsers/
└── docs/                     # This folder
```

## Tech stack

| Layer | Choice | Status |
|---|---|---|
| 3D world | React 18, Vite 5, TypeScript 5, @react-three/fiber 8, drei 9, three 0.169, GSAP 3 + ScrollTrigger, Lenis, Tailwind 3 | Built (prototype) |
| Workspace | Next.js 14, TypeScript, Tailwind, Radix UI, Recharts, react-pdf, Zustand, TanStack Query | Built, partly wired |
| Workspace planned | Leaflet + Proj4js, TanStack Table, PDF.js overlay, jsPDF, SheetJS | Not started |
| API | FastAPI, Pydantic v2, Uvicorn | Built |
| DB | SQLAlchemy 2 + Alembic; SQLite now, Postgres (Supabase) for deploy | SQLite built |
| AI | Google Gemini via `google-genai`; deterministic mining calculators | Built |
| Retrieval | SQL filters built; vector half (FAISS or Chroma) planned | SQL only |
| OCR | Google Cloud Vision, Tesseract fallback, PyMuPDF for PDFs | Built |
| Auth | Firebase Authentication + role claims | Planned ([auth.md](auth.md)) |
| Jobs | arq + Redis for ingestion | Planned (runs inline today) |
| Hosting | Vercel (web, frontend), Render (backend), Supabase (Postgres) | Planned |
| CI | GitHub Actions: tsc, vite build, vitest, ruff, pytest | Planned |

## Key decisions

1. **Agents and ingestion run in-process** with the API. Simpler for a 10-day build. They are plain Python packages, so
   moving them to workers later only changes the call site.
2. **camelCase on the wire, snake_case in the DB.** Pydantic schemas map between them; TS types mirror the schemas.
3. **No invented data.** If OCR or the LLM fails, the API returns an honest empty or failed state. The frontends show it as such.
4. **Two frontends, one API.** The world is for showing and trying. The workspace is for daily work. Neither owns data.
5. **Every fact has a citation** (`fact_evidence_citations`) with a SHA-256 of its source text.
