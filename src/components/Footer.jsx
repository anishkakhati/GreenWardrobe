// src/components/Footer.jsx
// Platform footer with project info, mission, navigation links, and student disclaimer

import React from "react";
import { Leaf, GraduationCap } from "lucide-react";

export default function Footer({ onNavigate }) {
  const currentYear = 2026;
  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Brand & Mission */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                <Leaf className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Green<span className="text-emerald-400">Wardrobe</span>
              </span>
            </div>

            <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
              An intelligent sustainable fashion platform designed to calculate the environmental toll of clothing and empower conscious, circular consumer decisions.
            </p>

            <div className="pt-2 flex items-center gap-2 text-xs text-gray-400">
              <GraduationCap className="w-4 h-4 text-emerald-400" />
              <span>B.Tech CSE (AIML) College Project</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <button
                  onClick={() => onNavigate("home")}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Home & Overview
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("analyze")}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Garment Analyzer
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("how-it-works")}
                  className="hover:text-emerald-400 transition-colors"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("fabric-guide")}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Textile Fiber Guide
                </button>
              </li>
            </ul>
          </div>

          {/* 5 Circular Recommendations Summary */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Circular Fashion Principles
            </h4>
            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-1 rounded-md bg-emerald-950/80 text-emerald-300 text-xs font-semibold border border-emerald-800">
                1. BUY (Eco-Certified)
              </span>
              <span className="px-2.5 py-1 rounded-md bg-amber-950/80 text-amber-300 text-xs font-semibold border border-amber-800">
                2. THINK TWICE
              </span>
              <span className="px-2.5 py-1 rounded-md bg-blue-950/80 text-blue-300 text-xs font-semibold border border-blue-800">
                3. REPAIR
              </span>
              <span className="px-2.5 py-1 rounded-md bg-purple-950/80 text-purple-300 text-xs font-semibold border border-purple-800">
                4. REUSE
              </span>
              <span className="px-2.5 py-1 rounded-md bg-teal-950/80 text-teal-300 text-xs font-semibold border border-teal-800">
                5. SECOND-HAND
              </span>
            </div>
            <p className="text-xs text-gray-400 pt-1">
              "The most sustainable garment is the one already in your closet." — Orsola de Castro
            </p>
          </div>

        </div>

        {/* Bottom Bar with Viva/Academic Disclaimer */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400 text-center sm:text-left">
          <p>
            © {currentYear} GreenWardrobe Frontend System. Developed for Academic Evaluation.
          </p>
          <div className="flex items-center gap-1 text-gray-400">
            <span>Built with React.js & Tailwind CSS</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
