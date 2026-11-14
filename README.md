# GreenWardrobe: Backend

## Phase 1: Backend Development and Module Integration

### 1. Objective

This module implements the backend infrastructure for GreenWardrobe, an AI-powered application for analysing textile composition and assessing the environmental impact of clothing.

The backend is developed using FastAPI and integrates Computer Vision, Optical Character Recognition (OCR), a material Knowledge Base, and an Environmental Scoring Engine.

The system accepts a single image of either a garment or its care label. It automatically identifies the image type and routes it to the appropriate processing pipeline.

### 2. Technology Stack

| Property | Details |
|---|---|
| Language | Python |
| API Framework | FastAPI |
| Validation | Pydantic |
| Computer Vision | PyTorch, TextileNet ResNet-18 |
| OCR | EasyOCR |
| Image Processing | OpenCV, Pillow |
| Numerical Processing | NumPy |
| AI Explanation | Google Gemini API |
| Testing | Pytest |

### 3. Backend Architecture

The backend follows a modular architecture in which individual components communicate through adapters and defined interfaces.

The primary processing pipeline is:

```text
Single Image Upload
        |
        v
   FastAPI API
        |
        v
  Image Validation
        |
        v
 Image-Type Classification
        |
   +----+----+
   |         |
GARMENT    LABEL
   |         |
   v         v
Computer    OCR
Vision      Module
   |         |
   +----+----+
        |
        v
  Normalization
        |
        v
   Knowledge Base
        |
        v
 Environmental Scoring
        |
        v
  Analysis Response
        |
        v
  AI Explanation
```

Images classified as `UNKNOWN` are rejected without executing either the OCR or Computer Vision pipeline.

### 4. Single-Image Analysis

The backend exposes a unified endpoint that accepts one image per request.

**Endpoint:** `POST /api/v1/analyze`

| Parameter | Type | Required | Default |
|---|---|---|---|
| image | File | Yes | — |
| shopping | Boolean | No | true |
| second_hand_available | Boolean | No | false |
| condition | String | No | new |

Supported image formats:

- JPEG
- PNG
- WEBP

Upload restrictions:

- Maximum file size: 10 MB.
- Maximum image dimensions: 8192 pixels per edge.
- Maximum total pixels: 25 megapixels.

The image-type classifier determines the processing route automatically. No manual image-type selection is required from the frontend.

### 5. Module Integration

The backend integrates the following modules:

| Module | Functionality |
|---|---|
| Image Service | Image validation, decoding, and preprocessing |
| Image-Type Classifier | Garment, label, or unknown classification |
| Computer Vision | Textile fibre prediction using TextileNet ResNet-18 |
| OCR | Extraction of textile composition from clothing labels |
| Normalization | Material standardization and composition reconciliation |
| Knowledge Base | Retrieval of material-specific environmental indicators |
| Scoring Engine | Comparative environmental impact calculation |
| Gemini Service | Generation of sustainability explanations |

The adapter-based integration layer provides a consistent interface between the backend services and the individual modules.

### 6. Environmental Impact Assessment

The Environmental Scoring Engine evaluates materials across six categories:

1. Water consumption.
2. Carbon emissions.
3. Energy consumption.
4. Chemical intensity.
5. Microfibre shedding.
6. Waste and end-of-life impact.

The engine uses material-specific benchmark data to calculate comparative impact scores and generate recommendations where sufficient information is available.

Recommendations include:

- Buy
- Think Twice
- Repair
- Reuse
- Second-hand

The calculated scores are comparative estimates and should not be interpreted as certified garment-specific environmental measurements.

### 7. AI Explanation

Google Gemini is integrated as an explanation layer to convert structured analytical results into understandable sustainability insights.

The AI layer explains material composition, environmental impact, and recommendations without independently modifying the underlying analytical results.

A deterministic fallback explanation is provided when the Gemini API key is unavailable or the external service fails.

### 8. Repository Structure

```text
backend/
├── app/
│   ├── api/
│   ├── core/
│   ├── integrations/
│   │   └── teammate_modules/
│   ├── schemas/
│   ├── services/
│   └── main.py
│
├── docs/
├── tests/
│   ├── fixtures/
│   ├── integration/
│   ├── unit/
│   └── tools/
│
├── requirements.txt
└── run.py
```

### 9. Running the Backend

#### Requirements

- Python 3
- pip
- Dependencies listed in `requirements.txt`
- Pretrained TextileNet checkpoint for Computer Vision inference

Install dependencies:

```bash
pip install -r requirements.txt
```

Configure the environment variables in a `.env` file:

```env
GEMINI_API_KEY=your_api_key
GEMINI_MODEL=gemini-3.5-flash-lite
```

The Gemini API key is optional.

Start the development server:

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

API documentation:

`http://localhost:8000/docs`

Health check:

`http://localhost:8000/health`

### 10. Testing

The backend includes unit and integration tests for image validation, API endpoints, classification, module adapters, normalization, scoring, and error handling.

Run the test suite:

```bash
pytest -q
```

Run the image-classifier validation utility:

```bash
python tests/tools/validate_image_classifier.py
```

The latest recorded backend test run completed with 181 passing tests.

### 11. Current Limitations and Next Steps

- The image-type classifier is currently a heuristic implementation and requires further validation using genuine garment images.
- TextileNet fibre predictions are based on visual appearance and are not laboratory-confirmed composition results.
- OCR accuracy depends on label readability and image quality.
- Environmental scores are based on comparative material benchmarks rather than certified garment-level LCA measurements.
- Browser-level end-to-end integration testing remains to be completed.

Future improvements include dedicated image-type classification, expanded validation datasets, improved fibre prediction, and deployment-level testing.

### 12. References and Attribution

- FastAPI: https://fastapi.tiangolo.com/
- Pydantic: https://docs.pydantic.dev/
- EasyOCR: https://github.com/JaidedAI/EasyOCR
- TextileNet: https://github.com/hahashu/TextileNet
- TextileNet Research Paper: https://arxiv.org/abs/2301.06160
- PyTorch: https://pytorch.org/

Third-party models, libraries, datasets, and services remain subject to their respective licenses and usage terms.
