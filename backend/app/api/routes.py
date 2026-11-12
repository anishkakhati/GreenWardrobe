
from fastapi import APIRouter, UploadFile, File, HTTPException
from PIL import Image, UnidentifiedImageError
from io import BytesIO

router = APIRouter()

MAX_FILE_SIZE = 10 * 1024 * 1024

ALLOWED_FORMATS = {
    "JPEG": "image/jpeg",
    "PNG": "image/png",
    "WEBP": "image/webp"
}


async def validate_image(file: UploadFile):

    # Check whether a file was provided
    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file selected."
        )

    # Read the uploaded image
    contents = await file.read(MAX_FILE_SIZE + 1)

    # Check empty file
    if not contents:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty."
        )

    # Check file size
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="Image size must not exceed 10 MB."
        )

    try:
        # Verify actual image content
        image = Image.open(BytesIO(contents))
        image.verify()

        # Reopen image to obtain dimensions
        image = Image.open(BytesIO(contents))

        image_format = image.format

        if image_format not in ALLOWED_FORMATS:
            raise HTTPException(
                status_code=415,
                detail="Only JPEG, PNG and WEBP images are allowed."
            )

        return {
            "filename": file.filename,
            "format": image_format,
            "width": image.width,
            "height": image.height,
            "size_bytes": len(contents)
        }

    except (UnidentifiedImageError, OSError, SyntaxError):
        raise HTTPException(
            status_code=400,
            detail="Invalid or corrupted image."
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
