# GreenWardrobe: Team Module Integration Guide

This guide documents the integration of independently developed teammate modules into the unified GreenWardrobe FastAPI backend.

---

## 1. Team Module Inventory & Current Status

| Team Member | Module Role | Remote Git Branch | Integration Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Maneesh Kumar** | Environmental Scoring & Recommendation Engine | `origin/Scoring-&-Decision-Engine` | **`REAL INTEGRATION VERIFIED`** | Code integrated & verified; uses teammate demo benchmark CSV dataset |
| **Harshit Upadhyay** | Clothing Care Label OCR | `origin/feature/-clothing-label-ocr` | **`CODE CONNECTED BUT NOT INFERENCE VERIFIED`** | Parser connected; live inference unverified (EasyOCR/OpenCV not in active env) |
| **Anshika Thakur** | Computer Vision Fabric Classification | `origin/feature/computer-vision` | **`BLOCKED — ASSET MISSING (WEIGHTS: res18_ckpt.pth)`** | Blocked until approved TextileNet checkpoint (`res18_ckpt.pth`) is supplied |
| **Ankit Yadav** | Environmental Life-Cycle Knowledge Base | *Pending upload* | **`ADAPTER READY — MODULE PENDING`** | Adapter ready; provisional baseline fallback data used until module arrives |
| **Lakshya Nailwal** | Frontend UI (React + Tailwind) | *Frontend repository/branch* | **`EXTERNAL FRONTEND CLIENT`** | Runs on port 5173 |

---

## 2. Deep Module Breakdown

### A. Maneesh Kumar — Environmental Scoring Engine
- **Source Location in Backend:** `app/integrations/teammate_modules/scoring/`
- **Adapter:** `app/integrations/scoring_adapter.py` (`ScoringAdapter`)
- **Key Files:**
  - `scoring.py`: `EnvironmentalScorer` calculating category-weighted averages.
  - `recommendations.py`: `RecommendationEngine` mapping scores and condition to decisions (`Buy`, `Think Twice`, `Repair`, `Reuse`, `Second-hand`).
  - `config.py`: Category weights (`water`: 0.20, `carbon`: 0.25, `energy`: 0.15, `chemicals`: 0.15, `microfibres`: 0.10, `waste`: 0.15) and score bands.
  - `data/material_impact_data.csv`: Material benchmark matrix.
- **Required Dependencies:** `numpy>=1.24`, `pandas>=2.0`
- **Input:** `composition: Dict[str, float]` (percentages totaling ~100%) and context flags (`garment_condition`, `shopping`, `second_hand_available`).
- **Output:** Pydantic `ScoringResult` (`overall_impact_score: float`, `recommendation: str`, `breakdown: ImpactScoreBreakdown`, `key_indicators: Dict[str, str]`).
- **Integration Status:** **REAL INTEGRATION VERIFIED**. Tested on real blends (65% polyester / 35% cotton -> 67.84 High Impact). Note: While the Python engine integration is verified, the underlying CSV matrix (`material_impact_data.csv`) consists of teammate demo benchmark data, not yet full production LCA empirical data.

---

### B. Harshit Upadhyay — Clothing Label OCR
- **Source Location in Backend:** `app/integrations/teammate_modules/ocr/`
- **Adapter:** `app/integrations/ocr_adapter.py` (`OCRAdapter`)
- **Key Files:**
  - `text_parser.py`: `SUPPORTED_FIBRES` list, `parse_composition` regex parser, and `preprocess_image_array` OpenCV CLAHE/sharpening pipeline.
- **Required Dependencies:** `easyocr>=1.7.1`, `opencv-python-headless>=4.8`, `numpy`, `Pillow`
- **Model Loading:** Lazy-initializes `easyocr.Reader(["en"], gpu=False)` on first request to preserve fast application startup.
- **Input:** `ProcessedImage` (in-memory image stream / array).
- **Output:** Pydantic `OCRResult` (`composition: List[OCRCompositionItem]`, `confidence: float`, `raw_text: str`, `unreadable: bool`, `warnings: List[str]`).
- **Integration Status:** **CODE CONNECTED BUT NOT INFERENCE VERIFIED**. Full regex parser and OpenCV pipeline connected. Live inference is not verified because EasyOCR and OpenCV-python are not installed in the active backend environment. When dependencies are absent, the adapter returns safe diagnostic warnings without crashing.

---

### C. Anshika Thakur — Computer Vision Module
- **Source Location in Backend:** `app/integrations/teammate_modules/vision/`
- **Adapter:** `app/integrations/vision_adapter.py` (`VisionAdapter`)
- **Key Files:**
  - `resnet.py`: `ResNet` and `get_resnet18(num_classes=33)` PyTorch model.
  - `labels/fibre_label.txt`: Class index mapping for 33 textile categories.
- **Required Dependencies:** `torch>=2.0`, `numpy`, `Pillow`
- **Model Checkpoint Path:** Set via `VISION_CHECKPOINT_PATH` environment variable (default: `models/res18_ckpt.pth`).
- **External Asset Requirement:** Pretrained TextileNet weights file (`res18_ckpt.pth`).
- **Input:** `ProcessedImage` (preprocessed to RGB 224x224, normalized float32 array / 255.0, tensor shape `(1, 3, 224, 224)`).
- **Output:** Pydantic `VisionPrediction` (`predicted_material: str`, `confidence: float`, `alternatives: List[str]`, `probabilities: Dict[str, float]`).
- **Integration Status:** **BLOCKED — ASSET MISSING (WEIGHTS: res18_ckpt.pth)**. Architecture and label mappings are integrated; blocked until the approved TextileNet checkpoint (`res18_ckpt.pth`) is supplied. If absent, the adapter returns transparent warnings without failing the request.

---

### D. Ankit Yadav — Material Knowledge Base
- **Adapter:** `app/integrations/knowledge_adapter.py` (`KnowledgeBaseAdapter`)
- **Status:** **ADAPTER READY — MODULE PENDING** (Remote branch pending upload).
- **Contract Defined:**
  - `get_material_data(material_name: str) -> Optional[MaterialEnvironmentalProfile]`
  - `get_batch_data(materials: List[str]) -> KnowledgeBaseResult`
- **Fallback:** Serves provisional baseline textile benchmarks from European Environment Agency / UNEP literature for primary fibers (`polyester`, `cotton`, `organic_cotton`, `linen`, `viscose`, `wool`, `nylon`, `hemp`) until Ankit's dynamic service is connected.

---

### E. Normalization & Cross-Module Synthesis
- **Service Location:** `app/services/normalization_service.py` (`NormalizationService`)
- **Responsibilities:**
  1. Material alias canonicalization (`spandex` -> `elastane`, `flax` -> `linen`, `rayon` -> `viscose`, `poly` -> `polyester`).
  2. OCR composition integrity validation (checking for sum $\approx 100\%$).
  3. Perception cross-checks: flags conflicts when OCR label detects one fiber (e.g., 100% Wool) while surface computer vision predicts another (e.g., Cotton) with high confidence ($\ge 70\%$).

---

## 3. How to Run Integration Tests

Run the full automated test suite from the backend directory:

```bash
cd backend
./venv/bin/pytest -v
```

To run adapter tests exclusively:

```bash
./venv/bin/pytest tests/unit/test_adapters.py -v
```
