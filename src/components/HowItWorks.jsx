// src/components/HowItWorks.jsx
// Visual step-by-step workflow explaining how GreenWardrobe operates

import React from "react";
import { UploadCloud, Cpu, Sparkles, ArrowRight } from "lucide-react";

export default function HowItWorks({ onStartAnalysis }) {
  const steps = [
    {
      stepNumber: "01",
      icon: <UploadCloud className="w-7 h-7 text-emerald-600" />,
      title: "Upload or Snap a Photo",
      description:
        "Select an image from your device or use your smartphone/webcam camera to capture the garment or its inner care label."
    },
    {
      stepNumber: "02",
      icon: <Cpu className="w-7 h-7 text-teal-600" />,
      title: "AI & Footprint Computation",
      description:
        "Our system detects the fabric breakdown (e.g. 95% Organic Cotton, 5% Elastane) and calculates total water, carbon, and energy requirements."
    },
    {
      stepNumber: "03",
      icon: <Sparkles className="w-7 h-7 text-blue-600" />,
      title: "Score & Circular Action",
      description:
        "Review your standardized Eco-Score (0-100) and actionable circular fashion recommendations: Buy, Think Twice, Repair, Reuse, or Second-Hand."
    }
  ];

  return (
    <section className="py-14 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-100/70 px-3 py-1 rounded-full">
            Simple 3-Step Process
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 mt-3 tracking-tight">
            How GreenWardrobe Works
          </h2>
          <p className="mt-3 text-sm sm:text-base text-gray-600">
            From garment photograph to environmental clarity in under 3 seconds.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="bg-emerald-50/40 rounded-2xl p-6 sm:p-8 border border-emerald-100 relative flex flex-col justify-between hover:bg-emerald-50/70 transition-colors"
            >
              {/* Step Number Top-Right */}
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-emerald-100 flex items-center justify-center">
                  {step.icon}
                </div>
                <span className="text-3xl font-black text-emerald-200">
                  {step.stepNumber}
                </span>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2.5">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-emerald-100/60 text-xs font-semibold text-emerald-700 flex items-center gap-1">
                <span>Phase {idx + 1}</span>
                <span className="text-emerald-400">→</span>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action Banner */}
        <div className="mt-12 bg-gradient-to-r from-emerald-700 to-teal-700 rounded-2xl p-6 sm:p-10 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg shadow-emerald-900/10">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold">Ready to analyze your clothing?</h3>
            <p className="text-emerald-100 text-sm mt-1">
              Try uploading an image or use our preset clothing samples.
            </p>
          </div>
          <button
            onClick={onStartAnalysis}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white text-emerald-800 font-bold text-sm hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2 shadow-sm shrink-0 cursor-pointer"
          >
            <span>Launch Clothing Analyzer</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
}
