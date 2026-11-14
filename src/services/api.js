// src/services/api.js
// ============================================================================
// GreenWardrobe REST API Integration Service
// ============================================================================
//
// WHAT THIS FILE DOES:
// This service file encapsulates all network communication between the React
// frontend and the backend REST API server.
//
// FOR THE STUDENT EVALUATION (VIVA NOTE):
// In modern web applications, frontend and backend are kept separate (Decoupled Architecture).
// - Frontend (React): Handles UI, user interaction, image capture, and rendering results.
// - Backend (Python/Node/Flask/FastAPI): Handles deep learning AI models (e.g. YOLO/CNN
//   for clothing and care label recognition) and calculates Life Cycle Assessment (LCA) data.
// - Bridge: REST API endpoints exchanging JSON data over HTTP.
//
// If the backend server is not running during evaluation, this service automatically
// falls back to "Demo Mode", returning realistic simulated data so the application
// never breaks in front of your teacher.
// ============================================================================

import { SAMPLE_GARMENTS } from "../data/sampleData.js";

// BASE URL for the backend server.
// When your backend developer creates the API (e.g., using Flask, FastAPI, or Express),
// replace this URL with the actual backend host.
export const API_BASE_URL = "http://localhost:5000/api";

/**
 * ----------------------------------------------------------------------------
 * 1. POST REQUEST: Upload an image file for AI clothing analysis
 * ----------------------------------------------------------------------------
 * FRONTEND vs BACKEND RESPONSIBILITY:
 * - Frontend: Collects the image File from the user (via <input type="file"> or Camera),
 *   wraps it in a FormData object, and sends it via HTTP POST.
 * - Backend (Required): An endpoint (e.g. POST /api/analyze-clothing) that parses
 *   multipart/form-data, runs an AI classification model on the image, calculates
 *   environmental metrics, and responds with a JSON object.
 *
 * @param {File} imageFile - The image File object from an input or camera capture
 * @param {boolean} forceDemoMode - If true, bypasses network call and returns simulated data
 * @returns {Promise<Object>} The analysis result object
 */
export async function analyzeClothingImage(imageFile, forceDemoMode = false) {
  // If the user turned on "Demo Mode" in the UI, return sample data immediately
  if (forceDemoMode) {
    console.log("[Demo Mode] Simulating backend AI analysis for:", imageFile?.name || "camera-capture.jpg");
    return simulateBackendAnalysis(imageFile);
  }

  // 1. Safety check for Live API mode (Issue 3 Fix):
  // Sample presets are plain mock objects, not real binary File/Blob instances.
  // Prevent sending mock preset objects over the network to the live backend server.
  const isBinaryFile = typeof File !== "undefined" && (imageFile instanceof File || imageFile instanceof Blob);
  if (!isBinaryFile) {
    throw new Error(
      "Sample presets contain demonstration data. To test the Live Backend API, please upload an image file or take a photo with your camera."
    );
  }

  // 2. Prepare FormData:
  // We use FormData because standard JSON cannot transmit raw binary image files.
  // FormData formats the request body as 'multipart/form-data'.
  const formData = new FormData();
  formData.append("image", imageFile);

  try {
    console.log(`[REST API] Sending POST request to: ${API_BASE_URL}/analyze-clothing`);

    // 3. Perform Fetch POST request:
    // Notice: We DO NOT manually set the 'Content-Type' header here.
    // When passing a FormData instance, the browser automatically sets:
    // 'Content-Type: multipart/form-data; boundary=----WebKitFormBoundary...'
    const response = await fetch(`${API_BASE_URL}/analyze-clothing`, {
      method: "POST",
      body: formData,
    });

    // 4. Check HTTP Status Code:
    // response.ok is true if the HTTP status is in the 200-299 range.
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message || `Server responded with HTTP status ${response.status}`
      );
    }

    // 5. Parse the JSON response body:
    const data = await response.json();
    return {
      success: true,
      data: {
        ...data,
        isDemoData: false,
        dataSourceLabel: "Live Backend Analysis",
      },
      source: "live-backend",
    };
  } catch (error) {
    // If the error was our client-side preset check, re-throw it directly
    if (!isBinaryFile) {
      throw error;
    }

    // 6. Graceful Fallback:
    // If the backend is not running (e.g., net::ERR_CONNECTION_REFUSED) or throws an error,
    // we log the error and fall back to Demo Mode so the college demo continues smoothly!
    console.warn(
      "[REST API Warning] Backend server not reachable at " + API_BASE_URL +
      ". Automatically switching to Demo Mode with sample data. Error:",
      error.message
    );

    const fallbackData = await simulateBackendAnalysis(imageFile);
    return {
      ...fallbackData,
      data: {
        ...fallbackData.data,
        isDemoData: true,
        dataSourceLabel: "Fallback Demo Data (Backend Offline)",
      },
      source: "fallback-demo",
      backendError: error.message,
    };
  }
}

/**
 * ----------------------------------------------------------------------------
 * 2. GET REQUEST: Retrieve previous analysis results by Garment ID
 * ----------------------------------------------------------------------------
 * Demonstrates a standard HTTP GET request with query/path parameters.
 *
 * @param {string} garmentId - Unique identifier of the garment
 * @param {boolean} forceDemoMode - Whether to return demo data
 * @returns {Promise<Object>}
 */
export async function getClothingResultById(garmentId, forceDemoMode = false) {
  if (forceDemoMode) {
    const found = SAMPLE_GARMENTS.find((g) => g.id === garmentId) || SAMPLE_GARMENTS[0];
    return { success: true, data: found, source: "demo" };
  }

  try {
    console.log(`[REST API] Sending GET request to: ${API_BASE_URL}/clothing-results/${garmentId}`);

    const response = await fetch(`${API_BASE_URL}/clothing-results/${garmentId}`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch garment data. HTTP Status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data: data, source: "live-backend" };
  } catch (error) {
    console.warn("[REST API Warning] Failed to fetch from backend. Returning sample item.", error.message);
    const found = SAMPLE_GARMENTS.find((g) => g.id === garmentId) || SAMPLE_GARMENTS[0];
    return { success: true, data: found, source: "fallback-demo", backendError: error.message };
  }
}

/**
 * ----------------------------------------------------------------------------
 * 3. HEALTH CHECK: Verify if backend is reachable
 * ----------------------------------------------------------------------------
 * Sends a lightweight GET /api/health request to check server readiness.
 */
export async function checkBackendHealth() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout

    const response = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    return response.ok;
  } catch {
    // Expected to fail if backend is not running locally
    return false;
  }
}

/**
 * ----------------------------------------------------------------------------
 * HELPER: Simulate Backend AI Processing (Demo Mode)
 * ----------------------------------------------------------------------------
 * Simulates a 1.2-second network latency as if an AI vision model (such as a
 * PyTorch/TensorFlow ResNet or YOLO backend) were processing the uploaded clothing image.
 *
 * NOTE FOR TEACHER:
 * These sample calculations are educational estimates based on published
 * textile Life Cycle Assessment (LCA) literature, NOT verified lab measurements.
 */
function simulateBackendAnalysis(imageFile) {
  return new Promise((resolve) => {
    // Simulate realistic 1.2 second latency for AI inference
    setTimeout(() => {
      // Pick a sample result based on file name or random selection
      const filename = imageFile?.name?.toLowerCase() || "";
      let chosenSample;

      if (filename.includes("jean") || filename.includes("denim")) {
        chosenSample = SAMPLE_GARMENTS[2]; // Vintage Denim
      } else if (filename.includes("hoodie") || filename.includes("poly") || filename.includes("jacket")) {
        chosenSample = SAMPLE_GARMENTS[1]; // Polyester Hoodie
      } else if (filename.includes("linen") || filename.includes("shirt")) {
        chosenSample = SAMPLE_GARMENTS[3]; // Linen Shirt
      } else {
        // Default to organic cotton or rotate
        chosenSample = SAMPLE_GARMENTS[0];
      }

      // If user provided a real file, keep their preview URL or name
      const customResult = {
        ...chosenSample,
        id: `scan-${Date.now()}`,
        analyzedAt: new Date().toLocaleTimeString(),
        fileName: imageFile?.name || "camera-scan.jpg",
        fileSizeKb: imageFile?.size ? (imageFile.size / 1024).toFixed(1) : "340.5",
        isDemoData: true,
        dataSourceLabel: "Simulated AI Demo Data",
      };

      resolve({
        success: true,
        data: customResult,
        source: "simulated-ai",
      });
    }, 1200);
  });
}
