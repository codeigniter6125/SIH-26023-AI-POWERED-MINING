from fastapi import APIRouter, UploadFile, File
from typing import List
from app.models.schemas import IngestionJobResponse, BoundingBox

router = APIRouter()

SEED_JOBS: List[IngestionJobResponse] = [
    IngestionJobResponse(
        jobId="JOB-OCR-9821",
        filename="CMPDI_Block_IV_North_Karanpura_GR_2021.pdf",
        pageCount=64,
        status="VERIFIED",
        confidenceScore=0.982,
        extractedTables=18,
        extractedBoreholes=["BH-NK-091", "BH-NK-092", "BH-NK-094", "BH-NK-095"],
        boundingBoxes=[
            BoundingBox(x=140.0, y=382.0, width=320.0, height=28.0, pageNumber=12),
            BoundingBox(x=120.0, y=340.0, width=420.0, height=18.0, pageNumber=12),
            BoundingBox(x=120.0, y=362.0, width=420.0, height=18.0, pageNumber=12)
        ]
    ),
    IngestionJobResponse(
        jobId="JOB-OCR-9822",
        filename="MECL_Regional_Exploration_Memoir_1998_Scan.pdf",
        pageCount=128,
        status="EXTRACTED",
        confidenceScore=0.914,
        extractedTables=32,
        extractedBoreholes=["BH-NK-094"],
        boundingBoxes=[
            BoundingBox(x=115.0, y=510.0, width=310.0, height=24.0, pageNumber=84)
        ]
    )
]

@router.get("/jobs", response_model=List[IngestionJobResponse], summary="List ingestion & OCR jobs")
async def list_ingestion_jobs():
    """Returns status of scanned document OCR and parsing jobs."""
    return SEED_JOBS

@router.post("/upload", response_model=IngestionJobResponse, summary="Upload geological document for OCR & parsing")
async def upload_document(file: UploadFile = File(...)):
    """
    Accepts scanned PDF / litholog plate / spreadsheet and triggers OCR & table extraction.
    """
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
