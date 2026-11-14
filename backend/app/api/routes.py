from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.core.config import settings
from app.core.exceptions import ImageValidationError
from app.schemas.response import AnalysisResponse
from app.services.analysis_service import analysis_service
from app.services.image_service import image_service

router = APIRouter()

MAX_FILE_SIZE = settings.MAX_UPLOAD_SIZE_BYTES

ALLOWED_FORMATS = {
    "JPEG": "image/jpeg",
    "PNG": "image/png",
    "WEBP": "image/webp"
}


async def validate_image(file: UploadFile):
    """Validate uploaded image file using central ImageService while preserving backward-compatible error types."""
    try:
        processed = await image_service.validate_and_process_upload(file)
        return processed.to_dict()
    except ImageValidationError as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=e.message,
        )


@router.post("/upload")
async def upload_garment(
    garment_image: UploadFile = File(...),
    label_image: UploadFile | None = File(default=None)
):

    garment_data = await validate_image(garment_image)

    label_data = None

    if label_image is not None:
        label_data = await validate_image(label_image)

    return {
        "message": "Images uploaded and validated successfully.",
        "garment_image": garment_data,
        "label_image": label_data
    }


@router.post(
    "/analyze",
    response_model=AnalysisResponse,
    summary="Analyze garment fabric composition, environmental impact, and get AI recommendations",
    description="Accepts garment and label images via multipart/form-data, extracts textile composition, calculates life-cycle environmental impact, and provides Gemini-grounded sustainable fashion advice.",
)
async def analyze_garment(
    label_image: UploadFile = File(..., description="Clothing care/composition label image (JPEG, PNG, WEBP)"),
    garment_image: UploadFile = File(..., description="Garment fabric surface texture image (JPEG, PNG, WEBP)"),
    shopping: bool = Form(default=True, description="Whether analyzing prior to purchase (True) or existing item (False)"),
    second_hand_available: bool = Form(default=False, description="Whether second-hand alternatives are available"),
    condition: str = Form(default="new", description="Garment condition: 'new', 'used', or 'damaged'"),
) -> AnalysisResponse:
    """Analyze garment images through the integrated GreenWardrobe AI pipeline."""
    return await analysis_service.analyze_garment(
        label_file=label_image,
        garment_file=garment_image,
        shopping=shopping,
        second_hand_available=second_hand_available,
        condition=condition,
    )
