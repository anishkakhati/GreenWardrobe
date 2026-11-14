import React from "react";
import { getCustomIndicatorRows, getImpactCategoryExplanationRows } from "../services/resultPresentation.js";

const metrics = [
  ["Water", "water", "Litres/kg"],
  ["Carbon", "carbon", "kg CO₂/kg"],
  ["Energy", "energy", "MJ/kg"],
];

export default function EnvironmentalImpact({ impactData, environmentalProfiles = [], aiExplanation = {} }) {
  if (!impactData) return null;
  return <section className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-6 sm:p-7 space-y-5">
    <div className="pb-4 border-b border-gray-100">
      <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">Environmental assessment</span>
      <h3 className="text-xl font-bold text-gray-900 mt-2">Material reference impacts</h3>
    </div>
    <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-100">
      <p className="text-xs text-emerald-800 font-semibold">Backend impact score</p>
      <p className="text-3xl font-black text-gray-900">{impactData.score ?? "Score unavailable"}{impactData.score != null && <span className="text-sm font-normal text-gray-500"> / 100</span>}</p>
      {impactData.calculationBasis && <p className="text-xs text-gray-600 mt-1">Calculation basis: {impactData.calculationBasis}</p>}
    </div>
    {environmentalProfiles.length ? <div className="space-y-3">
      {environmentalProfiles.map((profile) => <div key={profile.material} className="p-4 rounded-xl bg-gray-50 border border-gray-200">
        <h4 className="font-bold text-gray-900 capitalize">{profile.material} reference values</h4>
        <p className="text-[11px] text-gray-500 mb-3">Per kilogram of material; these are not garment-level totals.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
          {metrics.map(([label, key, unit]) => <div key={key}><span className="text-xs text-gray-500">{label}</span><p className="font-semibold">{profile[key] == null ? "Not provided" : `${profile[key]} ${unit}`}</p></div>)}
        </div>
        {(profile.chemicals || profile.microfibres || profile.biodegradability) && <p className="text-xs text-gray-600 mt-3">{[["Chemicals", profile.chemicals], ["Microfibre risk", profile.microfibres], ["Biodegradability", profile.biodegradability]].filter(([, value]) => value).map(([label, value]) => `${label}: ${value}`).join(" · ")}</p>}
        {profile.source && <p className="text-[11px] text-gray-500 mt-2">Source: {profile.source}</p>}
        {getCustomIndicatorRows(profile.customIndicators).length > 0 && <div className="mt-3 pt-3 border-t border-gray-200">
          <h5 className="text-xs font-semibold text-gray-700 mb-2">Additional material indicators</h5>
          <dl className="grid sm:grid-cols-2 gap-2">{getCustomIndicatorRows(profile.customIndicators).map((indicator, index) => <div key={`${indicator.label}-${index}`} className="text-xs">
            <dt className="text-gray-500">{indicator.label}</dt>
            <dd className="font-medium text-gray-800">{indicator.value}{indicator.unit ? ` ${indicator.unit}` : ""}</dd>
          </div>)}</dl>
        </div>}
      </div>)}
    </div> : <p className="text-sm text-gray-500">Material reference values not provided.</p>}
    {impactData.breakdown && <div><h4 className="font-bold text-sm mb-2">Score breakdown</h4><div className="grid sm:grid-cols-2 gap-2">{Object.entries(impactData.breakdown).filter(([, value]) => value).map(([key, value]) => <p key={key} className="text-xs text-gray-700 capitalize">{key}: {value.score} / 100{value.rating ? ` · ${value.rating}` : ""}{value.description ? ` — ${value.description}` : ""}</p>)}</div></div>}
    {getImpactCategoryExplanationRows(aiExplanation?.impact_category_explanations).length > 0 && <div className="space-y-2">
      <h4 className="font-bold text-sm">Impact category explanations</h4>
      {getImpactCategoryExplanationRows(aiExplanation.impact_category_explanations).map(({ category, explanation }) => <p key={category} className="text-xs text-gray-700"><span className="font-semibold capitalize">{category.replaceAll("_", " ")}: </span>{explanation}</p>)}
    </div>}
    {Object.entries(impactData.keyIndicators || {}).map(([key, value]) => <p key={key} className="text-xs text-gray-600"><span className="capitalize font-semibold">{key.replaceAll("_", " ")}: </span>{value}</p>)}
  </section>;
}
