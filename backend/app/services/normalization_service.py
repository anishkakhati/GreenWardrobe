"""Textile composition normalization and cross-module synthesis service.

Normalizes material nomenclature across OCR, Computer Vision, and Knowledge Base.
Validates blend percentage sums, checks confidence thresholds, and detects
conflicts between label OCR and surface computer vision predictions without
silently mutating uncertain findings.
"""

from typing import Any, Dict, List, Optional, Tuple

from app.core.logging import logger
from app.schemas.common import AnalysisSource
from app.schemas.response import (
    Composition,
    Material,
    OCRResult,
    ProductAnalysis,
    VisionPrediction,
)

# Standardized material alias dictionary
# Maps known alternative spellings, acronyms, and trade names to canonical canonical keys
_TEXTILE_ALIASES: Dict[str, str] = {
    # Cotton variants
    "cotton": "cotton",
    "organic cotton": "organic_cotton",
    "organic_cotton": "organic_cotton",
    "ctn": "cotton",
    # Synthetics
    "polyester": "polyester",
    "poly": "polyester",
    "nylon": "nylon",
    "polyamide": "nylon",
    "acrylic": "acrylic",
    "elastane": "elastane",
    "spandex": "elastane",
    "lycra": "elastane",
    "elastane_spandex": "elastane",
    # Cellulosics & Naturals
    "viscose": "viscose",
    "rayon": "viscose",
    "viscose_rayon": "viscose",
    "modal": "modal",
    "lyocell": "lyocell",
    "tencel": "lyocell",
    "linen": "linen",
    "flax": "linen",
    "flax_linen": "linen",
    "hemp": "hemp",
    "silk": "silk",
    "wool": "wool",
}


class NormalizationService:
    """Service providing canonicalization, percentage validation, and perception cross-checks."""

    @staticmethod
    def canonicalize_material_name(raw_name: str) -> str:
        """Standardize a textile fiber name to its canonical lower_case key."""
        if not raw_name:
            return "unknown"

        cleaned = raw_name.strip().lower().replace("-", "_").replace(" ", "_")
        # Direct check
        if cleaned in _TEXTILE_ALIASES:
            return _TEXTILE_ALIASES[cleaned]

        # Space-separated check
        spaced = cleaned.replace("_", " ")
        if spaced in _TEXTILE_ALIASES:
            return _TEXTILE_ALIASES[spaced]

        return cleaned

    @classmethod
    def normalize_ocr_composition(
        cls, ocr_result: OCRResult
    ) -> Tuple[Optional[Composition], List[str]]:
        """Convert raw OCR extraction into a normalized Composition object with integrity warnings."""
        warnings: List[str] = list(ocr_result.warnings)

        if ocr_result.unreadable or not ocr_result.composition:
            return None, warnings

        materials_map: Dict[str, float] = {}
        for item in ocr_result.composition:
            canon = cls.canonicalize_material_name(item.material)
            # Combine duplicate fiber entries if OCR matched twice
            materials_map[canon] = materials_map.get(canon, 0.0) + item.percentage

        material_list = [
            Material(name=name, percentage=round(pct, 2))
            for name, pct in materials_map.items()
        ]

        comp = Composition(
            materials=material_list,
            confidence=ocr_result.confidence,
            source=AnalysisSource.OCR_LABEL,
        )

        total_pct = comp.total_percentage
        if not comp.is_complete:
            warnings.append(
                f"Label composition is partial or incomplete: percentages sum to {total_pct:.1f}% (expected ~100%)."
            )

        return comp, warnings

    @classmethod
    def synthesize_product_analysis(
        cls,
        ocr_result: Optional[OCRResult] = None,
        vision_result: Optional[VisionPrediction] = None,
    ) -> Tuple[ProductAnalysis, List[str]]:
        """Synthesize findings from OCR and Computer Vision, flagging discrepancies."""
        warnings: List[str] = []
        composition: Optional[Composition] = None
        source = AnalysisSource.UNKNOWN

        # 1. Process OCR if available
        if ocr_result is not None:
            composition, ocr_warnings = cls.normalize_ocr_composition(ocr_result)
            warnings.extend(ocr_warnings)
            if composition is not None:
                source = AnalysisSource.OCR_LABEL

        # 2. Cross-reference Computer Vision predictions
        if vision_result is not None:
            warnings.extend(vision_result.warnings)

            # If OCR failed or was unavailable, but CV predicted a material with high confidence
            if composition is None and vision_result.predicted_material:
                cv_material = cls.canonicalize_material_name(vision_result.predicted_material)
                source = AnalysisSource.COMPUTER_VISION
                warnings.append(
                    f"Label unreadable or missing. Fallback composition estimated from Computer Vision ({cv_material})."
                )
                composition = Composition(
                    materials=[Material(name=cv_material, percentage=100.0)],
                    confidence=vision_result.confidence,
                    source=AnalysisSource.COMPUTER_VISION,
                )

            # Check for perception discrepancies between OCR and Vision
            elif composition is not None and vision_result.predicted_material:
                cv_material = cls.canonicalize_material_name(vision_result.predicted_material)
                ocr_materials = {m.name for m in composition.materials}

                # If primary CV prediction does not appear in the label materials
                if cv_material not in ocr_materials and (vision_result.confidence or 0.0) >= 0.70:
                    warnings.append(
                        f"Perception Discrepancy: Surface computer vision predicted '{cv_material}' ({vision_result.confidence:.0%} confidence), "
                        f"but label OCR detected {sorted(list(ocr_materials))}."
                    )

        product = ProductAnalysis(
            composition=composition,
            visual_prediction=vision_result,
            composition_source=source,
        )

        return product, warnings


# Global default normalization service instance
normalization_service = NormalizationService()
