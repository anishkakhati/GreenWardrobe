"""Main Analysis Orchestration Service for GreenWardrobe.

Connects the full pipeline:
ImageService -> Phase 5 Analysis Pipeline -> Gemini Explanation Service -> Standardized AnalysisResponse.
"""

from typing import Any, Optional
from fastapi import UploadFile

from app.core.exceptions import ImageValidationError
from app.core.logging import logger
from app.schemas.response import AnalysisResponse
from app.services.image_service import ProcessedImage, image_service
from app.services.normalization_service import normalization_service
from app.services.gemini_service import gemini_service, GeminiService


class AnalysisService:
    """Orchestrates end-to-end garment environmental analysis and AI explanation."""

    def __init__(self, gemini_svc: Optional[GeminiService] = None):
        self._gemini_svc = gemini_svc or gemini_service

    async def analyze_garment(
        self,
        label_file: UploadFile,
        garment_file: UploadFile,
        *,
        shopping: bool = True,
        second_hand_available: bool = False,
        condition: str = "new",
        ocr_adapter_instance: Optional[Any] = None,
        vision_adapter_instance: Optional[Any] = None,
        knowledge_adapter_instance: Optional[Any] = None,
        scoring_adapter_instance: Optional[Any] = None,
        gemini_service_instance: Optional[Any] = None,
    ) -> AnalysisResponse:
        """Validate uploaded images, run Phase 5 pipeline, and attach grounded Gemini explanation."""
        if not label_file:
            raise ImageValidationError("Missing required label_image file.", status_code=400)
        if not garment_file:
            raise ImageValidationError("Missing required garment_image file.", status_code=400)

        proc_label: Optional[ProcessedImage] = None
        proc_garment: Optional[ProcessedImage] = None

        try:
            # 1. Validate images and create ProcessedImage objects
            proc_label = await image_service.validate_and_process_upload(label_file)
            proc_garment = await image_service.validate_and_process_upload(garment_file)

            label_bytes = proc_label.raw_bytes
            garment_bytes = proc_garment.raw_bytes
            label_filename = proc_label.metadata.filename
            garment_filename = proc_garment.metadata.filename

            # 2. Execute Phase 5 cross-module analytical pipeline
            pipeline_response: AnalysisResponse = await normalization_service.execute_pipeline(
                label_image_bytes=label_bytes,
                label_filename=label_filename,
                garment_image_bytes=garment_bytes,
                garment_filename=garment_filename,
                shopping=shopping,
                second_hand_available=second_hand_available,
                condition=condition,
                ocr_adapter_instance=ocr_adapter_instance,
                vision_adapter_instance=vision_adapter_instance,
                knowledge_adapter_instance=knowledge_adapter_instance,
                scoring_adapter_instance=scoring_adapter_instance,
            )
        finally:
            # Guaranteed cleanup of every successfully created ProcessedImage
            if proc_label is not None:
                try:
                    proc_label.cleanup()
                except Exception as e:
                    logger.debug("Error during proc_label cleanup: %s", str(e))
            if proc_garment is not None:
                try:
                    proc_garment.cleanup()
                except Exception as e:
                    logger.debug("Error during proc_garment cleanup: %s", str(e))

        # 3. Invoke Gemini Explanation Layer (using public GeminiService method)
        gem_svc = gemini_service_instance or self._gemini_svc
        try:
            explanation = await gem_svc.explain_analysis(
                product=pipeline_response.product,
                environmental_data=pipeline_response.environmental_data,
                impact_assessment=pipeline_response.impact_assessment,
                confidence=pipeline_response.confidence,
                warnings=pipeline_response.warnings,
                limitations=pipeline_response.limitations,
            )
        except Exception as e:
            logger.warning("Gemini explanation layer failed: %s", str(e))
            explanation = gem_svc.generate_fallback_explanation(
                analysis_data={
                    "product": pipeline_response.product.model_dump(mode="json"),
                    "environmental_data": {
                        k: v.model_dump(mode="json")
                        for k, v in pipeline_response.environmental_data.items()
                    },
                    "impact_assessment": pipeline_response.impact_assessment.model_dump(mode="json"),
                    "warnings": pipeline_response.warnings,
                    "limitations": pipeline_response.limitations,
                },
                reason=f"Explanation layer error: {str(e)}",
                status="UNAVAILABLE",
            )

        # 4. Attach explanation & update operational metadata
        pipeline_response.ai_explanation = explanation
        pipeline_response.metadata.gemini_model = gem_svc.adapter.model_name
        pipeline_response.metadata.explanation_status = explanation.status

        return pipeline_response


# Global default analysis service instance
analysis_service = AnalysisService()
