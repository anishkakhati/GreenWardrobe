"""Comprehensive unit tests for module integration adapters and normalization service.

Covers:
- ScoringAdapter with real Maneesh engine execution.
- OCRAdapter with Harshit's regex parsing and dependency isolation.
- VisionAdapter with Anshika's ResNet18 asset bounds and test double injection.
- KnowledgeBaseAdapter contract and benchmark retrieval.
- NormalizationService alias mapping, percentage validation, and perception conflict detection.
"""

import pytest

from app.core.exceptions import ScoringError
from app.integrations.knowledge_adapter import KnowledgeBaseAdapter, knowledge_adapter
from app.integrations.ocr_adapter import OCRAdapter, ocr_adapter
from app.integrations.scoring_adapter import ScoringAdapter, scoring_adapter
from app.integrations.vision_adapter import VisionAdapter, vision_adapter
from app.schemas.common import AnalysisSource
from app.schemas.response import (
    OCRCompositionItem,
    OCRResult,
    VisionPrediction,
)
from app.services.image_service import ImageService
from app.services.normalization_service import NormalizationService, normalization_service


# ==============================================================================
# 1. Scoring Adapter Tests (Real Maneesh Engine Integration)
# ==============================================================================

def test_scoring_adapter_status_info():
    """Verify ScoringAdapter status metadata indicates verified integration."""
    status = scoring_adapter.status_info()
    assert status["adapter"] == "Maneesh-ScoringEngine-Adapter"
    assert status["status"] == "REAL INTEGRATION VERIFIED"
    assert "carbon" in status["weights_configured"]
    assert status["available_materials_count"] >= 8


def test_scoring_adapter_real_blend_calculation():
    """Verify real calculation on 65% polyester / 35% cotton blend."""
    comp = {"polyester": 65.0, "cotton": 35.0}
    result = scoring_adapter.calculate_impact(comp, shopping=True)

    assert result.overall_impact_score > 0.0
    assert result.overall_impact_score <= 100.0
    assert result.recommendation in ["Buy", "Think Twice"]
    assert result.breakdown is not None
    assert result.breakdown.water is not None
    assert result.breakdown.carbon is not None
    assert result.breakdown.microfibres is not None
    # Polyester has high microfibre shedding in Maneesh's benchmark
    assert result.breakdown.microfibres.score > 60.0


def test_scoring_adapter_garment_condition_override():
    """Verify damaged garment recommendation overrides score to 'Repair'."""
    comp = {"cotton": 100.0}
    result = scoring_adapter.calculate_impact(comp, garment_condition="damaged")
    assert result.recommendation == "Repair"
    assert "repair" in result.key_indicators["recommendation_reason"].lower()


def test_scoring_adapter_unknown_material_error():
    """Verify unknown material raises ScoringError with clear message."""
    with pytest.raises(ScoringError) as exc:
        scoring_adapter.calculate_impact({"kryptonite_fiber": 100.0})
    assert exc.value.status_code == 422
    assert "unknown material" in exc.value.message.lower()


def test_scoring_insufficient_data_coverage_rule(tmp_path):
    """Verify minimum 60% category weight coverage rule rejects insufficient data."""
    import pandas as pd
    from app.integrations.teammate_modules.scoring import EnvironmentalScorer

    # Create dummy dataset where all columns except water are missing (water weight = 0.20 < 0.60)
    sparse_csv = tmp_path / "sparse.csv"
    df = pd.DataFrame([
        {"material": "sparse_mat", "water": 50.0, "carbon": None, "energy": None, "chemicals": None, "microfibres": None, "waste": None}
    ])
    df.to_csv(sparse_csv, index=False)

    scorer = EnvironmentalScorer(data_path=sparse_csv)
    with pytest.raises(ValueError) as exc:
        scorer.score({"sparse_mat": 100.0})
    assert "Insufficient environmental data coverage" in str(exc.value)
    assert "60%" in str(exc.value)


# ==============================================================================
# 2. OCR Adapter & Parser Tests (Harshit's Logic)
# ==============================================================================

def test_ocr_adapter_status_info():
    """Verify OCRAdapter status cleanly identifies engine state."""
    status = ocr_adapter.status_info()
    assert status["adapter"] == "Harshit-ClothingLabelOCR-Adapter"
    assert "COTTON" in status["supported_fibres"]
    assert "POLYESTER" in status["supported_fibres"]


def test_ocr_parser_regex_extraction():
    """Verify Harshit's regex parses multiple fibers in standard label formats."""
    raw_label = "FABRIC MADE IN PORTUGAL. 80% COTTON 20% POLYESTER. EXCLUSIVE OF TRIMMINGS."
    from app.integrations.teammate_modules.ocr.text_parser import parse_composition
    parsed = parse_composition(raw_label)

    assert "COTTON" in parsed
    assert parsed["COTTON"] == [80.0]
    assert "POLYESTER" in parsed
    assert parsed["POLYESTER"] == [20.0]


def test_ocr_adapter_execution_without_easyocr(make_image_bytes):
    """Verify OCRAdapter handles missing EasyOCR gracefully with transparent warning."""
    # Adapter without reader instance
    empty_adapter = OCRAdapter(ocr_reader=None)
    empty_adapter._initialized = True
    empty_adapter._easyocr_available = False

    data = make_image_bytes(fmt="JPEG")
    processed = ImageService.process_image(data, "label.jpg")

    import asyncio
    result = asyncio.run(empty_adapter.extract_composition(processed))
    assert result.unreadable is True
    assert len(result.warnings) > 0
    assert "not available" in result.warnings[0].lower()


def test_ocr_adapter_injected_double(make_image_bytes):
    """Verify OCRAdapter works with mock reader injection."""
    class FakeReader:
        def readtext(self, img, detail=1, paragraph=False):
            # Return coordinates, text, and confidence
            return [
                ([[0, 0], [10, 0], [10, 10], [0, 10]], "100% COTTON", 0.95)
            ]

    mock_adapter = OCRAdapter(ocr_reader=FakeReader())
    data = make_image_bytes(fmt="JPEG")
    processed = ImageService.process_image(data, "label.jpg")

    import asyncio
    result = asyncio.run(mock_adapter.extract_composition(processed))
    assert result.unreadable is False
    assert len(result.composition) == 1
    assert result.composition[0].material == "Cotton"
    assert result.composition[0].percentage == 100.0
    assert result.confidence == 0.95


# ==============================================================================
# 3. Vision Adapter Tests (Anshika's TextileNet ResNet-18)
# ==============================================================================

def test_vision_adapter_status_info():
    """Verify VisionAdapter status accurately flags missing pretrained checkpoint."""
    status = vision_adapter.status_info()
    assert status["adapter"] == "Anshika-TextileNet-Vision-Adapter"
    assert "res18_ckpt.pth" in status["status"] or "ASSET MISSING" in status["status"]
    assert status["classes_count"] == 33


def test_vision_adapter_missing_checkpoint_safety(make_image_bytes):
    """Verify VisionAdapter does not crash when weights are absent."""
    data = make_image_bytes(fmt="JPEG")
    processed = ImageService.process_image(data, "garment.jpg")

    import asyncio
    prediction = asyncio.run(vision_adapter.predict_material(processed))
    assert prediction.predicted_material is None
    assert prediction.confidence is None
    assert len(prediction.warnings) > 0
    assert "checkpoint not found" in prediction.warnings[0].lower()


def test_vision_adapter_injected_predictor(make_image_bytes):
    """Verify VisionAdapter accepts injected custom predictor double."""
    def fake_predictor(img):
        return VisionPrediction(
            predicted_material="cotton",
            confidence=0.91,
            alternatives=["linen", "hemp"],
            probabilities={"cotton": 0.91, "linen": 0.06, "hemp": 0.03},
            warnings=[],
        )

    test_adapter = VisionAdapter(custom_predictor=fake_predictor)
    data = make_image_bytes(fmt="JPEG")
    processed = ImageService.process_image(data, "shirt.jpg")

    import asyncio
    prediction = asyncio.run(test_adapter.predict_material(processed))
    assert prediction.predicted_material == "cotton"
    assert prediction.confidence == 0.91
    assert "linen" in prediction.alternatives


# ==============================================================================
# 4. Knowledge Base Adapter Tests (Ankit Contract)
# ==============================================================================

def test_knowledge_base_adapter_status():
    """Verify KnowledgeBaseAdapter reflects pending teammate module status."""
    status = knowledge_adapter.status_info()
    assert status["adapter"] == "Ankit-KnowledgeBase-Adapter"
    assert "PENDING" in status["status"]
    assert "polyester" in status["available_materials"]
    assert "cotton" in status["available_materials"]


def test_knowledge_base_retrieval():
    """Verify knowledge base retrieves verified benchmark metrics."""
    import asyncio
    profile = asyncio.run(knowledge_adapter.get_material_data("cotton"))
    assert profile is not None
    assert profile.material == "cotton"
    assert profile.water_liters_per_kg == 85.0
    assert profile.co2_kg_per_kg == 55.0


def test_knowledge_base_batch_retrieval():
    """Verify batch retrieval tracks unknown materials."""
    import asyncio
    batch = asyncio.run(knowledge_adapter.get_batch_data(["polyester", "wool", "unknown_fiber_xyz"]))
    assert "polyester" in batch.profiles
    assert "wool" in batch.profiles
    assert "unknown_fiber_xyz" in batch.unrecognized_materials


# ==============================================================================
# 5. Normalization Service Tests
# ==============================================================================

def test_canonicalize_material_names():
    """Verify alias mapping standardizes trade names and synonyms."""
    assert NormalizationService.canonicalize_material_name("Spandex") == "elastane"
    assert NormalizationService.canonicalize_material_name("Lycra") == "elastane"
    assert NormalizationService.canonicalize_material_name("POLY") == "polyester"
    assert NormalizationService.canonicalize_material_name("Rayon") == "viscose"
    assert NormalizationService.canonicalize_material_name("Flax") == "linen"
    assert NormalizationService.canonicalize_material_name("Organic Cotton") == "organic_cotton"


def test_normalize_ocr_composition():
    """Verify normalization of OCR result, merging duplicates and checking percentage sums."""
    ocr_result = OCRResult(
        composition=[
            OCRCompositionItem(material="COTTON", percentage=60.0),
            OCRCompositionItem(material="Ctn", percentage=10.0),
            OCRCompositionItem(material="POLYESTER", percentage=30.0),
        ],
        confidence=0.92,
        raw_text="60% COTTON 10% CTN 30% POLYESTER",
        unreadable=False,
    )

    comp, warnings = NormalizationService.normalize_ocr_composition(ocr_result)
    assert comp is not None
    assert len(comp.materials) == 2  # Cotton + Polyester
    cotton_mat = next(m for m in comp.materials if m.name == "cotton")
    assert cotton_mat.percentage == 70.0
    assert comp.is_complete is True


def test_synthesize_product_analysis_perception_conflict():
    """Verify that conflict between OCR and Vision is recorded as an explicit warning."""
    ocr_result = OCRResult(
        composition=[OCRCompositionItem(material="Wool", percentage=100.0)],
        confidence=0.95,
        raw_text="100% WOOL",
        unreadable=False,
    )
    vision_result = VisionPrediction(
        predicted_material="cotton",
        confidence=0.88,
        alternatives=["linen"],
    )

    product, warnings = NormalizationService.synthesize_product_analysis(
        ocr_result=ocr_result,
        vision_result=vision_result,
    )

    assert product.composition is not None
    assert product.composition_source == AnalysisSource.OCR_LABEL
    assert any("Perception Discrepancy" in w for w in warnings)


def test_concurrent_independent_streams_and_cleanup(make_image_bytes):
    """Verify OCR and Vision can process independent streams concurrently from ProcessedImage without corruption."""
    import asyncio

    # Setup injected mocks for OCR and Vision
    class FakeReader:
        def readtext(self, img, detail=1, paragraph=False):
            return [([[0, 0]], "100% COTTON", 0.94)]

    mock_ocr = OCRAdapter(ocr_reader=FakeReader())

    def fake_vision(img):
        # Read from image stream to ensure independent pointer
        stream = img.get_stream()
        assert len(stream.read()) > 0
        return VisionPrediction(
            predicted_material="cotton",
            confidence=0.90,
            alternatives=["linen"],
        )

    mock_vision = VisionAdapter(custom_predictor=fake_vision)

    data = make_image_bytes(fmt="JPEG")
    processed = ImageService.process_image(data, "test.jpg")

    async def _run_parallel():
        return await asyncio.gather(
            mock_ocr.extract_composition(processed),
            mock_vision.predict_material(processed),
        )

    ocr_res, vision_res = asyncio.run(_run_parallel())
    assert ocr_res.composition[0].material == "Cotton"
    assert vision_res.predicted_material == "cotton"

    # Verify cleanup only after all operations finish
    assert len(processed.raw_bytes) > 0
    processed.cleanup()
    assert len(processed.raw_bytes) == 0


def test_partial_failure_ocr_fails_vision_succeeds():
    """Verify graceful synthesis when OCR fails but Vision succeeds (fallback composition)."""
    ocr_result = OCRResult(unreadable=True, composition=[], warnings=["Label unreadable"])
    vision_result = VisionPrediction(
        predicted_material="linen",
        confidence=0.85,
        alternatives=["hemp"],
    )

    product, warnings = NormalizationService.synthesize_product_analysis(
        ocr_result=ocr_result,
        vision_result=vision_result,
    )

    assert product.composition is not None
    assert product.composition.materials[0].name == "linen"
    assert product.composition_source == AnalysisSource.COMPUTER_VISION
    assert any("Fallback composition estimated from Computer Vision" in w for w in warnings)


def test_partial_failure_vision_fails_ocr_succeeds():
    """Verify graceful synthesis when Vision is unavailable but OCR succeeds."""
    ocr_result = OCRResult(
        composition=[OCRCompositionItem(material="Silk", percentage=100.0)],
        confidence=0.98,
        unreadable=False,
    )
    vision_result = VisionPrediction(
        predicted_material=None,
        confidence=None,
        warnings=["Checkpoint res18_ckpt.pth missing"],
    )

    product, warnings = NormalizationService.synthesize_product_analysis(
        ocr_result=ocr_result,
        vision_result=vision_result,
    )

    assert product.composition is not None
    assert product.composition.materials[0].name == "silk"
    assert product.composition_source == AnalysisSource.OCR_LABEL
    assert any("Checkpoint res18_ckpt.pth missing" in w for w in warnings)

