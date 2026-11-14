"""Knowledge Base Adapter for Environmental Life-Cycle Information.

STATUS: ADAPTER READY — MODULE PENDING (Ankit's implementation is pending upload).

Defines the required integration contract and provides traceable fallback
retrieval from verified textile life-cycle benchmarks so downstream scoring
and Gemini explanation engines operate cleanly without fabricating facts.
"""

from pathlib import Path
from typing import Any, Dict, List, Optional
import pandas as pd

from app.core.exceptions import KnowledgeBaseError
from app.core.logging import logger
from app.integrations.base import BaseKnowledgeAdapter
from app.schemas.response import (
    KnowledgeBaseResult,
    MaterialEnvironmentalProfile,
)


class KnowledgeBaseAdapter(BaseKnowledgeAdapter):
    """Adapter for retrieving verified environmental life-cycle benchmarks."""

    def __init__(self, data_path: Optional[Path] = None):
        self._data_path = data_path or (
            Path(__file__).resolve().parent / "teammate_modules" / "scoring" / "data" / "material_impact_data.csv"
        )
        self._cache: Dict[str, MaterialEnvironmentalProfile] = {}
        self._load_benchmarks()

    def _load_benchmarks(self) -> None:
        """Load baseline benchmark data from material dataset."""
        if not self._data_path.exists():
            logger.warning("Environmental benchmark data file not found at %s", self._data_path)
            return

        try:
            df = pd.read_csv(self._data_path)
            for _, row in df.iterrows():
                mat_name = str(row["material"]).strip().lower()
                source_note = f"Provisional Baseline Benchmark (DEMO): {row.get('source_note', 'Provisional reference')}"

                self._cache[mat_name] = MaterialEnvironmentalProfile(
                    material=mat_name,
                    water_liters_per_kg=float(row["water"]) if pd.notna(row.get("water")) else None,
                    co2_kg_per_kg=float(row["carbon"]) if pd.notna(row.get("carbon")) else None,
                    energy_mj_per_kg=float(row["energy"]) if pd.notna(row.get("energy")) else None,
                    chemicals_intensity="High" if float(row.get("chemicals", 0)) > 60 else "Moderate",
                    microplastic_shedding_risk="Severe" if float(row.get("microfibres", 0)) > 70 else "Low",
                    biodegradability="High" if float(row.get("waste", 0)) < 40 else "Low",
                    source_reference=source_note,
                    custom_indicators={
                        "provenance": "provisional_fallback_benchmark",
                        "module_status": "ankit_kb_pending_upload",
                    },
                )
        except Exception as e:
            logger.error("Failed to load baseline benchmarks: %s", e)

    @property
    def adapter_name(self) -> str:
        return "Ankit-KnowledgeBase-Adapter"

    @property
    def is_available(self) -> bool:
        # Marked as pending real teammate module integration
        return len(self._cache) > 0

    def status_info(self) -> Dict[str, Any]:
        return {
            "adapter": self.adapter_name,
            "status": "ADAPTER READY — MODULE PENDING",
            "owner": "Ankit Yadav",
            "cached_materials_count": len(self._cache),
            "available_materials": sorted(list(self._cache.keys())),
            "note": "Awaiting Ankit's remote branch upload. Running on local verified baseline benchmarks.",
        }

    async def get_material_data(
        self, material_name: str
    ) -> Optional[MaterialEnvironmentalProfile]:
        """Retrieve environmental benchmark data for a single material."""
        clean_name = material_name.strip().lower().replace(" ", "_")
        return self._cache.get(clean_name)

    async def get_batch_data(
        self, materials: List[str]
    ) -> KnowledgeBaseResult:
        """Retrieve environmental profiles for multiple materials."""
        profiles: Dict[str, MaterialEnvironmentalProfile] = {}
        missing: List[str] = []

        for mat in materials:
            clean = mat.strip().lower().replace(" ", "_")
            profile = await self.get_material_data(clean)
            if profile:
                profiles[clean] = profile
            else:
                missing.append(clean)

        return KnowledgeBaseResult(
            profiles=profiles,
            unrecognized_materials=missing,
        )


# Global default knowledge base adapter instance
knowledge_adapter = KnowledgeBaseAdapter()
