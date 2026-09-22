from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from app.db.database import get_db
from app.db.models import BoreholeModel
from app.models.schemas import BoreholeRecord

router = APIRouter()


@router.get("/", response_model=List[BoreholeRecord], summary="List all boreholes with pagination and structured filters")
def list_boreholes(
    coalfield: Optional[str] = Query(None, description="Filter by coalfield"),
    block: Optional[str] = Query(None, description="Filter by block"),
    status: Optional[str] = Query(None, description="Filter by statutory clearance status"),
    min_thickness: Optional[float] = Query(None, alias="minThickness", ge=0.0, description="Minimum seam thickness in meters"),
    max_ash: Optional[float] = Query(None, alias="maxAsh", ge=0.0, le=100.0, description="Maximum ash percentage"),
    skip: int = Query(0, ge=0, description="Number of records to skip for pagination"),
    limit: int = Query(50, ge=1, le=500, description="Maximum number of records to return"),
    db: Session = Depends(get_db)
):
    """
    Returns paginated list of boreholes from persistent database with coordinates,
    seam thickness, coal grade, and statutory clearance status.
    Supports structured hybrid-SQL filtering (coalfield, block, status, minThickness, maxAsh).
    """
    query = db.query(BoreholeModel)

    if coalfield and isinstance(coalfield, str):
        query = query.filter(BoreholeModel.coalfield.ilike(f"%{coalfield.strip()}%"))
    if block and isinstance(block, str):
        query = query.filter(BoreholeModel.sector_block.ilike(f"%{block.strip()}%"))
    if status and isinstance(status, str):
        query = query.filter(func.lower(BoreholeModel.statutory_clearance) == status.strip().lower())
    if min_thickness is not None:
        query = query.filter(BoreholeModel.target_seam_thickness >= min_thickness)
    if max_ash is not None:
        query = query.filter(BoreholeModel.ash_percent <= max_ash)

    results = query.offset(skip).limit(limit).all()
    return [b.to_schema() for b in results]


@router.get("/{borehole_id}", response_model=BoreholeRecord, summary="Get borehole dossier")
def get_borehole_dossier(borehole_id: str, db: Session = Depends(get_db)):
    """
    Returns the comprehensive geological dossier for a single borehole,
    including lithological intervals, proximate assay, and evidence citations from persistent storage.
    """
    record = db.query(BoreholeModel).filter(
        func.lower(BoreholeModel.borehole_id) == borehole_id.strip().lower()
    ).first()

    if not record:
        raise HTTPException(
            status_code=404,
            detail=f"Borehole {borehole_id} not found in National Coal Registry."
        )

    return record.to_schema()
