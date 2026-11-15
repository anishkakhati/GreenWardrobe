
import logging
import os
import tempfile
from pathlib import Path

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, UnidentifiedImageError

from src.inference import MaterialPredictor


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="GreenWardrobe Computer Vision API",
    description="AI-powered garment material identification",
    version="1.0.0",
)

allowed_origins = [
    origin.strip()
    for origin in os.getenv("GREENWARDROBE_ALLOWED_ORIGINS", "").split(",")
    if origin.strip()
]

if allowed_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=False,
        allow_methods=["GET", "POST"],
        allow_headers=["*"],
    )

# Load the model once when the API starts.
predictor = MaterialPredictor()

MAX_FILE_SIZE = 10 * 1024 * 1024

SUPPORTED_FORMATS = {
    "JPEG": ".jpg",
    "PNG": ".png",
    "WEBP": ".webp",
}

ALLOWED_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
}


@app.get("/")
def root():
    return {
        "service": "GreenWardrobe Computer Vision API",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "model": "GreenWardrobe-ResNet18",
        "device": str(predictor.device),
        "classes": list(predictor.class_to_id.keys()),
    }


@app.post("/predict")
async def predict_material(file: UploadFile = File(...)):
    temp_path = None

    try:
        if file.content_type not in ALLOWED_TYPES:
            raise HTTPException(
                status_code=400,
                detail="Only JPEG, PNG and WEBP images are supported.",
            )

        contents = await file.read(MAX_FILE_SIZE + 1)

        if not contents:
            raise HTTPException(
                status_code=400,
                detail="Uploaded image is empty.",
            )

        if len(contents) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail="Image size must not exceed 10 MB.",
            )

        try:
            from io import BytesIO

            with Image.open(BytesIO(contents)) as image:
                image_format = image.format

                if image_format not in SUPPORTED_FORMATS:
                    raise HTTPException(
                        status_code=400,
                        detail="Unsupported image format.",
                    )

                image.verify()

        except (UnidentifiedImageError, OSError, Image.DecompressionBombError):
            raise HTTPException(
                status_code=400,
                detail="Uploaded file is not a valid image.",
            )

        expected_content_type = {
            "JPEG": "image/jpeg",
            "PNG": "image/png",
            "WEBP": "image/webp",
        }[image_format]

        if file.content_type != expected_content_type:
            raise HTTPException(
                status_code=400,
                detail="Image content does not match its declared file type.",
            )

        suffix = SUPPORTED_FORMATS[image_format]

        with tempfile.NamedTemporaryFile(
            suffix=suffix,
            delete=False,
        ) as temp_file:
            temp_file.write(contents)
            temp_path = temp_file.name

        result = predictor.predict(
            image_path=temp_path,
            top_k=3,
        )

        return {
            **result,
            "filename": Path(file.filename or "upload").name,
        }

    except HTTPException:
        raise

    except Exception:
        logger.exception("Material prediction failed")

        raise HTTPException(
            status_code=500,
            detail="Material prediction failed. Please try again.",
        )

    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)

        await file.close()
