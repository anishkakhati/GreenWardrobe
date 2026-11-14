// src/components/Recommendations.jsx
// Displays the 5 circular fashion recommendations, highlighting the recommended action

import React, { useState } from "react";
import { CheckCircle2, ShoppingBag, HelpCircle, Wrench, RefreshCw, Sparkles } from "lucide-react";
import { RECOMMENDATIONS } from "../data/sampleData.js";

// Helper to return icons for each recommendation
function getRecommendationIcon(id) {
  switch (id) {
    case "BUY":
      return <ShoppingBag className="w-5 h-5 text-emerald-600" />;
    case "THINK TWICE":
      return <HelpCircle className="w-5 h-5 text-amber-600" />;
    case "REPAIR":
      return <Wrench className="w-5 h-5 text-blue-600" />;
    case "REUSE":
      return <RefreshCw className="w-5 h-5 text-purple-600" />;
    case "SECOND-HAND":
      return <Sparkles className="w-5 h-5 text-teal-600" />;
    default:
      return <Sparkles className="w-5 h-5 text-emerald-600" />;
  }
}

export default function Recommendations({
  recommendedAction = "BUY",
  recommendationReason = ""
}) {
  // Allow user to click other cards to explore all 5 recommendations
  // If user hasn't explicitly selected one, default to recommendedAction
  const [userSelectedAction, setUserSelectedAction] = useState(null);

  const selectedActionId = userSelectedAction || recommendedAction;

  const activeRec =
    RECOMMENDATIONS.find((r) => r.id === selectedActionId) ||
    RECOMMENDATIONS[0];

  const isRecommended = selectedActionId === recommendedAction;

  return (
    <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-6 sm:p-7 space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-gray-100">
        <div>
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
            Circular Economy Engine
          </span>
          <h3 className="text-xl font-bold text-gray-900 mt-1">
            5-Tier Recommendation Interface
          </h3>
        </div>

        <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full">
          Suggested Action: {recommendedAction}
        </span>
      </div>

      {/* 5 Recommendation Buttons / Selectors */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {RECOMMENDATIONS.map((rec) => {
          const isCurrentGarmentChoice = rec.id === recommendedAction;
          const isSelected = rec.id === selectedActionId;

          return (
            <button
              key={rec.id}
              onClick={() => setUserSelectedAction(rec.id)}
              className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? "border-emerald-600 bg-emerald-50/80 shadow-sm ring-2 ring-emerald-500/20"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/60"
              }`}
            >
              {/* Highlight badge if this is the AI recommendation */}
              {isCurrentGarmentChoice && (
                <span className="absolute -top-2 right-2 bg-emerald-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-xs">
                  Active
                </span>
              )}

              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center shrink-0">
                  {getRecommendationIcon(rec.id)}
                </div>
                <span className="text-xs font-bold text-gray-900 tracking-tight">
                  {rec.title}
                </span>
              </div>

              <p className="text-[10px] text-gray-500 line-clamp-2">
                {rec.tagline}
              </p>
            </button>
          );
        })}
      </div>

      {/* Detailed View of Selected Recommendation */}
      <div className="p-6 rounded-2xl bg-gray-50/70 border border-gray-200 space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-200/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center shadow-xs">
              {getRecommendationIcon(activeRec.id)}
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                <span>Action: {activeRec.title}</span>
                {isRecommended && (
                  <span className="text-xs bg-emerald-600 text-white px-2 py-0.5 rounded-md font-semibold">
                    Optimal for this Garment
                  </span>
                )}
              </h4>
              <p className="text-xs text-gray-500">{activeRec.tagline}</p>
            </div>
          </div>

          <span className={`text-xs px-2.5 py-1 rounded-md font-bold self-start sm:self-auto border ${activeRec.badgeColor}`}>
            {activeRec.id}
          </span>
        </div>

        {/* AI Specific Reason (if this is the recommended action) */}
        {isRecommended && recommendationReason && (
          <div className="p-3.5 rounded-xl bg-emerald-100/70 border border-emerald-200 text-xs text-emerald-950 font-medium">
            <strong className="block text-emerald-900 font-bold mb-0.5">
              💡 Why this action is recommended:
            </strong>
            {recommendationReason}
          </div>
        )}

        {/* General Strategy Description */}
        <p className="text-sm text-gray-700 leading-relaxed">
          {activeRec.description}
        </p>

        {/* Practical Action Tips */}
        <div className="space-y-2 pt-2">
          <h5 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
            Consumer Action Checklist:
          </h5>
          <div className="space-y-2">
            {activeRec.actionTips.map((tip, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 text-xs text-gray-600 bg-white p-2.5 rounded-lg border border-gray-200/60"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
