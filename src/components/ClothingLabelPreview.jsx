// src/components/ClothingLabelPreview.jsx
// Displays garment image, metadata, detected fiber composition, and care label details

import React from "react";
import { Tag, Layers, Scale, Sparkles, CheckCircle2 } from "lucide-react";

export default function ClothingLabelPreview({ garmentData, imagePreviewUrl }) {
  if (!garmentData) return null;

  const {
    name,
    category,
    brand,
    estimatedWeight,
    fabricComposition = [],
    analyzedAt,
    isDemoData = true,
    dataSourceLabel
  } = garmentData;

  return (
    <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-6 sm:p-7 space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-gray-100">
        <div>
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
            Detected Garment Profile
          </span>
          <h3 className="text-xl font-bold text-gray-900 mt-1">{name}</h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isDemoData ? (
            <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-300">
              ⚡ {dataSourceLabel || "Sample Demo Profile"}
            </span>
          ) : (
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-300">
              🌐 {dataSourceLabel || "Live Server Analysis"}
            </span>
          )}
          {analyzedAt && (
            <span className="text-xs text-gray-500">
              Analyzed: {analyzedAt}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Garment Image Preview */}
        <div className="md:col-span-5 flex flex-col items-center">
          <div className="w-full max-h-72 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
            <img
              src={imagePreviewUrl || garmentData.imageUrl}
              alt={name}
              className="w-full max-h-72 object-contain"
            />
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
            <CheckCircle2 className={`w-4 h-4 ${isDemoData ? "text-amber-600" : "text-emerald-600"}`} />
            <span>
              {isDemoData ? "Simulated Care Label Optical Analysis" : "Live Care Label Optical Verification Complete"}
            </span>
          </div>
        </div>

        {/* Right Column: Garment Details & Fabric Composition */}
        <div className="md:col-span-7 space-y-5">
          
          {/* Metadata Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200/60">
              <span className="text-[11px] text-gray-500 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-emerald-600" />
                Category
              </span>
              <p className="font-semibold text-gray-800 text-xs sm:text-sm mt-0.5 truncate">
                {category || "Apparel"}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200/60">
              <span className="text-[11px] text-gray-500 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-teal-600" />
                Brand / Label
              </span>
              <p className="font-semibold text-gray-800 text-xs sm:text-sm mt-0.5 truncate">
                {brand || "Detected"}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200/60 col-span-2 sm:col-span-1">
              <span className="text-[11px] text-gray-500 flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 text-blue-600" />
                Est. Weight
              </span>
              <p className="font-semibold text-gray-800 text-xs sm:text-sm mt-0.5">
                {estimatedWeight || "250 g"}
              </p>
            </div>
          </div>

          {/* Fabric Composition Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Identified Fabric Composition
              </h4>
              <span className="text-xs text-gray-500">100% Total Fibers</span>
            </div>

            {/* Visual stacked bar */}
            <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden flex">
              {fabricComposition.map((item, idx) => {
                // Alternating friendly colors for composition bar
                const colors = [
                  "bg-emerald-600",
                  "bg-teal-500",
                  "bg-amber-500",
                  "bg-blue-500",
                ];
                return (
                  <div
                    key={idx}
                    style={{ width: `${item.percentage}%` }}
                    className={`${colors[idx % colors.length]} h-full transition-all duration-500`}
                    title={`${item.material}: ${item.percentage}%`}
                  />
                );
              })}
            </div>

            {/* Detailed list of fibers */}
            <div className="space-y-2 pt-1">
              {fabricComposition.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50/80 border border-gray-100 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                    <div>
                      <span className="font-bold text-gray-900">{item.material}</span>
                      <span className="text-[11px] text-gray-500 ml-2">({item.type})</span>
                    </div>
                  </div>
                  <span className="font-extrabold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md text-xs">
                    {item.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Sustainable Care Advice */}
          <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs text-emerald-900">
            <p className="font-bold mb-1">🌿 Eco-Laundry Recommendation:</p>
            <p className="text-emerald-800 leading-relaxed">
              Wash with cold water (30°C / 85°F) on a gentle cycle. Air-dry on a clothesline to eliminate dryer electricity emissions and protect fiber elasticity.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
