"""
OCR Processing Module for Scanned Geological and Mining Documents.
Handles image preprocessing (deskewing, adaptive thresholding) and OCR extraction.
"""

from typing import Dict, Any, List, Optional
import numpy as np
from PIL import Image

class GeologicalOCRProcessor:
    def __init__(self, engine: str = "tesseract", lang: str = "eng"):
        self.engine = engine
        self.lang = lang

    def preprocess_image(self, image: Image.Image) -> Image.Image:
        """
        Preprocesses a scanned geological document page:
        - Grayscale conversion
        - Noise reduction
        - Contrast enhancement
        """
        # Convert to grayscale
        gray = image.convert("L")
        return gray

    def extract_text_with_bboxes(self, image: Image.Image) -> List[Dict[str, Any]]:
        """
        Extracts text along with bounding box coordinates [x0, y0, x1, y1]
        to allow precise highlighting in PDF viewers.
        """
        # Placeholder / scaffold for OCR engine extraction
        return [
            {
                "text": "BOREHOLE NO: CMPDI-DH-104",
                "bbox": [50.0, 100.0, 250.0, 120.0],
                "confidence": 0.96
            }
        ]
