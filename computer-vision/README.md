# GreenWardrobe Computer Vision

## Overview

GreenWardrobe Computer Vision analyses garment images to predict likely material categories. It provides a reusable inference module and a FastAPI service for integration with the GreenWardrobe backend.

The current demo uses a fine-tuned ResNet-18 model with eight material classes.

**Important:** Predictions are based on visual appearance. They are not laboratory verification of a garment's actual fibre composition. OCR-extracted garment label information should be considered alongside visual predictions.

## 1. Model Details

| Property | Details |
|---|---|
| Architecture | ResNet-18 |
| Framework | PyTorch |
| Input | RGB image |
| Input resolution | 224 × 224 |
| Output classes | 8 |
| Inference | Top-3 material predictions |
| Device support | Apple MPS, CUDA, CPU |
| API framework | FastAPI |

### Supported Demo Classes

1. Leather
2. Wool
3. Cotton
4. Polyester
5. Camel
6. Nylon
7. Silk
8. Fur

## 2. Demo Model Evaluation

The initialized eight-class model was evaluated on the validation split.

| Metric | Result |
|---|---:|
| Validation images | 3,112 |
| Accuracy | 63.82% |
| Macro Precision | 61.39% |
| Macro Recall | 64.21% |
| Macro F1-score | 62.28% |
| Weighted F1-score | 63.94% |

### Per-class F1-score

| Material | F1-score |
|---|---:|
| Leather | 74.05% |
| Wool | 70.59% |
| Camel | 70.59% |
| Cotton | 67.51% |
| Polyester | 64.60% |
| Silk | 52.44% |
| Nylon | 50.43% |
| Fur | 48.05% |

These are validation results for the current demo model, not guarantees of performance on real-world garment photographs.

## 3. Inference API

The module exposes a FastAPI service.

### Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Service information |
| GET | `/health` | Model health, device and supported classes |
| POST | `/predict` | Predict material from an uploaded image |
| GET | `/docs` | Interactive Swagger documentation |

### Prediction Request

Send a multipart form-data request with the image under the field name `file`.

Supported formats:

- JPEG
- PNG
- WEBP

Maximum upload size: 10 MB.

### Example Response

```json
{
  "success": true,
  "predicted_material": "polyester",
  "confidence": 0.6453,
  "confidence_percent": 64.53,
  "low_confidence": false,
  "confidence_threshold": 0.55,
  "top_predictions": [
    {
      "material": "polyester",
      "confidence": 0.6453,
      "confidence_percent": 64.53
    },
    {
      "material": "fur",
      "confidence": 0.1615,
      "confidence_percent": 16.15
    },
    {
      "material": "cotton",
      "confidence": 0.061,
      "confidence_percent": 6.1
    }
  ],
  "model": "GreenWardrobe-ResNet18",
  "device": "mps",
  "filename": "garment.jpeg"
}
```

The confidence threshold of 0.55 is a demo warning threshold. It has not been calibrated as a probability of correctness.

## 4. Setup and Installation

### Prerequisites

- Python 3
- Git
- Git LFS
- PyTorch-compatible environment

### Clone the repository

```bash
git clone https://github.com/anishkakhati/GreenWardrobe.git
cd GreenWardrobe
```

### Install Git LFS and retrieve the model checkpoint

```bash
git lfs install
git lfs pull
```

The demo checkpoint is stored using Git LFS. Ensure Git LFS is installed before running inference.

### Create a virtual environment

```bash
python -m venv .venv
source .venv/bin/activate
```

### Install dependencies

```bash
pip install -r computer-vision/requirements-api.txt
```

## 5. Run the API

From the GreenWardrobe repository root:

```bash
PYTHONPATH=computer-vision uvicorn api.main:app --app-dir computer-vision --host 0.0.0.0 --port 8000
```

Open the interactive API documentation:

http://127.0.0.1:8000/docs

Check model health:

http://127.0.0.1:8000/health

The model checkpoint and demo label file must be present before starting the service.

## 6. Backend Integration

The Computer Vision service accepts image uploads through the `/predict` endpoint.

Example Python integration:

```python
import requests

url = "http://127.0.0.1:8000/predict"

with open("garment.jpg", "rb") as image:
    response = requests.post(
        url,
        files={"file": ("garment.jpg", image, "image/jpeg")}
    )

print(response.json())
```

For a backend running on a different machine or container, replace `127.0.0.1` with the address where the Computer Vision service is reachable.

The backend can use the predicted material and top predictions alongside OCR-extracted label composition. These sources should remain distinguishable when generating the final material assessment.

## 7. Repository Structure

```text
computer-vision/
├── api/
│   └── main.py
├── checkpoints/
│   └── demo_initialized.pth
├── data/
│   └── demo/
│       └── demo_labels.txt
├── evaluation/
│   ├── classification_report.csv
│   └── confusion_matrix.csv
├── labels/
│   └── fibre_label.txt
├── src/
│   ├── data/
│   ├── inference/
│   ├── resnet_model/
│   └── training/
├── evaluate.py
├── initialize_demo_model.py
├── analyze_models.py
├── inspect_errors.py
├── create_error_contact_sheet.py
├── requirements-api.txt
└── README.md
```

The dataset manifest, original dataset images, and intermediate training checkpoints are local development assets and are not included in the repository.

## 8. Training and Evaluation

The project includes utilities for:

- Dataset loading and preprocessing.
- Frozen-backbone training.
- Full-model fine-tuning.
- Model evaluation and metric reporting.
- Confusion matrix analysis.
- Error inspection and visualization.
- Initializing the eight-class demo model.

The demo checkpoint was initialized from the fine-tuned model and adapted to the selected eight-class output space.

Training datasets and intermediate checkpoints are not required to run the inference API.

## 9. Limitations

- Visual appearance cannot independently establish exact fibre composition.
- Visually similar materials may be confused.
- Performance varies across material classes.
- The validation results do not establish real-world performance on arbitrary user-uploaded images.
- The confidence threshold is a demo heuristic, not a calibrated reliability score.
- The eight-class model covers only a subset of the original TextileNet taxonomy.
- Label-based composition evidence should be used alongside visual predictions.

## 10. Attribution and References

The initial research baseline is based on TextileNet.

- Repository: https://github.com/hahashu/TextileNet
- Research paper: https://arxiv.org/abs/2301.06160
- Upstream MIT licence: `TEXTILENET-LICENSE`

The upstream repository separately describes the licensing of its data-collection code and dataset. Including its MIT licence does not imply that the dataset or pretrained checkpoint is relicensed under MIT.

---

**GreenWardrobe Computer Vision | Know Your Fabric.**