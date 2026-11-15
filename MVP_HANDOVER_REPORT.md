# GreenWardrobe MVP Handover

## 1. Project overview

- GreenWardrobe explores clothing material composition and comparative environmental benchmarks from one uploaded image.
- Frontend: React 19 + Vite. Backend: FastAPI, Pydantic, OCR and PyTorch CV adapters.
- GitHub: [anishkakhati/GreenWardrobe](https://github.com/anishkakhati/GreenWardrobe)
- Continue on `feature/backend` (backend worktree) and `feature/frontend` (separate frontend worktree).

## 2. Work completed

- One-image upload with automatic routing: LABEL → OCR, GARMENT → TextileNet CV, UNKNOWN → rejection.
- Backend adapters, normalization, knowledge-base lookup, comparative scoring, recommendations and response schemas are integrated.
- React upload/results flow calls the FastAPI endpoint; health status checks the backend and can report checking, connected or disconnected.
- Missing composition, insufficient scoring data and scoring-engine failures have distinct null-score/null-recommendation handling.
- OCR label 0001 extraction regression was corrected; percentage totals are not silently rescaled. Scoring requires a 100% total within ±0.01 percentage points.
- OpenAPI error responses, model-validation guide/template, and classifier/TextileNet validation tools are present.
- Phase regression work includes backend and frontend tests for API contracts, OCR, lazy CV status, scoring integrity, error handling and health status.

## 3. Current verification status

- Latest cleanup-run backend suite: **218 passed, 115 warnings**.
- Frontend suite: **19 passed, 0 failed**.
- Frontend lint: **passed**.
- Frontend production build: **passed** (2,098 modules transformed; output directed outside the repository).
- Phase 1.4 live API check: all five label fixtures returned HTTP 200 and LABEL analysis. The recorded outputs included compositions and scores; this does not establish OCR performance generally.
- Targeted Phase 1.4 browser checks verified insufficient-data and engine-failure presentation, including null scores/recommendations and retained composition. A full valid live browser workflow was not rerun in Phase 1.4; Phase 1.3 documented browser integration for its tested paths.

## 4. Current limitations

- There are **zero genuine GARMENT validation samples**. An earlier small classifier validation misclassified **9 of 12 UNKNOWN** samples as GARMENT.
- TextileNet held-out accuracy is not established. Checkpoint loading/forward inference alone is software integration evidence, not model validation.
- CV training/checkpoint provenance, permissions and reproducibility still need verification with Anshika.
- Environmental values are comparative/demo benchmarks, not certified garment-specific life-cycle assessment (LCA).
- Production security and deployment controls are incomplete; passing tests do not establish production readiness.
- `backend/docs/MODULE_INTEGRATION_GUIDE.md` and `backend/docs/PHASE_6_API_GUIDE.md` are legacy references. Confirm behavior against current code and OpenAPI.

## 5. Work remaining to reach MVP

### MVP-critical, in order

1. Obtain consented or appropriately licensed LABEL, genuine GARMENT and UNKNOWN datasets; record provenance and labels.
2. Independently evaluate the image-type classifier on a held-out, representative set; document per-class results and failure cases.
3. Improve LABEL/GARMENT/UNKNOWN separation using representative data, then repeat the held-out evaluation. Do not choose thresholds from the current small set.
4. Obtain and verify Anshika’s CV source/training code, dataset permissions, preprocessing, class map, checkpoint provenance and evaluation evidence.
5. Evaluate TextileNet on a held-out garment set with verified fibre ground truth; document class coverage and per-class metrics.
6. Complete and browser-verify the GARMENT workflow using genuine garment fixtures; communicate that visual fibre predictions are not laboratory-confirmed composition.
7. Validate OCR across clear, rotated, folded, low-resolution, mixed-composition and unreadable care labels.
8. Review material knowledge-base coverage, provenance, missing indicators and score/recommendation behavior; explain comparative benchmark limitations in the UI.
9. Run end-to-end acceptance tests for both LABEL and GARMENT paths, all error states, and UNKNOWN rejection.
10. Add production configuration, secret management, upload/resource controls, logging/monitoring and deployment infrastructure; test in staging before public release.
11. Finish user setup, limitations and demonstration documentation.

### Improvements that can follow the first controlled MVP

- Broader language, label-layout and device coverage after baseline acceptance.
- Larger calibration studies and refined confidence presentation once representative held-out data exists.
- Expanded material benchmarks and independently reviewed environmental methodology.

## 6. Recommended MVP acceptance criteria

- Exactly one image is accepted per analysis request; no manual image-type selector is required.
- LABEL, GARMENT and UNKNOWN routing is evaluated on a documented held-out set with class counts, confusion matrix, per-class metrics and failure review. Set any accuracy/false-acceptance targets before evaluation based on the demo’s risk; no evidence-based numeric target is established yet.
- UNKNOWN inputs are rejected before OCR/CV inference.
- LABEL extraction is verified across representative conditions, with ambiguous or invalid composition left unscored.
- GARMENT analysis executes with documented model/data limitations and verified output behavior.
- No material percentages are invented or redistributed; no score/recommendation is fabricated when data are missing or invalid.
- Insufficient data and engine failures have distinct backend statuses and user-facing UI states; valid results and errors render correctly.
- Backend/frontend tests, lint and production build pass; both pipelines pass browser-level acceptance checks.
- Deployment configuration and basic security controls are reviewed before exposure outside a controlled environment.
- Environmental claims explicitly identify comparative data and do not imply certified garment-specific LCA.

## 7. Handover

- The original developer is handing over active development. **Anshika is the next owner** for completing the MVP.
- Continue from backend `feature/backend` and frontend `feature/frontend`; preserve existing work and review status before editing.
- First obtain permissioned genuine garment/label/unknown examples and the CV provenance/evaluation deliverables. Then establish classifier and TextileNet held-out baselines before making model-quality claims or preparing public deployment.
