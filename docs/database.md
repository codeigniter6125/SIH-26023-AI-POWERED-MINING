# Database

SQLAlchemy 2 models live in `backend/app/db/models.py`. Migrations are in `backend/alembic/versions/`.
Dev uses SQLite (`DATABASE_URL="sqlite:///./geomine.db"`). Deploy targets Postgres (Supabase); the models use only
portable types, so switching is a URL change and `alembic upgrade head`.

## Entity map

```
documents 1───* document_chunks
    │
    1
    │
    *
fact_evidence_citations *───1 (fact_reference_id → boreholes.borehole_id | discrepancies.discrepancy_id)
    ▲
    │ citation_id
lithological_intervals *───1 boreholes 1───0..1 discrepancies
ingestion_jobs *───0..1 documents
audit_events  (entity_type + entity_id → any row)
```

## Tables

### `documents`
Every source file: scanned PDF, litholog image, spreadsheet, wireline log.

| Column | Type | Notes |
|---|---|---|
| document_id | str(50) PK | e.g. `DOC-MECL-1998-NK` |
| title, filename | str | |
| agency | str(50) | MECL, CMPDI, GSI, CIL |
| year | int | survey year |
| file_type | str | PDF, IMAGE, SPREADSHEET, WIRELINE_LOG |
| storage_path | str | path under `STORAGE_DIR` |
| page_count | int | |

### `document_chunks`
OCR text blocks, for retrieval and evidence boxes.

| Column | Type | Notes |
|---|---|---|
| chunk_id | str(64) PK | |
| document_id | FK documents | |
| page_number | int | |
| text_content | text | |
| bbox_json | text | `[x, y, w, h]` in page pixels |
| extraction_confidence | float | 0–1 |
| embedding_json | text | **empty today**; filled when the vector index lands |

### `boreholes`
One row per drill hole. Maps to `BoreholeRecord`.

Key columns: `borehole_id` (PK, e.g. `NK-094`), `coalfield`, `sector_block`, `latitude`, `longitude`,
`collar_elevation_msl`, `datum`, `total_drilled_depth_meters`, `target_seam_thickness`, `coal_grade`,
`ash_percent`, `moisture_percent`, `volatile_matter_percent`, `fixed_carbon_percent`,
`gross_calorific_value_kcal`, `statutory_clearance` (`DGMS_CLEARED` | `UNDER_JOINT_REVIEW` | `FLAGGED_DISCREPANCY`),
`discrepancy_id`. Indexed for the SQL half of hybrid retrieval: coalfield, block, thickness, grade, ash, clearance.

`intervals_json` and `evidence_trail_json` are read caches. The normalized tables below are the source of truth.

### `lithological_intervals`
`interval_id` PK, `borehole_id` FK, `from_depth_meters`, `to_depth_meters`, `thickness_meters`,
`lithology_description`, `core_recovery_percent`, `seam_code` (`SEAM_IX`, `SEAM_X`, `INTERBURDEN`, `ALLUVIUM`…),
`citation_id` FK, `bbox_json`.

### `fact_evidence_citations`
`citation_id` PK, `document_id` FK, `document_title`, `agency`, `year`, `page_number`, `bbox_json`,
`sha256_hash`, `extraction_confidence`, `fact_type`, `fact_reference_id`, `snippet_text`.
Rule: anything the UI shows as a fact must join to one of these rows.

### `discrepancies`
Two agencies disagree about one seam. `discrepancy_id` PK, `borehole_id`, `coalfield`, `block`, `seam`,
`agency_a/b`, `survey_year_a/b`, `reported_thickness_a/b`, `method_a/b`, `thickness_delta_meters`,
`status` (`UNDER_REVIEW` → `APPROVED`), `verified_thickness_meters`, `reconciliation_notes`,
`digital_signature_hash`, `audit_docket_no`.

### `audit_events`
Append-only log. `event_id`, `event_type` (`APPROVE_THICKNESS`, `UPDATE_BOREHOLE`, `INGEST_DOCUMENT`…),
`entity_type`, `entity_id`, `actor_id`, `actor_role`, `before_json`, `after_json`, `reason`, hash, `created_at`.
`actor_id` defaults to a demo officer today; once auth lands it must come from the verified token.

### `ingestion_jobs`
`job_id`, `document_id`, `filename`, `page_count`, `status`
(`PENDING`, `PROCESSING`, `EXTRACTED`, `VERIFIED`, `FAILED`, `NO_TEXT_DETECTED`), `confidence_score`, `ocr_engine`,
`extracted_boreholes_json`, `extracted_intervals_json`, `bounding_boxes_json`, `warnings_json`.

## Seeding

```bash
cd backend
python -m app.db.seed_db
```
Seeds the North Karanpura demo set (NK-094 and neighbours, the MECL 1998 vs CMPDI 2021 discrepancy).

## Planned changes

| Change | Why |
|---|---|
| `users` table (`uid`, `email`, `role`, `office`) | Map Firebase uid → role and office for audit |
| `reports` table | Keep generated reports, their hash and citations for re-download |
| `topics` table | Word-cloud / topic output per document (FR-2) |
| Vector index (pgvector on Postgres, FAISS file on SQLite) | RAG half of hybrid retrieval (FR-14) |
| Drop `intervals_json` / `evidence_trail_json` caches | After all readers use the normalized tables |
