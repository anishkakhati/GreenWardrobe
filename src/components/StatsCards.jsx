// src/components/StatsCards.jsx
// Displays key impact statistics and metrics cards for the GreenWardrobe platform

import React from "react";
import { Shirt, Activity, Droplets, Leaf } from "lucide-react";
import { DASHBOARD_STATS } from "../data/sampleData.js";

// Helper to map icon names to Lucide icons safely
function getStatIcon(iconName) {
  switch (iconName) {
    case "Shirt":
      return <Shirt className="w-5 h-5 text-emerald-600" />;
    case "Activity":
      return <Activity className="w-5 h-5 text-teal-600" />;
    case "Droplet":
      return <Droplets className="w-5 h-5 text-blue-600" />;
    case "Leaf":
      return <Leaf className="w-5 h-5 text-green-600" />;
    default:
      return <Activity className="w-5 h-5 text-emerald-600" />;
  }
}

export default function StatsCards() {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {DASHBOARD_STATS.map((stat) => (
          <div
            key={stat.id}
            className="bg-white rounded-2xl p-5 border border-emerald-100/80 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between relative"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {stat.label}
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                {getStatIcon(stat.iconName)}
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-baseline justify-between gap-1">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                  {stat.value}
                </h3>
                <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-medium shrink-0">
                  Sample
                </span>
              </div>
              <p className="mt-1 text-xs font-medium text-emerald-700 flex items-center gap-1">
                <span>●</span> {stat.change}
              </p>
            </div>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-gray-400 italic text-right px-1">
        * Note: Cumulative platform metrics above represent illustrative sample benchmarks for demonstration.
      </p>
    </div>
  );
}
