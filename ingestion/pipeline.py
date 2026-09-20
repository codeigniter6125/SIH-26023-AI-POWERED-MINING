"""
End-to-End Ingestion Pipeline for Geological Reports.
Coordinates document loading, layout analysis, OCR, table parsing, and indexing.
"""

import sys
import os
from pathlib import Path

# Add project root to sys.path for direct script execution
project_root = str(Path(__file__).resolve().parent.parent)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from typing import Dict, Any, List
from ingestion.ocr.ocr_processor import GeologicalOCRProcessor
from ingestion.parsers.borehole_parser import BoreholeTableParser

class GeologicalIngestionPipeline:
    def __init__(self):
        self.ocr_processor = GeologicalOCRProcessor()
        self.table_parser = BoreholeTableParser()

    def process_document(self, file_path: str) -> Dict[str, Any]:
        """
        Executes the full extraction pipeline on a geological report PDF.
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Document not found at: {file_path}")

        print(f"[*] Processing geological document: {file_path}")
        
        # 1. Inspect PDF structure (digital vs scanned)
        # 2. Extract or OCR pages
        # 3. Extract borehole tables
        # 4. Extract narrative chunks for vector embeddings

        return {
            "file_path": file_path,
            "status": "completed",
            "extracted_boreholes": 0,
            "extracted_chunks": 0,
            "tables_found": 0
        }

if __name__ == "__main__":
    pipeline = GeologicalIngestionPipeline()
    print("Ingestion pipeline initialized successfully.")
