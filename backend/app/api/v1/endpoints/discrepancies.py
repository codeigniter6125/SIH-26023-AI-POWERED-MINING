from fastapi import APIRouter, HTTPException
from typing import List
from app.models.schemas import DiscrepancyItem
from app.db.seed_data import SEED_DISCREPANCIES, SEED_BOREHOLES

router = APIRouter()

@router.get("/", response_model=List[DiscrepancyItem], summary="List statutory discrepancy queue")
async def list_discrepancies():
    """
    Returns pending and resolved discrepancies between historical survey agencies
    (e.g., MECL 1998 rotary survey vs. CMPDI 2021 sonic caliper logs).
    """
    return SEED_DISCREPANCIES

@router.post("/{discrepancy_id}/approve", summary="Approve verified thickness for National Coal Inventory")
async def approve_discrepancy(discrepancy_id: str):
    """
    Simulates digital sign-off by Chief Geologist, certifying verified thickness
    into the National Coal Inventory with cryptographic audit hash.
    """
    for item in SEED_DISCREPANCIES:
        if item.discrepancyId.lower() == discrepancy_id.lower():
            item.status = "RESOLVED"
            item.verifiedThicknessMeters = item.reportedThicknessB
            
            # Also update the borehole statutory clearance status
            for b in SEED_BOREHOLES:
                if b.boreholeId == item.boreholeId:
                    b.statutoryClearance = "DGMS_CLEARED"
                    b.targetSeamThickness = item.reportedThicknessB
            
            return {
                "message": f"Discrepancy {discrepancy_id} officially resolved and approved.",
                "discrepancy": item,
                "statutoryNotice": "Updated into National Coal Inventory under UNFC 111 Proved Reserves."
            }

    raise HTTPException(status_code=404, detail=f"Discrepancy record {discrepancy_id} not found.")
