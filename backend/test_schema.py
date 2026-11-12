
from app.schemas.response import (
    Material,
    Composition,
    GreenWardrobeResponse
)

composition = Composition(
    materials=[
        Material(name="polyester", percentage=65),
        Material(name="cotton", percentage=35)
    ],
    confidence=0.94
)

result = GreenWardrobeResponse(
    composition=composition,
    impact_score=None,
    recommendation=None,
    explanation=None,
    warnings=["Environmental analysis not performed yet."]
)

print(result.model_dump_json(indent=2))
