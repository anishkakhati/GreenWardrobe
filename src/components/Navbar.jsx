// src/components/Navbar.jsx
// Navigation header for GreenWardrobe with logo, navigation links, and API mode toggle

import React, { useState } from "react";
import { Leaf, Menu, X, Activity } from "lucide-react";

export default function Navbar({
  activeTab,
  setActiveTab,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Helper to handle link navigation
  const handleNavClick = (tabName) => {
    setActiveTab(tabName);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand Name */}
          <div
            onClick={() => handleNavClick("home")}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-200 group-hover:scale-105 transition-transform duration-200">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-1">
                Green<span className="text-emerald-600">Wardrobe</span>
              </span>
              <span className="hidden sm:block text-[10px] text-gray-500 font-medium tracking-wider uppercase">
                Sustainable Fashion Intelligence
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              onClick={() => handleNavClick("home")}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "home"
                  ? "bg-emerald-50 text-emerald-700 font-semibold"
                  : "text-gray-600 hover:text-emerald-700 hover:bg-gray-50"
              }`}
            >
              Home
            </button>

            <button
              onClick={() => handleNavClick("analyze")}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === "analyze"
                  ? "bg-emerald-600 text-white shadow-sm font-semibold"
                  : "text-gray-600 hover:text-emerald-700 hover:bg-gray-50"
              }`}
            >
              <Activity className="w-4 h-4" />
              Analyze Garment
            </button>

            <button
              onClick={() => handleNavClick("how-it-works")}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "how-it-works"
                  ? "bg-emerald-50 text-emerald-700 font-semibold"
                  : "text-gray-600 hover:text-emerald-700 hover:bg-gray-50"
              }`}
            >
              How It Works
            </button>

            <button
              onClick={() => handleNavClick("fabric-guide")}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "fabric-guide"
                  ? "bg-emerald-50 text-emerald-700 font-semibold"
                  : "text-gray-600 hover:text-emerald-700 hover:bg-gray-50"
              }`}
            >
              Fabric Guide
            </button>
          </nav>


          {/* Mobile Menu Button (Hamburger) */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-emerald-100 bg-white px-4 pt-3 pb-4 space-y-2">
          <button
            onClick={() => handleNavClick("home")}
            className={`w-full text-left px-3 py-2 rounded-lg text-base font-medium ${
              activeTab === "home" ? "bg-emerald-50 text-emerald-700 font-bold" : "text-gray-700"
            }`}
          >
            Home
          </button>
          <button
            onClick={() => handleNavClick("analyze")}
            className={`w-full text-left px-3 py-2 rounded-lg text-base font-medium ${
              activeTab === "analyze" ? "bg-emerald-600 text-white font-bold" : "text-gray-700"
            }`}
          >
            Analyze Garment
          </button>
          <button
            onClick={() => handleNavClick("how-it-works")}
            className={`w-full text-left px-3 py-2 rounded-lg text-base font-medium ${
              activeTab === "how-it-works" ? "bg-emerald-50 text-emerald-700 font-bold" : "text-gray-700"
            }`}
          >
            How It Works
          </button>
          <button
            onClick={() => handleNavClick("fabric-guide")}
            className={`w-full text-left px-3 py-2 rounded-lg text-base font-medium ${
              activeTab === "fabric-guide" ? "bg-emerald-50 text-emerald-700 font-bold" : "text-gray-700"
            }`}
          >
            Fabric Guide
          </button>

        </div>
      )}
    </header>
  );
}
