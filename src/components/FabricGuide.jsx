// src/components/FabricGuide.jsx
// Educational guide comparing common textile fibers, their ecological footprints, and care tips

import React from "react";
import { BookOpen } from "lucide-react";
import { FABRIC_GUIDE } from "../data/sampleData.js";

export default function FabricGuide() {
  return (
    <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-6 sm:p-8 space-y-6">
      
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Textile Fiber Sustainability Matrix
          </h2>
          <p className="text-sm text-gray-500">
            Compare how different fabrics impact water, climate, and microplastic pollution.
          </p>
        </div>
      </div>

      {/* Fabric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {FABRIC_GUIDE.map((fabric, idx) => (
          <div
            key={idx}
            className="p-5 rounded-xl border border-gray-200/80 bg-gray-50/50 hover:bg-white hover:border-emerald-300 transition-all space-y-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-base">{fabric.name}</h3>
              <span
                className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${
                  fabric.ecoRating.startsWith("A")
                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                    : fabric.ecoRating.startsWith("B")
                    ? "bg-blue-100 text-blue-800 border-blue-300"
                    : fabric.ecoRating.startsWith("C")
                    ? "bg-amber-100 text-amber-800 border-amber-300"
                    : "bg-red-100 text-red-800 border-red-300"
                }`}
              >
                Grade {fabric.ecoRating}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs pt-1">
              <div className="p-2 rounded-lg bg-white border border-gray-100">
                <span className="text-gray-400 text-[10px] block">Water Need</span>
                <span className="font-semibold text-gray-800">{fabric.waterImpact}</span>
              </div>
              <div className="p-2 rounded-lg bg-white border border-gray-100">
                <span className="text-gray-400 text-[10px] block">Carbon</span>
                <span className="font-semibold text-gray-800">{fabric.carbonImpact}</span>
              </div>
              <div className="p-2 rounded-lg bg-white border border-gray-100">
                <span className="text-gray-400 text-[10px] block">Microplastics</span>
                <span className="font-semibold text-gray-800">{fabric.microplastics}</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs pt-1">
              <p className="text-emerald-800">
                <strong>Advantage:</strong> {fabric.pros}
              </p>
              <p className="text-gray-600">
                <strong>Drawback:</strong> {fabric.cons}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Sustainable Consumer Advice Banner */}
      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
        <p className="font-bold text-sm">💡 Sustainable Fashion Rule of Thumb:</p>
        <p>
          Prioritize natural plant fibers (flax linen, organic cotton, hemp) or certified recycled textiles. When washing synthetic activewear, use a micro-waste filter bag (such as Guppyfriend) to capture shedding plastic microfibers before they reach waterways.
        </p>
      </div>

    </div>
  );
}
