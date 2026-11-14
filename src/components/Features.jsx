// src/components/Features.jsx
// Highlights core features and sustainability capabilities of GreenWardrobe

import React from "react";
import { ScanText, BarChart3, RefreshCw, AlertTriangle, ShieldCheck, HeartHandshake } from "lucide-react";

export default function Features() {
  const featureList = [
    {
      icon: <ScanText className="w-6 h-6 text-emerald-600" />,
      title: "Care Label & Fabric Detection",
      description:
        "Upload a photo of your garment or its care tag. The system identifies fiber types, such as Organic Cotton, Linen, Polyester, or Elastane."
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-teal-600" />,
      title: "LCA Life-Cycle Footprint",
      description:
        "Calculates environmental parameters including water consumption (liters), carbon emissions (kg CO₂e), and energy requirements (kWh)."
    },
    {
      icon: <RefreshCw className="w-6 h-6 text-blue-600" />,
      title: "5 Circular Recommendations",
      description:
        "Get direct, practical advice: BUY eco-friendly staples, THINK TWICE on synthetic blends, REPAIR worn pieces, REUSE textiles, or thrift SECOND-HAND."
    },
    {
      icon: <AlertTriangle className="w-6 h-6 text-amber-600" />,
      title: "Microplastic Shedding Index",
      description:
        "Synthetic fabrics like polyester and nylon shed microfibers during washing. GreenWardrobe alerts you to microfiber ocean pollution risks."
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-green-600" />,
      title: "Transparent Eco-Scoring",
      description:
        "Standardized 0-100 environmental index graded from Tier A (Outstanding) down to Tier D (Heavy Resource Burden) based on verified textile data."
    },
    {
      icon: <HeartHandshake className="w-6 h-6 text-purple-600" />,
      title: "Conscious Wardrobe Building",
      description:
        "Cultivate the 30-Wears mindset. Reduce spontaneous fast-fashion impulse purchases and extend garment longevity."
    }
  ];

  return (
    <section className="py-14 sm:py-20 bg-gray-50/60 border-t border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-100/70 px-3 py-1 rounded-full">
            Core Capabilities
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 mt-3 tracking-tight">
            How GreenWardrobe Drives Sustainable Habits
          </h2>
          <p className="mt-3 text-sm sm:text-base text-gray-600">
            Fast fashion produces 10% of global carbon emissions and 20% of global industrial wastewater. Here is how our application helps you make an impact.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {featureList.map((feature, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 sm:p-7 border border-gray-200/80 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-200 group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-200">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-gray-100 flex items-center text-xs font-semibold text-emerald-700">
                <span>GreenWardrobe Standard</span>
                <span className="ml-auto text-gray-300">#0{idx + 1}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
