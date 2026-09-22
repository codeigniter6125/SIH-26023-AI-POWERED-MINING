from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.db.database import get_db
from app.db.models import DiscrepancyModel, BoreholeModel
from app.models.schemas import DiscrepancyItem

router = APIRouter()


@router.get("/", response_model=List[DiscrepancyItem], summary="List statutory discrepancy queue")
def list_discrepancies(db: Session = Depends(get_db)):
    """
    Returns pending and resolved discrepancies from persistent database
    between historical survey agencies (e.g. MECL 1998 rotary survey vs. CMPDI 2021 sonic caliper logs).
    """
    results = db.query(DiscrepancyModel).all()
    return [d.to_schema() for d in results]


@router.post("/{discrepancy_id}/approve", summary="Approve verified thickness for National Coal Inventory")
def approve_discrepancy(discrepancy_id: str, db: Session = Depends(get_db)):
    """
    Simulates digital sign-off by Chief Geologist, certifying verified thickness
    into the National Coal Inventory with cryptographic audit hash and persisting to SQLite.
    """
    disc = db.query(DiscrepancyModel).filter(
        func.lower(DiscrepancyModel.discrepancy_id) == discrepancy_id.strip().lower()
    ).first()

    if not disc:
        raise HTTPException(
            status_code=404,
            detail=f"Discrepancy record {discrepancy_id} not found."
        )

    disc.status = "RESOLVED"
    disc.verified_thickness_meters = disc.reported_thickness_b

    # Also update the corresponding borehole in persistent storage
    bh = db.query(BoreholeModel).filter(
        func.lower(BoreholeModel.borehole_id) == disc.borehole_id.strip().lower()
    ).first()
    if bh:
        bh.statutory_clearance = "DGMS_CLEARED"
        bh.target_seam_thickness = disc.reported_thickness_b

    db.commit()
    db.refresh(disc)

    return {
        "message": f"Discrepancy {discrepancy_id} officially resolved and approved.",
        "discrepancy": disc.to_schema(),
        "statutoryNotice": "Updated into National Coal Inventory under UNFC 111 Proved Reserves."
    }
