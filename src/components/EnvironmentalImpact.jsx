// src/components/EnvironmentalImpact.jsx
// Displays environmental impact metrics: Eco-score, Water, Carbon, Energy, and benchmarks

import React from "react";
import { Droplets, Wind, Zap, AlertCircle, Info, ShieldAlert } from "lucide-react";

export default function EnvironmentalImpact({
  impactData,
  isDemoData = true,
  dataSourceLabel
}) {
  if (!impactData) return null;

  const {
    score = 75,
    grade = "B",
    ratingText = "Moderate Environmental Footprint",
    waterConsumptionLiters = 1200,
    carbonFootprintKg = 3.5,
    energyConsumptionKwh = 4.2,
    microplasticRisk = "Low",
    biodegradability = "Partially Biodegradable",
    comparisonBenchmark = {}
  } = impactData;

  // Color logic based on score
  const getScoreTheme = (scoreValue) => {
    if (scoreValue >= 80) {
      return {
        text: "text-emerald-700",
        bg: "bg-emerald-500",
        border: "border-emerald-200",
        badgeBg: "bg-emerald-100 text-emerald-800",
      };
    } else if (scoreValue >= 60) {
      return {
        text: "text-blue-700",
        bg: "bg-blue-500",
        border: "border-blue-200",
        badgeBg: "bg-blue-100 text-blue-800",
      };
    } else if (scoreValue >= 45) {
      return {
        text: "text-amber-700",
        bg: "bg-amber-500",
        border: "border-amber-200",
        badgeBg: "bg-amber-100 text-amber-800",
      };
    } else {
      return {
        text: "text-red-700",
        bg: "bg-red-500",
        border: "border-red-200",
        badgeBg: "bg-red-100 text-red-800",
      };
    }
  };

  const theme = getScoreTheme(score);

  return (
    <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-6 sm:p-7 space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-100">
        <div>
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
            Life Cycle Assessment (LCA)
          </span>
          <h3 className="text-xl font-bold text-gray-900 mt-1">Environmental Impact Dashboard</h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isDemoData ? (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-300">
              ⚡ {dataSourceLabel || "Simulated Demo LCA"}
            </span>
          ) : (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300">
              🌐 {dataSourceLabel || "Live Server LCA"}
            </span>
          )}
          <span className={`text-xs font-extrabold px-3 py-1.5 rounded-full border ${theme.badgeBg}`}>
            Tier {grade} Rating
          </span>
        </div>
      </div>

      {/* Main Score Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50/60 to-teal-50/40 border border-emerald-100 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Score & Gauge */}
        <div className="flex items-center gap-5">
          <div className="w-24 h-24 rounded-2xl bg-white shadow-md border border-emerald-100 flex flex-col items-center justify-center p-2 text-center shrink-0">
            <span className={`text-3xl font-black ${theme.text}`}>{score}</span>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Out of 100</span>
          </div>

          <div>
            <h4 className="text-lg font-bold text-gray-900">Sustainability Score</h4>
            <p className="text-sm font-semibold text-emerald-800 mt-0.5">{ratingText}</p>
            <p className="text-xs text-gray-500 mt-1">
              Higher score denotes lower ecological damage, renewable raw materials, and circular longevity.
            </p>
          </div>
        </div>

        {/* Progress bar visual */}
        <div className="w-full md:w-64 space-y-1.5">
          <div className="flex justify-between text-xs font-semibold text-gray-600">
            <span>Environmental Health</span>
            <span>{score}%</span>
          </div>
          <div className="w-full h-3 rounded-full bg-gray-200 overflow-hidden">
            <div
              style={{ width: `${score}%` }}
              className={`h-full ${theme.bg} transition-all duration-700 rounded-full`}
            />
          </div>
          <div className="flex justify-between text-[10px] text-gray-400">
            <span>0 (Severe Impact)</span>
            <span>100 (Optimal Eco)</span>
          </div>
        </div>

      </div>

      {/* 3 Core Metric Cards: Water, Carbon, Energy */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Metric 1: Water Consumption */}
        <div className="p-5 rounded-xl bg-blue-50/40 border border-blue-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
              Water Footprint
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Droplets className="w-4 h-4" />
            </div>
          </div>

          <div className="my-3">
            <p className="text-2xl font-black text-gray-900">
              {waterConsumptionLiters.toLocaleString()}{" "}
              <span className="text-sm font-normal text-gray-500">Liters</span>
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Estimated agricultural and wet processing water usage.
            </p>
          </div>

          <div className="pt-2 border-t border-blue-100 text-[11px] text-blue-800 font-medium">
            ≈ {Math.round(waterConsumptionLiters / 80)} domestic showers
          </div>
        </div>

        {/* Metric 2: Carbon Emissions */}
        <div className="p-5 rounded-xl bg-teal-50/40 border border-teal-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal-900 uppercase tracking-wider">
              Carbon Footprint
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
              <Wind className="w-4 h-4" />
            </div>
          </div>

          <div className="my-3">
            <p className="text-2xl font-black text-gray-900">
              {carbonFootprintKg}{" "}
              <span className="text-sm font-normal text-gray-500">kg CO₂e</span>
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Greenhouse gas emissions from raw harvest to manufacturing.
            </p>
          </div>

          <div className="pt-2 border-t border-teal-100 text-[11px] text-teal-800 font-medium">
            ≈ Driving {Math.round(carbonFootprintKg * 4.2)} km in a passenger car
          </div>
        </div>

        {/* Metric 3: Energy Requirements */}
        <div className="p-5 rounded-xl bg-amber-50/40 border border-amber-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
              Energy Consumption
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>

          <div className="my-3">
            <p className="text-2xl font-black text-gray-900">
              {energyConsumptionKwh}{" "}
              <span className="text-sm font-normal text-gray-500">kWh</span>
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Thermal and electrical power consumed during spinning & weaving.
            </p>
          </div>

          <div className="pt-2 border-t border-amber-100 text-[11px] text-amber-800 font-medium">
            ≈ Powering a 10W LED bulb for {Math.round(energyConsumptionKwh * 100)} hours
          </div>
        </div>

      </div>

      {/* Secondary Indicators: Microplastics & Biodegradability */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900">Microplastic Pollution Risk</p>
            <p className="text-xs text-gray-600">{microplasticRisk}</p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900">End-of-Life Biodegradability</p>
            <p className="text-xs text-gray-600">{biodegradability}</p>
          </div>
        </div>
      </div>

      {/* Benchmark comparison note */}
      {comparisonBenchmark?.waterSavedVsConventional && (
        <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
          <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Lifecycle Benchmark: </span>
            <span>{comparisonBenchmark.waterSavedVsConventional}. </span>
            {comparisonBenchmark.carbonSavedVsSynthetic && (
              <span>{comparisonBenchmark.carbonSavedVsSynthetic}.</span>
            )}
          </div>
        </div>
      )}

      {/* Crucial Academic / Viva Disclaimer */}
      <div className="p-3 rounded-xl bg-gray-100/80 border border-gray-200 text-[11px] text-gray-500 flex items-center gap-2">
        <Info className="w-4 h-4 text-gray-400 shrink-0" />
        <p>
          <strong>Academic Demonstration Notice:</strong> Values shown are simulated estimations derived from published textile Life Cycle Assessment (LCA) benchmarks for educational defense purposes.
        </p>
      </div>

    </div>
  );
}
