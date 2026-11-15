# GreenWardrobe

GreenWardrobe is a React and FastAPI project for exploring clothing material composition and comparative environmental benchmarks. Upload exactly one image: the backend classifies it as a care label, garment, or unknown input and selects the OCR, computer-vision, or rejection path.

## Repositories

- Backend: this repository, branch `feature/backend`.
- Frontend: [`GreenWardrobe-frontend`](https://github.com/anishkakhati/GreenWardrobe/tree/feature/frontend) worktree, branch `feature/frontend`.
- MVP status and handover checklist: [MVP_HANDOVER_REPORT.md](MVP_HANDOVER_REPORT.md).

## Run locally

Start the backend from `backend/` using its existing virtual environment:

```sh
venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Start the frontend from the separate frontend worktree:

```sh
npm install
npm run dev
```

The frontend defaults to `http://localhost:8000`; Vite normally serves it at `http://localhost:5173`. Check backend availability at `http://localhost:8000/health` and inspect the API contract at `http://localhost:8000/docs`.

Gemini explanations are optional. Without a configured API key, the backend uses its local fallback path. Do not commit local `.env` files or credentials.

## Verify changes

From `backend/`:

```sh
PYTHONDONTWRITEBYTECODE=1 venv/bin/python -m pytest tests -q -p no:cacheprovider
```

From the frontend worktree:

```sh
npm test
npm run lint
npm run build
```

## Important limitations

- The image-type classifier has no genuine GARMENT validation examples; an earlier small validation set misclassified 9 of 12 UNKNOWN examples as GARMENT.
- TextileNet checkpoint loading and a forward pass verify software integration only. Held-out garment accuracy and checkpoint/training provenance remain unverified.
- Environmental values are comparative/demo benchmarks, not certified garment-specific life-cycle assessments.
- Review [backend/docs/MODEL_VALIDATION_DATASET_GUIDE.md](backend/docs/MODEL_VALIDATION_DATASET_GUIDE.md) before adding evaluation images. `MODULE_INTEGRATION_GUIDE.md` and `PHASE_6_API_GUIDE.md` are legacy documents and may not match current behavior; confirm contracts against current source/OpenAPI.
