from fastapi import APIRouter, UploadFile, File, HTTPException
from app.core.config import settings
from app.core.exceptions import ImageValidationError
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
