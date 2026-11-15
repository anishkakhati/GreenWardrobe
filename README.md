# GreenWardrobe

### Know Your Fabric. See it. Understand it. Choose better.

GreenWardrobe is an AI-powered garment intelligence project that translates garment information into environmental profiles, helping consumers understand their clothing materials and make more informed choices.

## The Problem

A garment's price tag tells only part of its story. The materials used to make it can carry environmental impacts that are difficult for consumers to identify.

GreenWardrobe aims to make this hidden information easier to understand.

## How It Works

1. **Garment Capture:** Capture or upload an image of a garment.
2. **Computer Vision:** Analyse visual features to identify likely material categories.
3. **Label Extraction:** Extract composition information from garment labels.
4. **Environmental Knowledge Base:** Connect identified materials to environmental evidence.
5. **Scoring and Recommendations:** Generate an environmental profile and recommendations using available evidence.

Visual predictions and label-derived composition are treated as separate evidence sources. An image alone cannot verify exact fibre composition.

## Project Modules

| Module | Responsibility |
|---|---|
| Frontend UI/UX | Garment capture and user experience |
| Backend & Gemini Integration | Backend services and AI integration |
| OCR & Label Extraction | Extracting garment composition |
| Scoring & Recommendation Engine | Environmental scoring and recommendations |
| Environmental Knowledge Base | Material-related environmental evidence |
| Computer Vision | Image-based material identification |

## Computer Vision

The Computer Vision module currently includes:

- ResNet-18-based material prediction.
- An eight-class demo model.
- Confidence-aware top predictions.
- A FastAPI inference service.
- Model evaluation and training utilities.

See [Computer Vision README](computer-vision/README.md) for setup, model details, evaluation results, and API usage.

## Repository Structure

```text
GreenWardrobe/
├── computer-vision/
│   ├── api/
│   ├── data/
│   ├── checkpoints/
│   ├── src/
│   ├── evaluation/
│   └── README.md
├── README.md
└── .gitignore
```

## Team

- Anshika Thakur
- Anishka Khati
- Harshit Upadhyay
- Maneesh Kumar
- Lakshya Nailwal
- Ankit Yadav

## Project Scope and Limitations

GreenWardrobe is being developed as a multi-component garment intelligence system. The accuracy and availability of outputs depend on the evidence and models available to each module.

Computer Vision predictions are based on visual appearance and should not be interpreted as laboratory verification of fibre composition. Label extraction and environmental evidence provide additional context for a more informed assessment.