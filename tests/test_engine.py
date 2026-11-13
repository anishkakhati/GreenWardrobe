import pytest
from green_wardrobe import EnvironmentalScorer, RecommendationEngine


def test_blend_returns_valid_score():
    result = EnvironmentalScorer().score({"polyester": 65, "cotton": 35})
    assert 0 <= result["overall_score"] <= 100
    assert result["data_coverage"] == 1.0


def test_composition_must_total_100():
    with pytest.raises(ValueError):
        EnvironmentalScorer().score({"cotton": 60, "polyester": 30})


def test_unknown_material_rejected():
    with pytest.raises(ValueError):
        EnvironmentalScorer().score({"unobtainium": 100})


def test_repair_rule():
    result = RecommendationEngine().recommend(90, garment_condition="damaged")
    assert result["recommendation"] == "Repair"


def test_reuse_rule():
    result = RecommendationEngine().recommend(90, garment_condition="usable")
    assert result["recommendation"] == "Reuse"


def test_second_hand_rule():
    result = RecommendationEngine().recommend(
        90, garment_condition="new", shopping=True, second_hand_available=True
    )
    assert result["recommendation"] == "Second-hand"


def test_high_impact_think_twice():
    result = RecommendationEngine().recommend(75, shopping=True)
    assert result["recommendation"] == "Think Twice"


def test_low_impact_buy():
    result = RecommendationEngine().recommend(30, shopping=True)
    assert result["recommendation"] == "Buy"
