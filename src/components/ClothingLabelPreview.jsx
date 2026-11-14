import React from "react";
import { CheckCircle2, Sparkles } from "lucide-react";
import { getDataQualityDisclaimer } from "../services/resultPresentation.js";

export default function ClothingLabelPreview({ garmentData, imagePreviewUrl }) {
  if (!garmentData) return null;
  const { fabricComposition = [], imageClassification = {}, compositionSource, compositionConfidence, aiExplanation, warnings = [] } = garmentData;
  const imageType = imageClassification.image_type;
  const classificationText = imageType === "GARMENT"
    ? "Garment detected — visual fabric analysis"
    : imageType === "LABEL"
      ? "Care label detected — composition extracted using OCR"
      : "Image classification not provided";
  const isOcr = String(compositionSource).toLowerCase().includes("ocr");

  return (
    <section className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-6 sm:p-7 space-y-5">
      <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
        <CheckCircle2 className="w-4 h-4" />{classificationText}
      </div>
      <div className="grid md:grid-cols-12 gap-6 items-start">
        {imagePreviewUrl && <img src={imagePreviewUrl} alt="Uploaded clothing image" className="md:col-span-5 w-full max-h-72 object-contain rounded-xl bg-gray-50 border border-gray-200" />}
        <div className="md:col-span-7 space-y-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Garment analysis</h3>
            <p className="text-sm text-gray-600 mt-1">Material: {garmentData.category}</p>
            <p className="text-xs text-gray-500 mt-1">Brand: Not provided · Garment weight: Not provided</p>
          </div>
          {aiExplanation?.summary && <p className="text-sm text-gray-700 leading-relaxed">{aiExplanation.summary}</p>}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2"><Sparkles className="w-4 h-4 text-emerald-600"/>Composition</h4>
            {fabricComposition.length ? fabricComposition.map((item, index) => (
              <div key={`${item.material}-${index}`} className="flex justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-sm">
                <span>{item.material}{isOcr ? " (label OCR)" : ""}</span><span>{item.percentage}%</span>
              </div>
            )) : <p className="text-sm text-gray-500">Composition not provided.</p>}
            {compositionConfidence != null && <p className="text-xs text-gray-500">Extraction confidence: {Math.round(compositionConfidence * 100)}%</p>}
            {isOcr && <p className="text-xs text-amber-800">Composition was extracted from the label and has not been independently certified.</p>}
          </div>
        </div>
      </div>
      {(aiExplanation?.material_explanation || aiExplanation?.environmental_impact_explanation) && <div className="space-y-2 text-sm text-gray-700">
        {aiExplanation.material_explanation && <p>{aiExplanation.material_explanation}</p>}
        {aiExplanation.environmental_impact_explanation && <p>{aiExplanation.environmental_impact_explanation}</p>}
      </div>}
      {[["Environmental highlights", aiExplanation?.environmental_highlights], ["Practical recommendations", aiExplanation?.practical_recommendations], ["Care and repair tips", aiExplanation?.care_and_repair_tips]].filter(([, items]) => items?.length).map(([title, items]) => <div key={title} className="text-sm text-gray-700">
        <h4 className="font-semibold text-gray-900">{title}</h4><ul className="list-disc pl-5 mt-1">{items.map((item, index) => <li key={index}>{item}</li>)}</ul>
      </div>)}
      {getDataQualityDisclaimer(aiExplanation) && <aside className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
        <strong className="block text-slate-900 mb-1">Data quality disclaimer</strong>
        <p>{getDataQualityDisclaimer(aiExplanation)}</p>
      </aside>}
      {(warnings.length > 0 || aiExplanation?.limitations_and_uncertainty?.length > 0) && <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
        <strong>Warnings and limitations</strong>
        <ul className="list-disc pl-5 mt-1">{[...warnings, ...(aiExplanation?.limitations_and_uncertainty || [])].map((warning, i) => <li key={i}>{warning}</li>)}</ul>
      </div>}
    </section>
  );
}
