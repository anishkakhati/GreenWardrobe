// src/components/Hero.jsx
// Hero section explaining the purpose of GreenWardrobe with attractive CTAs

import React from "react";
import { ArrowRight, Sparkles, Droplets, Wind, ShieldCheck, Camera } from "lucide-react";

export default function Hero({ onStartAnalysis, onLearnMore }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/70 via-white to-white py-14 sm:py-20 border-b border-emerald-50">
      
      {/* Decorative background glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-200/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-teal-100/50 rounded-full blur-2xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headlines & Call to Actions */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold shadow-sm">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Sustainable Fashion AI Assistant</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.15]">
              Wear the change. <br className="hidden sm:inline" />
              <span className="text-emerald-600 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Measure the impact.
              </span>
            </h1>

            {/* Subheading / Mission */}
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Every garment tells an environmental story. GreenWardrobe scans your clothing and care labels to calculate water consumption, carbon emissions, and recyclability—helping you make sustainable, informed wardrobe decisions.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onStartAnalysis}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-base shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <Camera className="w-5 h-5" />
                <span>Analyze Garment Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onLearnMore}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-gray-50 text-gray-700 font-semibold text-base border border-gray-200 shadow-sm transition-all hover:border-emerald-300 cursor-pointer"
              >
                How It Works
              </button>
            </div>

            {/* Key Value Badges */}
            <div className="pt-6 grid grid-cols-3 gap-3 border-t border-gray-100 text-left">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                  <Droplets className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-900">Water Index</p>
                  <p className="text-[11px] text-gray-500">Liters consumed</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center text-teal-700 shrink-0">
                  <Wind className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-900">Carbon Metric</p>
                  <p className="text-[11px] text-gray-500">kg CO₂e footprint</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-900">Circular Action</p>
                  <p className="text-[11px] text-gray-500">Buy, Repair, Reuse</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Visual Sample Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-emerald-900/5 border border-emerald-100 p-5 space-y-4 relative">
              
              {/* Card Header */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Live Scan Preview</span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  Score: 88 / 100 (Tier A)
                </span>
              </div>

              {/* Sample Garment Image with Label Overlay */}
              <div className="relative rounded-xl overflow-hidden bg-gray-100 h-48 group">
                <img
                  src="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80"
                  alt="Sample Organic T-Shirt"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute bottom-2 left-2 right-2 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-gray-900">Organic Cotton Tee</p>
                    <p className="text-[11px] text-gray-500">95% Organic Cotton • 5% Elastane</p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold text-[10px]">
                    ECO CHOICE
                  </span>
                </div>
              </div>

              {/* Mini Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-100">
                  <span className="text-gray-500 text-[11px]">Water Saved</span>
                  <p className="font-bold text-emerald-800 text-sm">79% reduction</p>
                </div>
                <div className="p-2.5 rounded-lg bg-teal-50/70 border border-teal-100">
                  <span className="text-gray-500 text-[11px]">Carbon Emissions</span>
                  <p className="font-bold text-teal-800 text-sm">1.8 kg CO₂e</p>
                </div>
              </div>

              {/* Recommendation Strip */}
              <div className="p-3 rounded-xl bg-emerald-600 text-white flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-85">Recommended Action</span>
                  <p className="text-sm font-bold flex items-center gap-1.5">
                    BUY WITH CONFIDENCE
                  </p>
                </div>
                <span className="text-xs bg-white/20 px-2.5 py-1 rounded-md font-medium">
                  Lifespan: 30+ wears
                </span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
