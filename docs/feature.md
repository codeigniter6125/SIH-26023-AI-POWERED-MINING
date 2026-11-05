# Features

Status of every PRD requirement, checked against the code on 6 Nov 2026.
✅ built · 🟡 partly built · ❌ not started

| ID | Feature | Status | What exists | What is left |
|---|---|---|---|---|
| FR-1 | Automated report generation | 🟡 | `POST /reports/generate`, Report Studio UI | Store reports; PDF export |
| FR-2 | Word cloud / topic identification | ❌ | — | TopicAgent, `/topics` endpoint, word-cloud UI |
| FR-3 | AI query and response | ✅ | `POST /query/`, orchestrator, Dashboard ask box, Seam IX stop in `web/` | LLM-based routing |
| FR-4 | Multi-format ingestion | 🟡 | Images + PDFs via Vision/Tesseract/PyMuPDF, upload desk | Spreadsheets (pandas), wireline LAS (lasio), background jobs |
| FR-5 | Validation and consistency across sources | 🟡 | ValidationAgent, seeded discrepancies | ConflictScout job that finds new conflicts automatically |
| FR-6 | Manual vs AI time comparison | 🟡 | Timer UI; `executionTimeSeconds` is measured | `manualBaselineTimeMinutes` and `efficiencyGainPercent` are fixed numbers in the schema; source them from a recorded baseline |
| FR-7 | Citation per fact | ✅ | `fact_evidence_citations`, citations on query and report | Enforce "no citation, no fact" in the report writer |
| FR-8 | Conflict timeline | 🟡 | Verification Queue UI | Timeline from real audit events per seam |
| FR-9 | PQ fast-response (<45 s) | 🟡 | Intent + report mode | Formal PQ template; time budget test |
| FR-10 | Report type selector (4 modes) | ✅ | Report Studio | — |
| FR-11 | Audit / compliance dashboard | 🟡 | `/discrepancies/audit/trail` | Dashboard panel, filters, export |
| FR-12 | Cross-section charts | 🟡 | Static SVG cross-section | Draw from interval data |
| FR-13 | Bounding-box evidence viewer | 🟡 | Boxes stored and returned; `react-pdf` installed | PDF.js page + canvas overlay; page-image endpoint |
| FR-14 | Hybrid SQL + RAG | 🟡 | SQL filters, `embedding_json` column | Embeddings, vector index, merge step |
| FR-15 | Verified fact with sign-off | ✅ | `POST /discrepancies/{id}/approve`, audit event | Tie to real officer (auth) |
| FR-16 | SHA-256 per citation | ✅ | `app/core/crypto.py` | — |
| FR-17 | GIS map (Bhuvan WMS) | ❌ | Custom placeholder map | Leaflet + Proj4js, OSM fallback, GeoJSON endpoint |

## Platform items

| Item | Status | Notes |
|---|---|---|
| Authentication + roles | ❌ | See [auth.md](auth.md) |
| Hindi / English toggle (GIGW) | ❌ | A-/A/A+ exists in the workspace header |
| Live sync (WebSocket) | ❌ | |
| Form-V PDF + XLSX exports | ❌ | jsPDF + SheetJS |
| Postgres deploy | ❌ | SQLite only |
| CI (GitHub Actions) | ❌ | See [testing.md](testing.md) |
| Config for API URL in workspace | 🟡 | Several components hard-code `http://localhost:8000` |
| 3D world front door (`web/`) | ✅ prototype | All 8 stops, live query + discrepancy, flat mode |
| MCP server | ❌ | See [mcp.md](mcp.md) |

## The 3D world (`web/`) features

- Scroll-driven camera down borehole NK-094 through 8 stops, spring easing with overshoot.
- 12 toon-shaded characters/objects with idle animations, bubbles, cursor reactions and Field Notes.
- Live "Ask the core" box (real `/api/v1/query/`) with loading, error and empty states.
- Live discrepancy card (real `/api/v1/discrepancies/`), labelled as a design-spec example if the API is down.
- Day/night, sound (muted by default), custom cursor, magnetic buttons, card tilt.
- Flat 2D mode for reduced motion, no WebGL or low-power devices; manual toggle.
