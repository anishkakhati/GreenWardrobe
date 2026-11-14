// src/App.jsx
// ============================================================================
// GreenWardrobe - Main Application Component
// ============================================================================
// Student B.Tech CSE (AIML) Frontend Project
// Tech Stack: React 19, Tailwind CSS, Lucide React, JavaScript Fetch API
// ============================================================================

import React, { useState, useEffect } from "react";

// Components
import Navbar from "./components/Navbar.jsx";
import Hero from "./components/Hero.jsx";
import StatsCards from "./components/StatsCards.jsx";
import Features from "./components/Features.jsx";
import HowItWorks from "./components/HowItWorks.jsx";
import ImageUpload from "./components/ImageUpload.jsx";
import CameraModal from "./components/CameraModal.jsx";
import ClothingLabelPreview from "./components/ClothingLabelPreview.jsx";
import EnvironmentalImpact from "./components/EnvironmentalImpact.jsx";
import Recommendations from "./components/Recommendations.jsx";
import FabricGuide from "./components/FabricGuide.jsx";
import Footer from "./components/Footer.jsx";

// API Service
import { analyzeClothingImage, checkBackendHealth } from "./services/api.js";

// Icons for status messages
import { Sparkles, Server, CheckCircle2, History } from "lucide-react";

export default function App() {
  // --------------------------------------------------------------------------
  // APPLICATION STATE (useState)
  // --------------------------------------------------------------------------

  // 1. Navigation state: which tab/view is currently visible
  // Options: 'home' | 'analyze' | 'how-it-works' | 'fabric-guide'
  const [activeTab, setActiveTab] = useState("home");

  // 2. Image management state
  const [selectedImage, setSelectedImage] = useState(null); // File object
  const [imagePreviewUrl, setImagePreviewUrl] = useState(""); // URL string for <img>
  const [isCameraOpen, setIsCameraOpen] = useState(false); // Camera modal visibility

  // 3. Analysis state
  const [analysisResult, setAnalysisResult] = useState(null); // Result object
  const [isLoading, setIsLoading] = useState(false); // Loading indicator
  const [apiError, setApiError] = useState(""); // Error message string

  // 4. REST API & Demo Mode state
  // Default to true (Demo Mode) so the app works reliably during evaluation without backend
  const [useDemoMode, setUseDemoMode] = useState(true);
  const [backendConnected, setBackendConnected] = useState(false);

  // 5. Analysis History (stores past scans during this session)
  const [historyList, setHistoryList] = useState([]);

  // --------------------------------------------------------------------------
  // LIFECYCLE HOOK (useEffect)
  // --------------------------------------------------------------------------
  // On component mount, check if a local backend server is running on http://localhost:5000
  useEffect(() => {
    async function verifyBackend() {
      const isAlive = await checkBackendHealth();
      setBackendConnected(isAlive);
      if (isAlive) {
        console.log("[System] Live REST backend detected at localhost:5000!");
      } else {
        console.log("[System] Backend not detected. Defaulting to Demo Mode for college evaluation.");
      }
    }
    verifyBackend();
  }, []);

  // --------------------------------------------------------------------------
  // HANDLERS: Image selection, removal, and sample presets
  // --------------------------------------------------------------------------

  // Called when user selects or drops a valid image file
  const handleImageSelected = (file, previewUrl) => {
    if (imagePreviewUrl && imagePreviewUrl.startsWith("blob:") && imagePreviewUrl !== previewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setSelectedImage(file);
    setImagePreviewUrl(previewUrl);
    setApiError("");
    // Clear previous results when a new image is loaded
    setAnalysisResult(null);
  };

  // Called when user clicks "Remove / Trash" or "Choose Different Image"
  const handleImageRemoved = () => {
    if (imagePreviewUrl && imagePreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreviewUrl); // Clean up memory
    }
    setSelectedImage(null);
    setImagePreviewUrl("");
    setAnalysisResult(null);
    setApiError("");
  };

  // Called when user clicks a one-click sample preset from the UI
  const handleSelectSamplePreset = (presetGarment) => {
    if (imagePreviewUrl && imagePreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    // Mark as preset object (Issue 3 Fix)
    setSelectedImage({
      name: `${presetGarment.name.toLowerCase().replace(/\s+/g, "-")}.jpg`,
      size: 420 * 1024,
      type: "image/jpeg",
      isPreset: true,
    });
    setImagePreviewUrl(presetGarment.imageUrl);
    setAnalysisResult({
      ...presetGarment,
      isDemoData: true,
      dataSourceLabel: "Illustrative Sample Preset",
    });
    setApiError("");
  };

  // Called when user takes a photo with the live camera modal
  const handlePhotoCaptured = (capturedFile, previewUrl) => {
    if (imagePreviewUrl && imagePreviewUrl.startsWith("blob:") && imagePreviewUrl !== previewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setSelectedImage(capturedFile);
    setImagePreviewUrl(previewUrl);
    setApiError("");
    setAnalysisResult(null);
  };

  // --------------------------------------------------------------------------
  // HANDLER: Run Analysis via REST API or Demo Mode
  // --------------------------------------------------------------------------
  const handleTriggerAnalysis = async () => {
    if (!selectedImage && !imagePreviewUrl) {
      setApiError("Please select or capture a clothing image first.");
      return;
    }

    // Safety guard (Issue 3 Fix): Prevent sample preset mock objects from being sent to live backend
    const isRealFile = typeof File !== "undefined" && (selectedImage instanceof File || selectedImage instanceof Blob);
    if (!useDemoMode && !isRealFile) {
      setApiError(
        "Sample presets contain demonstration data. To test the Live REST API, please upload an image file or take a photo with your device camera."
      );
      return;
    }

    setIsLoading(true);
    setApiError("");

    try {
      // Call our API service function (demonstrating Fetch API POST request)
      const response = await analyzeClothingImage(selectedImage, useDemoMode);

      if (response && response.success) {
        setAnalysisResult(response.data);

        // Add to recent history list (keep latest 4)
        setHistoryList((prev) => [response.data, ...prev.slice(0, 3)]);

        // If backend was unreachable and automatically used fallback, notify user
        if (response.source === "fallback-demo") {
          console.info("Using simulated data as backend was unreachable.");
        }
      } else {
        throw new Error(response?.error || "Analysis failed. Please try again.");
      }
    } catch (err) {
      console.error("Analysis execution error:", err);
      setApiError(err.message || "An unexpected error occurred during analysis.");
    } finally {
      setIsLoading(false);
    }
  };

  // Quick helper to jump straight into the analyzer from Hero or CTA
  const handleStartAnalysis = () => {
    setActiveTab("analyze");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // --------------------------------------------------------------------------
  // RENDER UI
  // --------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans text-gray-800 antialiased selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* 1. Global Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        useDemoMode={useDemoMode}
        setUseDemoMode={setUseDemoMode}
        backendConnected={backendConnected}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        
        {/* ================================================================== */}
        {/* TAB 1: HOME (Landing Page)                                         */}
        {/* ================================================================== */}
        {activeTab === "home" && (
          <div>
            {/* Hero Section */}
            <Hero
              onStartAnalysis={handleStartAnalysis}
              onLearnMore={() => setActiveTab("how-it-works")}
            />

            {/* Platform Statistics */}
            <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
                <div>
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-100/70 px-3 py-1 rounded-full">
                    Impact Dashboard
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2">
                    Cumulative Environmental Metrics
                  </h2>
                </div>
                <span className="text-xs text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg font-medium self-start sm:self-auto">
                  Illustrative Sample Data
                </span>
              </div>
              <StatsCards />
            </section>

            {/* Features Section */}
            <Features />

            {/* How It Works Section */}
            <HowItWorks onStartAnalysis={handleStartAnalysis} />
          </div>
        )}

        {/* ================================================================== */}
        {/* TAB 2: ANALYZE CLOTHING (Main Dashboard & Analysis Interface)       */}
        {/* ================================================================== */}
        {activeTab === "analyze" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
            
            {/* Dashboard Header & Mode Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                  Clothing Analysis Dashboard
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Upload, inspect, and evaluate the lifecycle footprint of any garment.
                </p>
              </div>

              {/* Status Pill Badge */}
              <div className="flex items-center gap-2">
                {useDemoMode ? (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold shadow-xs">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Demo Mode (Academic Simulation)</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-xs">
                    <Server className="w-3.5 h-3.5 text-emerald-600" />
                    <span>
                      Live API: {backendConnected ? "Connected" : "Offline (Fallback Enabled)"}
                    </span>
                  </span>
                )}
              </div>
            </div>

            {/* Top Quick Stats for Dashboard context */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Platform Benchmark Figures
                </span>
                <span className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-medium">
                  Illustrative Sample Data
                </span>
              </div>
              <StatsCards />
            </div>

            {/* Section 1: Image Upload & Camera Capture Interface */}
            <ImageUpload
              selectedImage={selectedImage}
              imagePreviewUrl={imagePreviewUrl}
              onImageSelected={handleImageSelected}
              onImageRemoved={handleImageRemoved}
              onSelectSamplePreset={handleSelectSamplePreset}
              onTriggerAnalysis={handleTriggerAnalysis}
              onOpenLiveCamera={() => setIsCameraOpen(true)}
              isLoading={isLoading}
              apiError={apiError}
            />

            {/* Section 2: Results Section (Rendered when analysis is available) */}
            {analysisResult && (
              <div className="space-y-8 animate-in fade-in duration-300">
                
                {/* Visual Separator Banner: Clearly distinguish Demo vs Live Backend (Issue 4 Fix) */}
                {analysisResult.isDemoData ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="font-bold uppercase tracking-wider text-amber-900">
                        ⚡ Demo Mode: Simulated Sample Analysis
                      </span>
                      <span className="hidden md:inline text-amber-800">
                        — Educational Life Cycle Assessment (LCA) estimates for presentation testing (not live server data).
                      </span>
                    </div>
                    <span className="self-start sm:self-auto px-2 py-0.5 rounded bg-amber-200 text-amber-900 font-bold text-[10px] shrink-0 border border-amber-300">
                      {analysisResult.dataSourceLabel || "Sample Simulation"}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-bold uppercase tracking-wider text-emerald-900">
                        🌐 Live Backend Analysis Received
                      </span>
                      <span className="hidden md:inline text-emerald-800">
                        — Verified data returned from backend REST API endpoint (/api/analyze-clothing).
                      </span>
                    </div>
                    <span className="self-start sm:self-auto px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 font-bold text-[10px] shrink-0 border border-emerald-300">
                      Live Server Data
                    </span>
                  </div>
                )}

                {/* Clothing Label Preview (Garment Info + Fabric Composition) */}
                <ClothingLabelPreview
                  garmentData={analysisResult}
                  imagePreviewUrl={imagePreviewUrl}
                />

                {/* Environmental Impact Dashboard (Score, Water, Carbon, Energy) */}
                <EnvironmentalImpact
                  impactData={analysisResult.environmentalImpact}
                  isDemoData={analysisResult.isDemoData}
                  dataSourceLabel={analysisResult.dataSourceLabel}
                />

                {/* 5 Circular Recommendations Interface */}
                <Recommendations
                  recommendedAction={analysisResult.recommendation}
                  recommendationReason={analysisResult.recommendationReason}
                />

              </div>
            )}

            {/* Section 3: Recent Scans History (if any) */}
            {historyList.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <History className="w-4 h-4 text-emerald-600" />
                    <span>Recent Scans in This Session</span>
                  </h3>
                  <span className="text-xs text-gray-400">{historyList.length} items</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {historyList.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setAnalysisResult(item);
                        setImagePreviewUrl(item.imageUrl || imagePreviewUrl);
                      }}
                      className="p-3 rounded-xl border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/30 cursor-pointer transition-all text-xs space-y-1"
                    >
                      <p className="font-bold text-gray-800 truncate">{item.name}</p>
                      <div className="flex items-center justify-between text-[11px] text-gray-500">
                        <span>Score: {item.environmentalImpact?.score}/100</span>
                        <span className="font-semibold text-emerald-700">{item.recommendation}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* ================================================================== */}
        {/* TAB 3: HOW IT WORKS                                                */}
        {/* ================================================================== */}
        {activeTab === "how-it-works" && (
          <div>
            <HowItWorks onStartAnalysis={handleStartAnalysis} />
            <Features />
          </div>
        )}

        {/* ================================================================== */}
        {/* TAB 4: FABRIC GUIDE                                                */}
        {/* ================================================================== */}
        {activeTab === "fabric-guide" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <FabricGuide />
          </div>
        )}

      </main>

      {/* 2. Interactive Camera Modal (rendered when user clicks 'Use Device Camera') */}
      {isCameraOpen && (
        <CameraModal
          isOpen={isCameraOpen}
          onClose={() => setIsCameraOpen(false)}
          onPhotoCaptured={handlePhotoCaptured}
        />
      )}

      {/* 3. Global Footer */}
      <Footer onNavigate={(tab) => setActiveTab(tab)} />

    </div>
  );
}
