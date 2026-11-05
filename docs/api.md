# API

Base URL: `http://localhost:8000` · Prefix: `/api/v1` · Live docs: `http://localhost:8000/docs` (OpenAPI).
JSON field names are camelCase. Schemas live in `backend/app/models/schemas.py`.

## Health

| Method | Path | Returns |
|---|---|---|
| GET | `/health` | `{ "status": "ok", ... }` |

## Boreholes

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/v1/boreholes/` | List with filters and pagination (coalfield, block, grade, thickness, ash, clearance) |
| GET | `/api/v1/boreholes/intervals/search` | Search lithological intervals (seam code, thickness, recovery) |
| GET | `/api/v1/boreholes/{borehole_id}` | Full `BoreholeRecord` dossier with intervals and evidence trail |
| GET | `/api/v1/boreholes/{borehole_id}/intervals` | Intervals for one borehole |

## Verification queue

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/v1/discrepancies/` | List `DiscrepancyItem`s |
| GET | `/api/v1/discrepancies/audit/trail` | Sign-off audit events |
| POST | `/api/v1/discrepancies/{id}/approve` | Approve verified thickness for the National Coal Inventory. Writes an audit event. **Will require role REVIEWER or GEOLOGIST.** |

## Reports

`POST /api/v1/reports/generate`

```json
{ "mode": "PQ_FAST_RESPONSE", "coalfield": "North Karanpura", "block": "NK-IV",
  "questionTitle": "Proved reserves in NK-IV", "includeCitations": true }
```
`mode` is one of `EXECUTIVE_SUMMARY`, `HISTORICAL_TREND`, `STATUTORY_AUDIT`, `PQ_FAST_RESPONSE`.
Returns `GeneratedReportResponse`: `reportId`, `title`, `executionTimeSeconds`, `manualBaselineTimeMinutes`,
`efficiencyGainPercent`, `executiveSummary`, `findingsTable[]`, `citations[]`, `statutoryClearanceStatus`,
`dgmsDocketNo`, `digitalSignatureHash`.

## AI query

`POST /api/v1/query/`

```json
{ "query": "What is the verified thickness of Seam IX at NK-094?", "sessionId": null, "filters": null }
```
Returns `HybridQueryResponse`:
```json
{ "query": "...", "answer": "...", "confidenceScore": 0.94, "routingPath": "DISCREPANCY_ANALYSIS",
  "citations": [{ "documentId": "...", "documentTitle": "...", "agency": "CMPDI", "year": 2021,
                  "boundingBox": { "x": 140, "y": 382, "width": 220, "height": 24, "pageNumber": 12 },
                  "sha256Hash": "64 hex chars", "extractionConfidence": 0.982 }],
  "agentSteps": ["Router: ...", "Core: ...", "Validation: ..."], "validated": true }
```
The 3D world calls this from the **Seam IX** stop.

## Ingestion

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/v1/ingestion/jobs` | List jobs |
| POST | `/api/v1/ingestion/upload` | `multipart/form-data` with `file`. Runs OCR + parsing, returns `IngestionJobResponse` (status, confidence, extracted boreholes, bounding boxes, warnings). If no text is found the status is `NO_TEXT_DETECTED`; nothing is made up. |

## Errors

FastAPI default: `{ "detail": "..." }` with 4xx/5xx. Validation errors are 422 with a `detail[]` list.

## Planned endpoints

| Method | Path | For |
|---|---|---|
| GET | `/api/v1/me` | Current officer and role ([auth.md](auth.md)) |
| GET | `/api/v1/topics?documentId=` | Word cloud / topics (FR-2) |
| GET | `/api/v1/documents/{id}/pages/{n}` | Page image + boxes for the evidence viewer (FR-13) |
| GET | `/api/v1/reports/{id}/export?format=pdf\|xlsx` | Form-V / DGMS exports |
| WS | `/api/v1/live` | Live sync timers and job progress |
| GET | `/api/v1/geo/boreholes.geojson` | Map pins for Leaflet (FR-17) |
