"""Textile label OCR text extraction and composition parsing logic.

Imported from Harshit's Clothing Label OCR module (origin/feature/-clothing-label-ocr).
Enhanced with robust boundary matching for colons, hyphens, and reversed material orders.
"""

import re
from typing import Dict, List, Optional, Tuple
import numpy as np

# Fibres officially recognized and evaluated in Harshit's OCR module
# + standard apparel extensions
SUPPORTED_FIBRES: List[str] = [
    "COTTON", "POLYESTER", "VISCOSE", "ELASTANE",
    "NYLON", "WOOL", "ACRYLIC", "LINEN", "MODAL", "SILK",
    "HEMP", "CASHMERE", "LYOCELL", "CUPRO", "RAMIE", "SPANDEX", "RAYON", "FLAX"
]


def normalize_text(text: str) -> str:
    """Normalize extracted OCR text to uppercase and collapse extra whitespace."""
    text = str(text).upper()
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def parse_composition(text: str) -> Dict[str, List[float]]:
    """Parse material names and their numerical percentages from text.

    Supports multiple formats:
    - Standard: '80% COTTON' or '80 % COTTON' or '80% OF COTTON'
    - Reversed: 'COTTON 80%' or 'COTTON: 80%' or 'COTTON - 80%'
    - Parenthetical: 'COTTON (80%)'
    """
    normalized = normalize_text(text)
    composition: Dict[str, List[float]] = {}

    for fibre in SUPPORTED_FIBRES:
        patterns = [
            rf"(\d+(?:\.\d+)?)\s*%\s*(?:OF\s+)?{fibre}\b",
            rf"\b{fibre}\s*[:\-\s]?\s*(\d+(?:\.\d+)?)\s*%",
            rf"\b{fibre}\s*\(\s*(\d+(?:\.\d+)?)\s*%\s*\)",
        ]

        for pattern in patterns:
            matches = re.findall(pattern, normalized)
            if matches:
                composition[fibre] = [float(value) for value in matches]
                break

    return composition


def preprocess_image_array(image_bgr: np.ndarray) -> np.ndarray:
    """Apply Harshit's exact OpenCV enhancement pipeline to an in-memory BGR array.

    Steps:
    1. Cubic interpolation scaling (1.5x)
    2. Grayscale conversion
    3. CLAHE contrast enhancement
    4. 3x3 Laplacian-style sharpening kernel
    """
    try:
        import cv2
    except ImportError:
        # Fallback if cv2 is not installed in environment
        return image_bgr

    # Resize
    resized = cv2.resize(image_bgr, None, fx=1.5, fy=1.5, interpolation=cv2.INTER_CUBIC)

    # Grayscale
    if len(resized.shape) == 3 and resized.shape[2] == 3:
        gray = cv2.cvtColor(resized, cv2.COLOR_BGR2GRAY)
    else:
        gray = resized

    # Contrast enhancement (CLAHE)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    enhanced = clahe.apply(gray)

    # Sharpening
    kernel = np.array([
        [0, -1, 0],
        [-1, 5, -1],
        [0, -1, 0]
    ])
    sharpened = cv2.filter2D(enhanced, -1, kernel)
    return sharpened
