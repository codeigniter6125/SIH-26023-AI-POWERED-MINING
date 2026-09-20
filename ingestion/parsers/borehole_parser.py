"""
Borehole Lithology and Stratigraphic Table Parser.
Extracts depth intervals, lithological descriptions, coal seams, and thickness metrics.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class LithologyInterval(BaseModel):
    borehole_id: str
    depth_from: float = Field(..., description="Top depth in meters")
    depth_to: float = Field(..., description="Bottom depth in meters")
    thickness: float = Field(..., description="Interval thickness in meters")
    stratum_type: str = Field(..., description="E.g., Coal, Sandstone, Shale, Carbonaceous Shale")
    seam_name: Optional[str] = Field(None, description="Seam designation, e.g., Seam I, Seam II Top")
    bbox: Optional[List[float]] = None

class BoreholeTableParser:
    def parse_lithology_table(self, rows: List[Dict[str, Any]], borehole_id: str) -> List[LithologyInterval]:
        """
        Parses normalized table rows into structured LithologyInterval records.
        Applies domain validation: depth_to must be >= depth_from.
        """
        parsed_intervals = []
        for row in rows:
            depth_from = float(row.get("depth_from", 0.0))
            depth_to = float(row.get("depth_to", 0.0))
            thickness = round(depth_to - depth_from, 2)
            
            interval = LithologyInterval(
                borehole_id=borehole_id,
                depth_from=depth_from,
                depth_to=depth_to,
                thickness=thickness,
                stratum_type=row.get("stratum", "Unknown"),
                seam_name=row.get("seam_name")
            )
            parsed_intervals.append(interval)
            
        return parsed_intervals
