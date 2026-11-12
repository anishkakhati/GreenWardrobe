
from pydantic import BaseModel, Field
from typing import Optional


class Material(BaseModel):
    name: str
    percentage: float = Field(ge=0, le=100)


class Composition(BaseModel):
    materials: list[Material]
    confidence: Optional[float] = Field(
        default=None, ge=0, le=1
    )


class VisionResult(BaseModel):
    predicted_material: Optional[str] = None
    confidence: Optional[float] = Field(
        default=None, ge=0, le=1
    )
    alternatives: list[str] = Field(
        default_factory=list
    )


class ImpactMetric(BaseModel):
    value: Optional[float] = None
    unit: Optional[str] = None


class EnvironmentalImpact(BaseModel):
    water: Optional[ImpactMetric] = None
    carbon: Optional[ImpactMetric] = None
    energy: Optional[ImpactMetric] = None
    chemicals: Optional[ImpactMetric] = None
    microfibres: Optional[ImpactMetric] = None
    waste: Optional[ImpactMetric] = None


class GreenWardrobeResponse(BaseModel):
    composition: Optional[Composition] = None
    vision_result: Optional[VisionResult] = None
    environmental_impact: Optional[EnvironmentalImpact] = None

    impact_score: Optional[float] = Field(
        default=None, ge=0, le=100
    )
    recommendation: Optional[str] = None
    explanation: Optional[str] = None

    warnings: list[str] = Field(
        default_factory=list
    )
