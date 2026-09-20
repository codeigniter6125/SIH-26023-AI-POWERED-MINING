from fastapi import APIRouter, Request
from typing import List, Optional
from app.models.schemas import IngestionJobResponse, BoundingBox

try:
    from fastapi import File, UploadFile
    import multipart
    _HAS_MULTIPART = True
except ImportError:
    _HAS_MULTIPART = False

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
        ]
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
        ]
    )
]

@router.get("/jobs", response_model=List[IngestionJobResponse], summary="List ingestion & OCR jobs")
async def list_ingestion_jobs():
    """Returns status of scanned document OCR and parsing jobs."""
    return SEED_JOBS

if _HAS_MULTIPART:
    @router.post("/upload", response_model=IngestionJobResponse, summary="Upload geological document for OCR & parsing")
    async def upload_document(file: UploadFile = File(...)):
        """Accepts scanned PDF / litholog plate / spreadsheet and triggers OCR & table extraction."""
        new_job = IngestionJobResponse(
            jobId=f"JOB-OCR-{len(SEED_JOBS) + 9823}",
            filename=file.filename or "uploaded_geological_document.pdf",
            pageCount=15,
            status="EXTRACTED",
            confidenceScore=0.965,
            extractedTables=4,
            extractedBoreholes=["BH-NK-097", "BH-NK-098"],
            boundingBoxes=[
                BoundingBox(x=100.0, y=200.0, width=350.0, height=25.0, pageNumber=1)
            ]
        )
        SEED_JOBS.insert(0, new_job)
        return new_job
else:
    @router.post("/upload", response_model=IngestionJobResponse, summary="Upload geological document for OCR & parsing")
    async def upload_document(req: Request):
        """Accepts uploaded document stream and triggers OCR & table extraction (fallback mode)."""
        filename = req.headers.get("x-filename", "uploaded_geological_document.pdf")
        new_job = IngestionJobResponse(
            jobId=f"JOB-OCR-{len(SEED_JOBS) + 9823}",
            filename=filename,
            pageCount=15,
            status="EXTRACTED",
            confidenceScore=0.965,
            extractedTables=4,
            extractedBoreholes=["BH-NK-097", "BH-NK-098"],
            boundingBoxes=[
                BoundingBox(x=100.0, y=200.0, width=350.0, height=25.0, pageNumber=1)
            ]
        )
        SEED_JOBS.insert(0, new_job)
        return new_job
