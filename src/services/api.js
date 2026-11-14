import { adaptBackendResponse } from "./responseAdapter.js";

const configuredBaseUrl = import.meta.env?.VITE_API_BASE_URL || "http://localhost:8000";
export const API_BASE_URL = configuredBaseUrl.replace(/\/$/, "");

export async function analyzeClothingImage(imageFile) {
  if (!(typeof File !== "undefined" && imageFile instanceof File) && !(typeof Blob !== "undefined" && imageFile instanceof Blob)) {
    throw new Error("Choose an image file to analyze.");
  }

  const formData = new FormData();
  formData.append("image", imageFile);

  let response;
  try {
    response = await fetch(`${API_BASE_URL}/api/v1/analyze`, { method: "POST", body: formData });
  } catch {
    throw new Error(`Cannot reach the GreenWardrobe backend at ${API_BASE_URL}. Start the API and try again.`);
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const backendMessage = payload?.error?.message || payload?.detail || payload?.message;
    const message = Array.isArray(backendMessage)
      ? backendMessage.map((item) => item.msg || JSON.stringify(item)).join("; ")
      : backendMessage;
    if (response.status === 413) throw new Error(message || "Image is too large. Choose an image under 10 MB.");
    if (response.status === 415 || response.status === 400) throw new Error(message || "Unsupported image. Choose a JPEG, PNG, or WEBP file.");
    if (response.status === 422) throw new Error(message || "The image could not be classified. Upload a clear garment photo or readable care label.");
    throw new Error(message || `Analysis failed (HTTP ${response.status}).`);
  }
  if (!payload || payload.success === false) throw new Error(payload?.error?.message || "The backend returned an invalid analysis response.");
  return adaptBackendResponse(payload);
}

export async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}
