from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

# Document Schemas
class DocumentBase(BaseModel):
    title: str
    block_name: Optional[str] = None
    coalfield: Optional[str] = None
    subsidiary: Optional[str] = None
    year: Optional[int] = None

class DocumentResponse(DocumentBase):
    id: str
    filename: str
    status: str
    page_count: int = 0
    created_at: str

# Query Schemas
class QueryRequest(BaseModel):
    query: str
    session_id: Optional[str] = None
    filters: Optional[Dict[str, Any]] = None

class Citation(BaseModel):
    document_id: str
    document_name: str
    page: int
    bounding_box: Optional[List[float]] = None
    snippet: str

class QueryResponse(BaseModel):
    answer: str
    confidence_score: float
    reasoning_steps: List[str] = []
    citations: List[Citation] = []
    validation_status: str
    agent_trace: Dict[str, Any] = {}

# Geological / Reserve Calculation Schemas
class ReserveCalculationRequest(BaseModel):
    block_name: str
    seam_name: str
    area_sq_m: float = Field(..., description="Block area in square meters")
    thickness_m: float = Field(..., description="Average seam thickness in meters")
    specific_gravity: float = Field(1.4, description="Specific gravity (t/m^3), default 1.4 for coal")

class ReserveCalculationResponse(BaseModel):
    seam_name: str
    geological_reserves_mt: float
    grade_classification: Optional[str] = None
    formula_used: str
    is_validated: bool
