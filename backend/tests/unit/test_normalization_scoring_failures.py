"""Scoring failure responses must preserve analysis without fabricated results."""

import asyncio

import pytest

from app.integrations.ocr_adapter import OCRAdapter
from app.schemas.response import OCRCompositionItem, OCRResult
from app.services.normalization_service import NormalizationService


class UnusedVisionAdapter:
    """Avoid running CV for label-only pipeline cases in these tests."""

    def status_info(self):
        return {"adapter": "unused-test-vision"}


class ExplodingScorer:
    def calculate_impact(self, composition, **kwargs):
        raise RuntimeError("test scoring engine failure")

    def status_info(self):
        return {"adapter": "exploding-test-scorer"}


def make_ocr_adapter(percentages):
    result = OCRResult(
        composition=[
            OCRCompositionItem(material=material, percentage=percentage)
            for material, percentage in percentages
        ],
        confidence=0.87,
        raw_text="fixture label text",
        unreadable=not percentages,
        warnings=["OCR fixture warning"] if percentages else [],
    )
    return OCRAdapter(custom_extractor=lambda image: result)


async def run_label_pipeline(make_image_bytes, percentages, scoring_adapter=None):
    return await NormalizationService.execute_pipeline(
        label_image_bytes=make_image_bytes(fmt="JPEG"),
        label_filename="test-label.jpg",
        ocr_adapter_instance=make_ocr_adapter(percentages),
        vision_adapter_instance=UnusedVisionAdapter(),
        scoring_adapter_instance=scoring_adapter,
    )


@pytest.mark.parametrize(
    "composition",
    [
        [("Wool", 84.0), ("Acrylic", 84.0)],  # 168%, matching label_0001 OCR failure
        [("Cotton", 80.0)],  # incomplete composition rejected by the scorer
    ],
)
def test_invalid_composition_preserves_ocr_and_returns_no_score_or_recommendation(
    make_image_bytes, composition
):
    response = asyncio.run(run_label_pipeline(make_image_bytes, composition))

    assert response.success is True
    assert [(m.name, m.percentage) for m in response.product.composition.materials] == [
        (name.lower(), percentage) for name, percentage in composition
    ]
    assert response.product.composition.confidence == 0.87
    assert response.confidence["ocr"] == 0.87
    assert "OCR fixture warning" in response.warnings
    assert response.impact_assessment.overall_impact_score is None
    assert response.impact_assessment.recommendation is None
    assert response.impact_assessment.key_indicators["status"] == "INSUFFICIENT_DATA"
    assert response.impact_assessment.key_indicators["reason"]
    assert any("scoring calculation warning" in warning.lower() for warning in response.warnings)


def test_valid_100_percent_composition_receives_real_score_and_recommendation(make_image_bytes):
    response = asyncio.run(run_label_pipeline(make_image_bytes, [("Cotton", 100.0)]))

    assert response.success is True
    assert response.impact_assessment.overall_impact_score is not None
    assert response.impact_assessment.recommendation is not None
    assert response.impact_assessment.calculation_basis == "rule_based_lca_weighted_average"


def test_scoring_engine_exception_returns_null_score_and_recommendation(make_image_bytes):
    response = asyncio.run(
        run_label_pipeline(
            make_image_bytes,
            [("Cotton", 100.0)],
            scoring_adapter=ExplodingScorer(),
        )
    )

    assert response.impact_assessment.overall_impact_score is None
    assert response.impact_assessment.recommendation is None
    assert response.impact_assessment.key_indicators["status"] == "ENGINE_ERROR"
    assert response.impact_assessment.key_indicators["reason"] == "test scoring engine failure"
    assert any("scoring engine failure" in warning.lower() for warning in response.warnings)


def test_missing_composition_returns_null_score_and_recommendation(make_image_bytes):
    response = asyncio.run(run_label_pipeline(make_image_bytes, []))

    assert response.success is False
    assert response.product.composition is None
    assert response.impact_assessment.overall_impact_score is None
    assert response.impact_assessment.recommendation is None
    assert response.impact_assessment.key_indicators["status"] == "NO_COMPOSITION_DATA"
