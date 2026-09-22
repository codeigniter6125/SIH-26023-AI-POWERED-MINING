"""
Database Seeding Script for CMPDI Geological Intelligence Platform.
Migrates in-memory SEED_BOREHOLES and SEED_DISCREPANCIES into persistent SQLite tables.
Safe to re-run: idempotently skips seeding if records already exist.
"""

import sys
import logging
from pathlib import Path
from sqlalchemy.orm import Session

# Ensure sys.path includes backend directory
backend_dir = str(Path(__file__).resolve().parent.parent.parent)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.db.database import SessionLocal, init_db
from app.db.models import BoreholeModel, DiscrepancyModel
from app.db.seed_data import SEED_BOREHOLES, SEED_DISCREPANCIES

logger = logging.getLogger("geomine.db")


def seed_database(db: Session):
    """
    Populates database with initial seed records if empty.
    Returns (num_boreholes_seeded, num_discrepancies_seeded).
    """
    existing_bh_count = db.query(BoreholeModel).count()
    existing_disc_count = db.query(DiscrepancyModel).count()

    if existing_bh_count > 0 and existing_disc_count > 0:
        logger.info(f"Database already populated ({existing_bh_count} boreholes, {existing_disc_count} discrepancies). Skipping seed.")
        print(f"Seeded 0 boreholes, 0 discrepancies (database already populated with {existing_bh_count} boreholes).")
        return 0, 0

    bh_seeded = 0
    disc_seeded = 0

    if existing_bh_count == 0:
        for bh in SEED_BOREHOLES:
            db.add(BoreholeModel.from_schema(bh))
            bh_seeded += 1

    if existing_disc_count == 0:
        for disc in SEED_DISCREPANCIES:
            db.add(DiscrepancyModel.from_schema(disc))
            disc_seeded += 1

    db.commit()
    logger.info(f"Successfully seeded database: {bh_seeded} boreholes, {disc_seeded} discrepancies.")
    print(f"Seeded {bh_seeded} boreholes, {disc_seeded} discrepancies.")
    return bh_seeded, disc_seeded


def run_seed():
    """CLI runner to initialize and seed database."""
    init_db()
    db = SessionLocal()
    try:
        return seed_database(db)
    finally:
        db.close()


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    run_seed()
