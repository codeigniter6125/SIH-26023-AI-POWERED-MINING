import os
import shutil
import logging
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, Request
from starlette.concurrency import run_in_threadpool
from app.models.schemas import IngestionJobResponse, BoundingBox
from app.core.config import settings

logger = logging.getLogger("geomine.ingestion")

try:
    from fastapi import File, UploadFile
    import multipart
    _HAS_MULTIPART = True
except ImportError:
    _HAS_MULTIPART = False

# Import Ingestion Pipeline
try:
    from ingestion.pipeline import GeologicalIngestionPipeline
    _pipeline = GeologicalIngestionPipeline()
except Exception as e:
    logger.warning(f"Could not initialize GeologicalIngestionPipeline: {e}")
    _pipeline = None

router = APIRouter()

# Seeded jobs matching PRD Section 5
SEED_JOBS: List[IngestionJobResponse] = [
    IngestionJobResponse(
        jobId="JOB-OCR-9821",
        filename="CMPDI_RI2_NK_BlockIV_Drilling_2021.pdf",
        pageCount=48,
        status="VERIFIED",
        confidenceScore=0.984,
        extractedTables=12,
        extractedBoreholes=["BH-NK-091", "BH-NK-092", "BH-NK-094"],
        boundingBoxes=[
            BoundingBox(x=140.0, y=382.0, width=320.0, height=28.0, pageNumber=12)
        ],
        ocrEngine="Google Cloud Vision"
    ),
    IngestionJobResponse(
        jobId="JOB-OCR-9822",
        filename="MECL_Memoir_NorthKaranpura_1998_Vol2.pdf",
        pageCount=124,
        status="EXTRACTED",
        confidenceScore=0.912,
        extractedTables=26,
        extractedBoreholes=["BH-NK-094", "BH-NK-095", "BH-NK-096"],
        boundingBoxes=[
            BoundingBox(x=115.0, y=510.0, width=310.0, height=24.0, pageNumber=84)
        ],
        ocrEngine="Google Cloud Vision"
    )
]

@router.get("/jobs", response_model=List[IngestionJobResponse], summary="List ingestion & OCR jobs")
async def list_ingestion_jobs():
    """Returns status of scanned document OCR and parsing jobs."""
    return SEED_JOBS

def _execute_pipeline_on_file(file_path: str, filename: str) -> IngestionJobResponse:
    """Synchronous pipeline worker executed via run_in_threadpool."""
    job_id = f"JOB-OCR-{len(SEED_JOBS) + 9823}"
    if _pipeline is None:
        return IngestionJobResponse(
            jobId=job_id,
            filename=filename,
            pageCount=1,
            status="FAILED",
            confidenceScore=0.0,
            extractedTables=0,
            extractedBoreholes=[],
            boundingBoxes=[],
            ocrEngine="none",
            warnings=["Ingestion pipeline is uninitialized."]
        )

    try:
        res = _pipeline.process_document(file_path)
        bboxes = [
            BoundingBox(
                x=float(b.get("x", 0.0)),
                y=float(b.get("y", 0.0)),
                width=float(b.get("width", 0.0)),
                height=float(b.get("height", 0.0)),
                pageNumber=int(b.get("pageNumber", 1))
            )
            for b in res.get("bounding_boxes", [])
        ]

        status = res.get("status", "NO_TEXT_DETECTED")
        confidence = float(res.get("confidence_score", 0.0))
        boreholes = res.get("extracted_boreholes", [])
        tables = int(res.get("tables_found", 0))
        engine = res.get("ocr_engine_used", "none")

        return IngestionJobResponse(
            jobId=job_id,
            filename=filename,
            pageCount=res.get("page_count", 1),
            status=status,
            confidenceScore=confidence,
            extractedTables=tables,
            extractedBoreholes=boreholes,
            boundingBoxes=bboxes,
            ocrEngine=engine,
            extractedIntervals=res.get("extracted_intervals", []),
            warnings=res.get("warnings", [])
        )
    except Exception as err:
        logger.error(f"Ingestion pipeline processing error: {err}")
        return IngestionJobResponse(
            jobId=job_id,
            filename=filename,
            pageCount=1,
            status="FAILED",
            confidenceScore=0.0,
            extractedTables=0,
            extractedBoreholes=[],
            boundingBoxes=[],
            ocrEngine="none",
            warnings=[f"Pipeline processing failed: {str(err)}"]
        )

if _HAS_MULTIPART:
    @router.post("/upload", response_model=IngestionJobResponse, summary="Upload geological document for OCR & parsing")
    async def upload_document(file: UploadFile = File(...)):
        """Accepts scanned PDF / litholog plate / spreadsheet and triggers OCR & table extraction."""
        storage_dir = Path(settings.STORAGE_DIR)
        storage_dir.mkdir(parents=True, exist_ok=True)

        filename = file.filename or "uploaded_geological_document.pdf"
        dest_path = storage_dir / filename

        with open(dest_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        job = await run_in_threadpool(_execute_pipeline_on_file, str(dest_path), filename)
        SEED_JOBS.insert(0, job)
        return job
else:
    @router.post("/upload", response_model=IngestionJobResponse, summary="Upload geological document for OCR & parsing")
    async def upload_document(req: Request):
        """Accepts uploaded document stream and triggers OCR & table extraction (fallback mode)."""
        storage_dir = Path(settings.STORAGE_DIR)
        storage_dir.mkdir(parents=True, exist_ok=True)

        filename = req.headers.get("x-filename", "uploaded_geological_document.pdf")
        dest_path = storage_dir / filename

        body = await req.body()
        with open(dest_path, "wb") as buffer:
            buffer.write(body)

        job = await run_in_threadpool(_execute_pipeline_on_file, str(dest_path), filename)
        SEED_JOBS.insert(0, job)
        return job
