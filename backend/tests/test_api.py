"""
Unit Tests for CMPDI Geological Intelligence Backend API Endpoints (SIH26023).
"""

import sys
from pathlib import Path
repo_root = str(Path(__file__).resolve().parent.parent.parent)
backend_root = str(Path(__file__).resolve().parent.parent)
for p in [repo_root, backend_root]:
    if p not in sys.path:
        sys.path.insert(0, p)

from app.db.seed_data import SEED_BOREHOLES, SEED_DISCREPANCIES
from app.models.schemas import ReportGenerationRequest
from agents.core.mining_calculators import MiningCalculator

def test_seed_data_integrity():
    """Verify borehole dataset has expected records."""
    assert len(SEED_BOREHOLES) >= 4, "Should have at least 4 seeded boreholes"
    nk94 = next(b for b in SEED_BOREHOLES if b.boreholeId == "BH-NK-094")
    assert nk94.targetSeamThickness == 8.42, "Seam IX verified thickness must be 8.42m"
    assert nk94.coalGrade == "G4", "Grade must be G4"
    print("[PASS] Seed data integrity verified.")

def test_discrepancy_arithmetic():
    """Verify discrepancy delta calculation."""
    disc = next(d for d in SEED_DISCREPANCIES if d.discrepancyId == "DISC-094")
    calculated_delta = round(disc.reportedThicknessB - disc.reportedThicknessA, 2)
    assert calculated_delta == disc.thicknessDeltaMeters, f"Delta {calculated_delta} != {disc.thicknessDeltaMeters}"
    print("[PASS] Discrepancy delta arithmetic verified.")

def test_mining_calculators():
    """Verify geological reserve formula and coal grading."""
    res = MiningCalculator.calculate_geological_reserves(
        area_sq_m=2400000.0,
        thickness_m=8.42,
        specific_gravity=1.40
    )
    # 2,400,000 * 8.42 * 1.40 = 28,291,200 tonnes = 28.2912 MT
    assert res["reserves_million_tonnes"] == 28.2912, f"Reserve MT was {res['reserves_million_tonnes']}"
    
    grade, band = MiningCalculator.get_coal_grade_from_gcv(6200.0)
    assert grade == "G4", f"GCV 6200 must be G4, got {grade}"
    grade_7, band_7 = MiningCalculator.get_coal_grade_from_gcv(5420.0)
    assert grade_7 == "G7", f"GCV 5420 must be G7, got {grade_7}"
    print("[PASS] Mining calculators verified.")

def test_borehole_table_parser():
    """Verify OCR error tolerance, domain validation, and bbox preservation."""
    from ingestion.parsers.borehole_parser import BoreholeTableParser
    parser = BoreholeTableParser()
    test_rows = [
        {"from_m": "0.00", "to_m": "42.10", "stratum": "Alluvium", "bbox": [120.0, 340.0, 420.0, 18.0]},
        {"from_m": "42.10m", "to_m": "114.28m", "stratum": "Sandstone", "bbox": [120.0, 362.0, 420.0, 18.0]},
        {"from_m": "114.28", "to_m": "122.70", "stratum": "Seam IX", "bbox": [120.0, 384.0, 420.0, 22.0]},
        # Corrupted row (depth_to < depth_from)
        {"from_m": "130.00", "to_m": "125.00", "stratum": "Swapped Depths", "bbox": [100.0, 400.0, 300.0, 20.0]},
        # OCR character substitution ('14O.5m')
        {"from_m": "135.5m", "to_m": "14O.5m", "stratum": "Interburden", "bbox": [120.0, 410.0, 420.0, 18.0]},
    ]
    parsed = parser.parse_lithology_table(test_rows, "BH-NK-094")
    assert len(parsed) == 4, f"Expected 4 valid rows (1 skipped), got {len(parsed)}"
    assert all(p.thickness > 0 for p in parsed), "All intervals must have strictly positive thickness"
    assert all(p.bbox is not None for p in parsed), "All parsed intervals must preserve their bbox"
    assert any("Domain validation violation" in w for w in parser.last_warnings), "Warning must be recorded for swapped depths"
    print("[PASS] Borehole table parser domain validation & bbox verified.")

if __name__ == "__main__":
    test_seed_data_integrity()
    test_discrepancy_arithmetic()
    test_mining_calculators()
    test_borehole_table_parser()
    print("All backend tests passed successfully!")
