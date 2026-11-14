const textOr = (value, fallback = "Not provided") => value == null || value === "" ? fallback : value;
const recommendationIds = new Map([
  ["buy", "BUY"], ["think twice", "THINK TWICE"], ["repair", "REPAIR"],
  ["reuse", "REUSE"], ["second-hand", "SECOND-HAND"], ["second hand", "SECOND-HAND"],
]);

export function adaptBackendResponse(response) {
  const product = response?.product || {};
  const impact = response?.impact_assessment || {};
  const profiles = response?.environmental_data || {};
  const materials = product.composition?.materials || [];
  const composition = materials.map(({ name, percentage }) => ({ material: name, percentage }));
  const perKg = Object.values(profiles).map((profile) => ({
    material: profile.material,
    water: profile.water_liters_per_kg,
    carbon: profile.co2_kg_per_kg,
    energy: profile.energy_mj_per_kg,
    chemicals: profile.chemicals_intensity,
    microfibres: profile.microplastic_shedding_risk,
    biodegradability: profile.biodegradability,
    source: profile.source_reference,
    customIndicators: profile.custom_indicators,
  }));
  const ai = response?.ai_explanation || {};
  const classification = response?.image_classification || {};
  const scoringStatus = impact.key_indicators?.status;
  const scoringUnavailable = String(impact.calculation_basis || "").startsWith("unscored_")
    || ["INSUFFICIENT_DATA", "ENGINE_ERROR", "NO_COMPOSITION_DATA"].includes(scoringStatus);

  return {
    id: response?.analysis_id,
    name: "Analysis result",
    category: textOr(product.visual_prediction?.predicted_material, "Garment material not identified"),
    brand: null,
    estimatedWeight: null,
    fabricComposition: composition,
    compositionSource: product.composition?.source || product.composition_source || "unknown",
    compositionConfidence: product.composition?.confidence ?? null,
    visualPrediction: product.visual_prediction || null,
    environmentalProfiles: perKg,
    environmentalImpact: {
      score: scoringUnavailable ? null : (impact.overall_impact_score ?? null),
      breakdown: impact.breakdown || null,
      keyIndicators: impact.key_indicators || {},
      calculationBasis: impact.calculation_basis || null,
    },
    recommendation: scoringUnavailable || impact.recommendation == null ? null : (recommendationIds.get(String(impact.recommendation).trim().toLowerCase()) || impact.recommendation),
    recommendationReason: scoringUnavailable ? null : (impact.key_indicators?.recommendation_reason || null),
    aiExplanation: ai,
    imageClassification: classification,
    analysisSource: classification.analysis_source || "Not provided",
    warnings: [...(response?.warnings || []), ...(response?.limitations || [])],
    isDemoData: false,
    dataSourceLabel: "Live backend analysis",
  };
}
