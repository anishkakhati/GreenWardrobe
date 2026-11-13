"""Pytest fixtures and configuration for GreenWardrobe tests."""

import io
from PIL import Image
import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client():
    """FastAPI TestClient fixture."""
    return TestClient(app)


@pytest.fixture
def valid_jpeg_bytes() -> bytes:
    """Generate in-memory valid JPEG image bytes."""
    buffer = io.BytesIO()
    img = Image.new("RGB", (100, 100), color=(73, 109, 137))
    img.save(buffer, format="JPEG")
    return buffer.getvalue()


@pytest.fixture
def valid_png_bytes() -> bytes:
    """Generate in-memory valid PNG image bytes."""
    buffer = io.BytesIO()
    img = Image.new("RGB", (100, 100), color=(255, 0, 0))
    img.save(buffer, format="PNG")
    return buffer.getvalue()


@pytest.fixture
def corrupt_image_bytes() -> bytes:
    """Generate arbitrary invalid bytes simulating corrupt file."""
    return b"NOT_A_REAL_IMAGE_HEADER_DATA_123456"
