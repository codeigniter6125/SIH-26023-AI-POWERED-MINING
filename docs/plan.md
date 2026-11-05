# Plan — what is left to build

Snapshot: 6 November 2026, commit `bfc1dfe` + the `web/` prototype.
Feature-level status is in [feature.md](feature.md). This file orders the work.

## Where we are

Done: data foundation (normalized schema, Alembic, audit trail), OCR ingestion for images and PDFs, multi-agent
query with citations and SHA-256, report generation in 4 modes, discrepancy approval, the Next.js workspace screens,
and now the 3D front door in `web/`.

Biggest gaps, by demo risk:
1. **No auth.** Approvals are signed by a hard-coded officer.
2. **RAG half of hybrid retrieval is missing.** Only SQL facts are searched.
3. **No GIS map or PDF evidence viewer.** Both are must-ship differentiators in the PRD.
4. **No word cloud / topics (FR-2).** A mandated core feature.
5. **Benchmark numbers are constants** in the schema, not measured.
6. **No CI**, and the workspace hard-codes `localhost:8000`.

## Milestones

### M1 — Make the demo honest and safe (2 days)
- [ ] `NEXT_PUBLIC_API_URL` everywhere in `frontend/` (remove hard-coded URLs)
- [ ] Auth: Firebase + `require_role` on approve and upload ([auth.md](auth.md))
- [ ] `audit_events.actor_id` from the token
- [ ] Record a real manual baseline (one timed manual report) and store it; compute efficiency from it
- [ ] GitHub Actions CI ([testing.md](testing.md))

### M2 — Finish the must-ship differentiators (3 days)
- [ ] FR-13 evidence viewer: page-image endpoint + PDF.js canvas overlay
- [ ] FR-14 RAG: embeddings for `document_chunks`, FAISS index, merge with SQL hits in CoreAgent
- [ ] FR-9 PQ template with numbered citations; test it under 45 s
- [ ] FR-2 TopicAgent + word cloud in Report Studio

### M3 — Should-ship (3 days)
- [ ] FR-17 Leaflet map with OSM tiles, Bhuvan WMS when credentials arrive, GeoJSON endpoint
- [ ] FR-12 cross-section drawn from `lithological_intervals`
- [ ] FR-5/8 ConflictScout job + timeline from audit events
- [ ] FR-4 spreadsheets (pandas) and LAS wireline logs (lasio)
- [ ] Form-V PDF (jsPDF) and XLSX (SheetJS) exports
- [ ] Hindi/English toggle in the workspace

### M4 — The Core Sample polish (runs in parallel, 1 person)
- [x] Stage 1: scene, loader, Collar hero
- [x] Stage 2: all stops with first-pass copy and objects
- [ ] Stage 3: design review pass per stop (spacing, copy, bubble timing) with the team
- [ ] Stage 4: perf pass on a low-end Android phone; Lighthouse ≥ 90 accessibility
- [ ] Stage 5: real Glossopteris and rig `.glb` models if time allows (keep primitives as fallback)

### M5 — Deploy and rehearse (2 days)
- [ ] Postgres on Supabase, `alembic upgrade head`, seed
- [ ] Backend on Render, `web/` and `frontend/` on Vercel
- [ ] Pre-cache 5 demo queries as a labelled offline fallback
- [ ] Full rehearsal: world → hard hat → workspace → approve → report

## Owners (fill in)

| Area | Owner |
|---|---|
| web/ (3D world) | |
| frontend/ (workspace) | |
| backend/ + auth | |
| agents/ + RAG | |
| ingestion/ | |
| deploy + CI | |
