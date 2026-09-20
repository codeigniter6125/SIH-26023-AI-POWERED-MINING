from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.models.schemas import BoreholeRecord
from app.db.seed_data import SEED_BOREHOLES

router = APIRouter()

@router.get("/", response_model=List[BoreholeRecord], summary="List all boreholes with pagination")
async def list_boreholes(
    coalfield: Optional[str] = Query(None, description="Filter by coalfield"),
    block: Optional[str] = Query(None, description="Filter by block"),
    status: Optional[str] = Query(None, description="Filter by statutory clearance status"),
    skip: int = Query(0, ge=0, description="Number of records to skip for pagination"),
    limit: int = Query(50, ge=1, le=500, description="Maximum number of records to return")
):
    """
    Returns paginated list of boreholes with coordinates, seam thickness, coal grade,
    and statutory clearance status.
    """
    results = SEED_BOREHOLES
    if coalfield and isinstance(coalfield, str):
        results = [b for b in results if coalfield.lower() in b.coalfield.lower()]
    if block and isinstance(block, str):
        results = [b for b in results if block.lower() in b.sectorBlock.lower()]
    if status and isinstance(status, str):
        results = [b for b in results if b.statutoryClearance.lower() == status.lower()]

    # Apply pagination offset and limit
    return results[skip : skip + limit]

@router.get("/{borehole_id}", response_model=BoreholeRecord, summary="Get borehole dossier")
async def get_borehole_dossier(borehole_id: str):
    """
    Returns the comprehensive geological dossier for a single borehole,
    including lithological intervals, proximate assay, and evidence citations.
    """
    for b in SEED_BOREHOLES:
        if b.boreholeId.lower() == borehole_id.lower():
            return b
    raise HTTPException(status_code=404, detail=f"Borehole {borehole_id} not found in National Coal Registry.")
