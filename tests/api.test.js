import { afterEach, test } from "node:test";
import assert from "node:assert/strict";
import { adaptBackendResponse } from "../src/services/responseAdapter.js";
import { getCustomIndicatorRows, getDataQualityDisclaimer, getImpactCategoryExplanationRows, getScoringStatusNotice } from "../src/services/resultPresentation.js";
import { analyzeClothingImage, checkBackendHealth } from "../src/services/api.js";

const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });

const response = (payload, status = 200) => ({ ok: status >= 200 && status < 300, status, json: async () => payload });
const garment = { success: true, analysis_id: "a1", image_classification: { image_type: "GARMENT", analysis_source: "VISION", classification_confidence: 0.8 }, product: { composition: null, visual_prediction: { predicted_material: "cotton", confidence: 0.7 }, composition_source: "vision" }, environmental_data: { cotton: { material: "cotton", water_liters_per_kg: 500, co2_kg_per_kg: null, energy_mj_per_kg: 20 } }, impact_assessment: { overall_impact_score: 63, recommendation: "Repair", breakdown: null, key_indicators: {} }, ai_explanation: { summary: "A grounded summary." }, warnings: [], limitations: [] };

test("posts exactly one multipart image to the backend analysis endpoint", async () => {
  let captured;
  globalThis.fetch = async (url, options) => { captured = { url, options }; return response(garment); };
  const file = new Blob(["image"], { type: "image/jpeg" });
  const result = await analyzeClothingImage(file);
  assert.match(captured.url, /\/api\/v1\/analyze$/);
  assert.equal(captured.options.method, "POST");
  assert.equal(captured.options.headers, undefined);
  assert.deepEqual([...captured.options.body.keys()], ["image"]);
  assert.equal(result.imageClassification.image_type, "GARMENT");
  assert.equal(result.scoringStatus, "NO_COMPOSITION_DATA");
  assert.equal(result.environmentalImpact.score, null);
  assert.equal(result.recommendation, null);
});

test("adapts LABEL OCR composition and preserves classification without certification claims", () => {
  const adapted = adaptBackendResponse({ ...garment, image_classification: { image_type: "LABEL", analysis_source: "OCR" }, product: { composition: { source: "ocr_label", confidence: 0.9, materials: [{ name: "cotton", percentage: 100 }] } } });
  assert.equal(adapted.imageClassification.image_type, "LABEL");
  assert.equal(adapted.fabricComposition[0].percentage, 100);
  assert.match(adapted.compositionSource, /ocr_label/);
  assert.equal(adapted.brand, null);
  assert.equal(adapted.estimatedWeight, null);
});

test("returns successful LABEL analysis from the API adapter", async () => {
  globalThis.fetch = async () => response({ ...garment, image_classification: { image_type: "LABEL", analysis_source: "OCR" }, product: { composition: { source: "ocr_label", materials: [{ name: "linen", percentage: 100 }] } } });
  const result = await analyzeClothingImage(new Blob(["label"], { type: "image/jpeg" }));
  assert.equal(result.imageClassification.image_type, "LABEL");
  assert.deepEqual(result.fabricComposition, [{ material: "linen", percentage: 100 }]);
  assert.equal(result.scoringStatus, "SCORED");
});

test("keeps missing values null and does not synthesize scores or recommendations", () => {
  const adapted = adaptBackendResponse({ product: {}, impact_assessment: {}, environmental_data: {} });
  assert.equal(adapted.environmentalImpact.score, null);
  assert.equal(adapted.recommendation, null);
  assert.equal(adapted.fabricComposition.length, 0);
  assert.equal(adapted.scoringStatus, "NO_COMPOSITION_DATA");
});

test("returns completed analysis with unavailable composition as an incomplete result", async () => {
  globalThis.fetch = async () => response({
    success: false,
    analysis_id: "incomplete-1",
    product: { composition: null },
    impact_assessment: {
      overall_impact_score: null,
      recommendation: null,
      calculation_basis: "unscored_due_to_missing_composition",
      key_indicators: { status: "NO_COMPOSITION_DATA" },
    },
    warnings: ["Composition could not be established."],
    limitations: [],
  });

  const result = await analyzeClothingImage(new Blob(["label"], { type: "image/jpeg" }));
  assert.equal(result.analysisStatus, "incomplete");
  assert.equal(result.scoringStatus, "NO_COMPOSITION_DATA");
  assert.equal(result.environmentalImpact.score, null);
  assert.equal(result.recommendation, null);
  assert.match(result.warnings[0], /Composition could not be established/);
});

test("keeps a valid partial composition and unavailable score as an incomplete result", async () => {
  globalThis.fetch = async () => response({
    success: false,
    analysis_id: "partial-1",
    image_classification: { image_type: "LABEL", analysis_source: "OCR", classification_confidence: 0.83 },
    product: {
      composition: { materials: [{ name: "acrylic", percentage: 16 }], confidence: 0.91, source: "ocr_label" },
      composition_source: "ocr_label",
      visual_prediction: null,
    },
    environmental_data: { acrylic: { material: "acrylic", water_liters_per_kg: 350, co2_kg_per_kg: 16.8 } },
    impact_assessment: {
      overall_impact_score: null,
      recommendation: null,
      calculation_basis: "unscored_due_to_unmapped_materials",
      breakdown: { water: { score: null, description: "Insufficient composition." } },
      key_indicators: { status: "INSUFFICIENT_DATA", reason: "Composition totals 16%." },
    },
    warnings: ["Label composition is partial or incomplete."],
    limitations: [],
  });

  const result = await analyzeClothingImage(new Blob(["label"], { type: "image/jpeg" }));
  assert.equal(result.analysisStatus, "incomplete");
  assert.equal(result.scoringStatus, "INSUFFICIENT_DATA");
  assert.deepEqual(result.fabricComposition, [{ material: "acrylic", percentage: 16 }]);
  assert.equal(result.environmentalImpact.score, null);
  assert.equal(result.environmentalImpact.breakdown.water.score, null);
  assert.equal(result.recommendation, null);
  assert.match(result.warnings[0], /partial or incomplete/);
});

test("hides backend placeholder scoring when backend marks the result unscored", () => {
  const adapted = adaptBackendResponse({ ...garment, product: {
    composition: { materials: [{ name: "cotton", percentage: 100 }] },
  }, impact_assessment: {
    overall_impact_score: 50,
    recommendation: "Think Twice",
    calculation_basis: "unscored_due_to_unmapped_materials",
    key_indicators: { status: "INSUFFICIENT_DATA", reason: "Composition must total 100%." },
  } });
  assert.equal(adapted.environmentalImpact.score, null);
  assert.equal(adapted.scoringStatus, "INSUFFICIENT_DATA");
  assert.equal(adapted.recommendation, null);
  assert.equal(adapted.recommendationReason, null);
  assert.equal(adapted.environmentalImpact.keyIndicators.status, "INSUFFICIENT_DATA");
});

test("distinguishes engine failure, insufficient data, and missing composition", () => {
  const statuses = ["ENGINE_ERROR", "INSUFFICIENT_DATA", "NO_COMPOSITION_DATA"];
  const messages = statuses.map((status) => getScoringStatusNotice(status).message);
  assert.equal(new Set(messages).size, 3);
  assert.match(getScoringStatusNotice("ENGINE_ERROR").message, /scoring service is unavailable or failed/i);
  assert.match(getScoringStatusNotice("INSUFFICIENT_DATA").message, /incomplete, invalid, or unsupported/i);
  assert.match(getScoringStatusNotice("NO_COMPOSITION_DATA").message, /could not be determined/i);
  assert.equal(getScoringStatusNotice("SCORED"), null);
});

test("ENGINE_ERROR remains null-scored, preserves OCR composition, and uses an explicit failure state", async () => {
  const payload = {
    success: true,
    analysis_id: "engine-error-1",
    image_classification: { image_type: "LABEL", analysis_source: "OCR" },
    product: { composition: { source: "ocr_label", materials: [{ name: "cotton", percentage: 100 }] } },
    environmental_data: { cotton: { material: "cotton", water_liters_per_kg: 500 } },
    impact_assessment: {
      overall_impact_score: null,
      recommendation: null,
      calculation_basis: "unscored_due_to_engine_error",
      key_indicators: { status: "ENGINE_ERROR", reason: "The scoring service is unavailable or failed." },
    },
    warnings: ["The scoring service is unavailable or failed."],
  };
  globalThis.fetch = async () => response(payload);

  const result = await analyzeClothingImage(new Blob(["label"], { type: "image/jpeg" }));
  assert.equal(result.scoringStatus, "ENGINE_ERROR");
  assert.equal(result.analysisStatus, "incomplete");
  assert.deepEqual(result.fabricComposition, [{ material: "cotton", percentage: 100 }]);
  assert.equal(result.environmentalImpact.score, null);
  assert.equal(result.recommendation, null);
  assert.match(getScoringStatusNotice(result.scoringStatus).message, /scoring service is unavailable or failed/i);
  assert.doesNotMatch(getScoringStatusNotice(result.scoringStatus).message, /traceback|private engine detail/i);
});

test("preserves per-kilogram values and null optional fields", () => {
  const adapted = adaptBackendResponse(garment);
  assert.equal(adapted.environmentalProfiles[0].water, 500);
  assert.equal(adapted.environmentalProfiles[0].carbon, null);
  assert.equal(adapted.environmentalProfiles[0].energy, 20);
});

test("maps custom environmental indicators without changing labels, values, or units", () => {
  const customIndicators = {
    water_source: { label: "Water source", value: "Rain-fed", unit: "production method" },
    abrasion: { label: "Abrasion resistance", value: 4, unit: "cycles" },
    note: "Backend-provided note",
  };
  const adapted = adaptBackendResponse({ ...garment, environmental_data: { cotton: { material: "cotton", custom_indicators: customIndicators } } });
  assert.deepEqual(adapted.environmentalProfiles[0].customIndicators, customIndicators);
  assert.deepEqual(getCustomIndicatorRows(adapted.environmentalProfiles[0].customIndicators), [
    { label: "Water source", value: "Rain-fed", unit: "production method" },
    { label: "Abrasion resistance", value: "4", unit: "cycles" },
    { label: "note", value: "Backend-provided note", unit: null },
  ]);
});

test("maps and presents impact category explanations and data quality disclaimer verbatim", () => {
  const aiExplanation = {
    impact_category_explanations: { water: "Water category explanation.", microfibres: "Fiber shedding explanation." },
    data_quality_disclaimer: "Backend disclaimer text, unchanged.",
  };
  const adapted = adaptBackendResponse({ ...garment, ai_explanation: aiExplanation });
  assert.deepEqual(adapted.aiExplanation.impact_category_explanations, aiExplanation.impact_category_explanations);
  assert.deepEqual(getImpactCategoryExplanationRows(adapted.aiExplanation.impact_category_explanations), [
    { category: "water", explanation: "Water category explanation." },
    { category: "microfibres", explanation: "Fiber shedding explanation." },
  ]);
  assert.equal(getDataQualityDisclaimer(adapted.aiExplanation), aiExplanation.data_quality_disclaimer);
});

test("omits null, missing, empty, and whitespace-only indicator and explanation values", () => {
  assert.deepEqual(getCustomIndicatorRows(null), []);
  assert.deepEqual(getCustomIndicatorRows({}), []);
  assert.deepEqual(getCustomIndicatorRows({ missing: undefined, nil: null, empty: "", blankObject: {}, blankArray: [], measured: { label: "No value", value: null, unit: "kg" } }), []);
  assert.deepEqual(getImpactCategoryExplanationRows(null), []);
  assert.deepEqual(getImpactCategoryExplanationRows({}), []);
  assert.deepEqual(getImpactCategoryExplanationRows({ missing: undefined, nil: null, empty: "", blank: "   " }), []);
  assert.equal(getDataQualityDisclaimer(null), null);
  assert.equal(getDataQualityDisclaimer({ data_quality_disclaimer: "" }), null);
  assert.equal(getDataQualityDisclaimer({}), null);
});

test("retains null and empty schema fields while presentation omits their empty content", () => {
  const adapted = adaptBackendResponse({
    ...garment,
    environmental_data: {
      cotton: { material: "cotton", custom_indicators: null },
      linen: { material: "linen", custom_indicators: {} },
    },
    ai_explanation: { impact_category_explanations: null, data_quality_disclaimer: null },
  });
  assert.equal(adapted.environmentalProfiles[0].customIndicators, null);
  assert.deepEqual(adapted.environmentalProfiles[1].customIndicators, {});
  assert.deepEqual(getCustomIndicatorRows(adapted.environmentalProfiles[0].customIndicators), []);
  assert.deepEqual(getImpactCategoryExplanationRows(adapted.aiExplanation.impact_category_explanations), []);
  assert.equal(getDataQualityDisclaimer(adapted.aiExplanation), null);
});

test("surfaces UNKNOWN classification detail from a 422 response", async () => {
  globalThis.fetch = async () => response({ success: false, error: { message: "Could not classify image as garment or label." } }, 422);
  await assert.rejects(analyzeClothingImage(new Blob(["x"], { type: "image/jpeg" })), /Could not classify image/);
});

test("reports an unavailable backend without falling back to sample data", async () => {
  globalThis.fetch = async () => { throw new TypeError("offline"); };
  await assert.rejects(analyzeClothingImage(new Blob(["x"], { type: "image/jpeg" })), /Cannot reach the GreenWardrobe backend/);
  assert.equal(await checkBackendHealth(), false);
});

test("health check requests GET /health", async () => {
  let requested;
  globalThis.fetch = async (url) => { requested = url; return response({ status: "healthy" }); };
  assert.equal(await checkBackendHealth(), true);
  assert.match(requested, /\/health$/);
});

test("health check treats non-healthy payloads and HTTP failures as disconnected", async () => {
  globalThis.fetch = async () => response({ status: "starting" });
  assert.equal(await checkBackendHealth(), false);
  globalThis.fetch = async () => response({ status: "healthy" }, 503);
  assert.equal(await checkBackendHealth(), false);
});

test("health check times out and aborts a stalled request", async () => {
  let requestSignal;
  globalThis.fetch = async (_url, { signal }) => {
    requestSignal = signal;
    return new Promise((resolve, reject) => {
      signal.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")), { once: true });
    });
  };

  assert.equal(await checkBackendHealth({ timeoutMs: 5 }), false);
  assert.equal(requestSignal.aborted, true);
});
