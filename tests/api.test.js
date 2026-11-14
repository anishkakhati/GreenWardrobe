import { afterEach, test } from "node:test";
import assert from "node:assert/strict";
import { adaptBackendResponse } from "../src/services/responseAdapter.js";
import { getCustomIndicatorRows, getDataQualityDisclaimer, getImpactCategoryExplanationRows } from "../src/services/resultPresentation.js";
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
});

test("keeps missing values null and does not synthesize scores or recommendations", () => {
  const adapted = adaptBackendResponse({ product: {}, impact_assessment: {}, environmental_data: {} });
  assert.equal(adapted.environmentalImpact.score, null);
  assert.equal(adapted.recommendation, null);
  assert.equal(adapted.fabricComposition.length, 0);
});

test("hides backend placeholder scoring when backend marks the result unscored", () => {
  const adapted = adaptBackendResponse({ ...garment, impact_assessment: {
    overall_impact_score: 50,
    recommendation: "Think Twice",
    calculation_basis: "unscored_due_to_unmapped_materials",
    key_indicators: { status: "INSUFFICIENT_DATA", reason: "Composition must total 100%." },
  } });
  assert.equal(adapted.environmentalImpact.score, null);
  assert.equal(adapted.recommendation, null);
  assert.equal(adapted.recommendationReason, null);
  assert.equal(adapted.environmentalImpact.keyIndicators.status, "INSUFFICIENT_DATA");
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
