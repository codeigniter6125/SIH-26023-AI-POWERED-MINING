"""
SQLAlchemy Models for CMPDI Geological Intelligence Platform.
Defines persistent database schemas:
1. BoreholeModel (boreholes)
2. DiscrepancyModel (discrepancies)
3. IngestionJobModel (ingestion_jobs)
4. DocumentChunkModel (document_chunks - prepared for RAG & Hybrid SQL)
"""

import json
from datetime import datetime
from typing import Any, Dict, List, Optional
from sqlalchemy import Column, String, Integer, Float, Text, DateTime
from app.db.database import Base
from app.models.schemas import (
    BoreholeRecord,
    BoreholeCoordinates,
    ProximateAssay,
    LithologicalInterval,
    FactEvidenceCitation,
    DiscrepancyItem
)


class BoreholeModel(Base):
    """Persistent storage for borehole exploration dossiers."""
    __tablename__ = "boreholes"

    borehole_id = Column(String(50), primary_key=True, index=True)
    coalfield = Column(String(100), index=True, nullable=False)
    sector_block = Column(String(100), index=True, nullable=False)
    latitude = Column(String(50), nullable=True)
    longitude = Column(String(50), nullable=True)
    collar_elevation_msl = Column(Float, nullable=True)
    datum = Column(String(50), default="WGS84 / UTM Zone 45N")
    total_drilled_depth_meters = Column(Float, nullable=False)
    target_seam_thickness = Column(Float, index=True, nullable=False)
    coal_grade = Column(String(20), index=True, nullable=False)
    ash_percent = Column(Float, index=True, nullable=False)
    moisture_percent = Column(Float, nullable=False)
    volatile_matter_percent = Column(Float, nullable=True)
    fixed_carbon_percent = Column(Float, nullable=True)
    gross_calorific_value_kcal = Column(Float, nullable=False)
    statutory_clearance = Column(String(50), index=True, default="DGMS_CLEARED")
    discrepancy_id = Column(String(50), nullable=True)
    core_photo_url = Column(String(255), nullable=True)
    intervals_json = Column(Text, default="[]")
    evidence_trail_json = Column(Text, default="[]")
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_schema(self) -> BoreholeRecord:
        """Converts SQLAlchemy model to Pydantic BoreholeRecord."""
        raw_intervals = json.loads(self.intervals_json) if self.intervals_json else []
        raw_citations = json.loads(self.evidence_trail_json) if self.evidence_trail_json else []

        intervals = [LithologicalInterval(**it) for it in raw_intervals]
        citations = [FactEvidenceCitation(**cit) for cit in raw_citations]

        return BoreholeRecord(
            boreholeId=self.borehole_id,
            coalfield=self.coalfield,
            sectorBlock=self.sector_block,
            coordinates=BoreholeCoordinates(
                latitude=self.latitude or "",
                longitude=self.longitude or "",
                collarElevationMsl=self.collar_elevation_msl or 0.0,
                datum=self.datum or "WGS84 / UTM Zone 45N"
            ),
            totalDrilledDepthMeters=self.total_drilled_depth_meters,
            targetSeamThickness=self.target_seam_thickness,
            coalGrade=self.coal_grade,
            proximateAssay=ProximateAssay(
                ashPercent=self.ash_percent,
                moisturePercent=self.moisture_percent,
                volatileMatterPercent=self.volatile_matter_percent,
                fixedCarbonPercent=self.fixed_carbon_percent,
                grossCalorificValueKcal=self.gross_calorific_value_kcal
            ),
            statutoryClearance=self.statutory_clearance,
            discrepancyId=self.discrepancy_id,
            corePhotoUrl=self.core_photo_url,
            intervals=intervals,
            evidenceTrail=citations
        )

    @classmethod
    def from_schema(cls, record: BoreholeRecord) -> "BoreholeModel":
        """Constructs model instance from Pydantic BoreholeRecord."""
        coords = record.coordinates
        assay = record.proximateAssay
        return cls(
            borehole_id=record.boreholeId,
            coalfield=record.coalfield,
            sector_block=record.sectorBlock,
            latitude=coords.latitude if coords else None,
            longitude=coords.longitude if coords else None,
            collar_elevation_msl=coords.collarElevationMsl if coords else None,
            datum=coords.datum if coords else "WGS84 / UTM Zone 45N",
            total_drilled_depth_meters=record.totalDrilledDepthMeters,
            target_seam_thickness=record.targetSeamThickness,
            coal_grade=record.coalGrade,
            ash_percent=assay.ashPercent if assay else 0.0,
            moisture_percent=assay.moisturePercent if assay else 0.0,
            volatile_matter_percent=assay.volatileMatterPercent if assay else None,
            fixed_carbon_percent=assay.fixedCarbonPercent if assay else None,
            gross_calorific_value_kcal=assay.grossCalorificValueKcal if assay else 0.0,
            statutory_clearance=record.statutoryClearance,
            discrepancy_id=record.discrepancyId,
            core_photo_url=record.corePhotoUrl,
            intervals_json=json.dumps([it.model_dump() for it in record.intervals]),
            evidence_trail_json=json.dumps([cit.model_dump() for cit in record.evidenceTrail])
        )


class DiscrepancyModel(Base):
    """Persistent storage for historical survey discrepancies."""
    __tablename__ = "discrepancies"

    discrepancy_id = Column(String(50), primary_key=True, index=True)
    borehole_id = Column(String(50), index=True, nullable=False)
    coalfield = Column(String(100), nullable=False)
    block = Column(String(100), nullable=False)
    seam = Column(String(50), nullable=False)
    agency_a = Column(String(50), nullable=False)
    survey_year_a = Column(Integer, nullable=False)
    reported_thickness_a = Column(Float, nullable=False)
    method_a = Column(String(255), nullable=False)
    agency_b = Column(String(50), nullable=False)
    survey_year_b = Column(Integer, nullable=False)
    reported_thickness_b = Column(Float, nullable=False)
    method_b = Column(String(255), nullable=False)
    thickness_delta_meters = Column(Float, nullable=False)
    status = Column(String(50), default="UNDER_REVIEW", index=True)
    verified_thickness_meters = Column(Float, nullable=True)
    reconciliation_notes = Column(Text, nullable=False)
    digital_signature_hash = Column(String(64), nullable=False)
    audit_docket_no = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_schema(self) -> DiscrepancyItem:
        """Converts model to Pydantic DiscrepancyItem."""
        return DiscrepancyItem(
            discrepancyId=self.discrepancy_id,
            boreholeId=self.borehole_id,
            coalfield=self.coalfield,
            block=self.block,
            seam=self.seam,
            agencyA=self.agency_a,
            surveyYearA=self.survey_year_a,
            reportedThicknessA=self.reported_thickness_a,
            methodA=self.method_a,
            agencyB=self.agency_b,
            surveyYearB=self.survey_year_b,
            reportedThicknessB=self.reported_thickness_b,
            methodB=self.method_b,
            thicknessDeltaMeters=self.thickness_delta_meters,
            status=self.status,
            verifiedThicknessMeters=self.verified_thickness_meters,
            reconciliationNotes=self.reconciliation_notes,
            digitalSignatureHash=self.digital_signature_hash,
            auditDocketNo=self.audit_docket_no
        )

    @classmethod
    def from_schema(cls, item: DiscrepancyItem) -> "DiscrepancyModel":
        """Constructs model instance from Pydantic DiscrepancyItem."""
        return cls(
            discrepancy_id=item.discrepancyId,
            borehole_id=item.boreholeId,
            coalfield=item.coalfield,
            block=item.block,
            seam=item.seam,
            agency_a=item.agencyA,
            survey_year_a=item.surveyYearA,
            reported_thickness_a=item.reportedThicknessA,
            method_a=item.methodA,
            agency_b=item.agencyB,
            survey_year_b=item.surveyYearB,
            reported_thickness_b=item.reportedThicknessB,
            method_b=item.methodB,
            thickness_delta_meters=item.thicknessDeltaMeters,
            status=item.status,
            verified_thickness_meters=item.verifiedThicknessMeters,
            reconciliation_notes=item.reconciliationNotes,
            digital_signature_hash=item.digitalSignatureHash,
            audit_docket_no=item.auditDocketNo
        )


class IngestionJobModel(Base):
    """Persistent storage for OCR ingestion pipeline runs."""
    __tablename__ = "ingestion_jobs"

    job_id = Column(String(50), primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    page_count = Column(Integer, default=1)
    status = Column(String(50), default="PENDING")
    confidence_score = Column(Float, default=0.0)
    ocr_engine = Column(String(100), default="none")
    extracted_boreholes_json = Column(Text, default="[]")
    extracted_intervals_json = Column(Text, default="[]")
    bounding_boxes_json = Column(Text, default="[]")
    warnings_json = Column(Text, default="[]")
    created_at = Column(DateTime, default=datetime.utcnow)


class DocumentChunkModel(Base):
    """Persistent storage for document chunks (RAG, hybrid search, citations)."""
    __tablename__ = "document_chunks"

    chunk_id = Column(String(64), primary_key=True, index=True)
    document_id = Column(String(100), index=True, nullable=False)
    document_title = Column(String(255), nullable=False)
    agency = Column(String(50), nullable=False)
    year = Column(Integer, nullable=False)
    page_number = Column(Integer, default=1)
    text_content = Column(Text, nullable=False)
    bbox_json = Column(Text, nullable=True)
    sha256_hash = Column(String(64), nullable=False)
    metadata_json = Column(Text, default="{}")
    created_at = Column(DateTime, default=datetime.utcnow)
