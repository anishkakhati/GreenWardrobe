function hasDisplayValue(value) {
  if (value == null || value === "") return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;
  return true;
}

function stringifyValue(value) {
  return typeof value === "string" ? value : JSON.stringify(value);
}

export function getScoringStatusNotice(status) {
  if (status === "ENGINE_ERROR") {
    return {
      role: "alert",
      message: "The scoring service is unavailable or failed. Your extracted composition and material reference information are retained, but no score or recommendation was produced. Please try again later.",
    };
  }
  if (status === "NO_COMPOSITION_DATA") {
    return {
      role: "status",
      message: "Composition could not be determined. A reliable score or recommendation is unavailable.",
    };
  }
  if (status === "INSUFFICIENT_DATA") {
    return {
      role: "status",
      message: "Composition was extracted, but it is incomplete, invalid, or unsupported for scoring. No score or recommendation was produced.",
    };
  }
  return null;
}

export function getCustomIndicatorRows(customIndicators) {
  if (!customIndicators || typeof customIndicators !== "object" || Array.isArray(customIndicators)) return [];

  return Object.entries(customIndicators).flatMap(([key, indicator]) => {
    if (!hasDisplayValue(indicator)) return [];

    if (indicator && typeof indicator === "object" && !Array.isArray(indicator)) {
      if (Object.hasOwn(indicator, "value")) {
        if (!hasDisplayValue(indicator.value)) return [];
        return [{
          label: hasDisplayValue(indicator.label) ? stringifyValue(indicator.label) : key,
          value: stringifyValue(indicator.value),
          unit: hasDisplayValue(indicator.unit) ? stringifyValue(indicator.unit) : null,
        }];
      }
    }

    return [{ label: key, value: stringifyValue(indicator), unit: null }];
  });
}

export function getImpactCategoryExplanationRows(explanations) {
  if (!explanations || typeof explanations !== "object" || Array.isArray(explanations)) return [];
  return Object.entries(explanations)
    .filter(([, explanation]) => typeof explanation === "string" && explanation.trim().length > 0)
    .map(([category, explanation]) => ({ category, explanation }));
}

export function getDataQualityDisclaimer(explanation) {
  const disclaimer = explanation?.data_quality_disclaimer;
  return typeof disclaimer === "string" && disclaimer.trim() ? disclaimer : null;
}
