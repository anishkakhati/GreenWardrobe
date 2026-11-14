// src/components/ImageUpload.jsx
// Handles image upload, camera trigger, file validation, preview, and analysis trigger

import React, { useState, useRef } from "react";
import { UploadCloud, Camera, Trash2, AlertCircle, FileCheck, Loader2, Sparkles } from "lucide-react";

// Backend maximum file size: 10 MB
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

export default function ImageUpload({
  selectedImage,
  imagePreviewUrl,
  onImageSelected,
  onImageRemoved,
  onTriggerAnalysis,
  onOpenLiveCamera,
  isLoading,
  apiError
}) {
  const [dragOver, setDragOver] = useState(false);
  const [validationError, setValidationError] = useState("");
  const fileInputRef = useRef(null);

  // 1. Validate file type and size
  const validateAndProcessFile = (file) => {
    setValidationError("");

    if (!file) return;

    // Check MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setValidationError("Invalid file format. Please upload a JPEG, PNG, or WEBP image.");
      return;
    }

    // Check File size (max 5MB)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setValidationError("File is too large. Maximum allowed image size is 10 MB.");
      return;
    }

    // Generate local preview URL using URL.createObjectURL
    const previewUrl = URL.createObjectURL(file);
    onImageSelected(file, previewUrl);
  };

  // 2. Handle standard file input change event
  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndProcessFile(file);
    }
    // Reset file input value so re-selecting same file triggers change
    e.target.value = "";
  };

  // 3. Handle drag and drop events
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndProcessFile(file);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-6 sm:p-8 space-y-6">
      
      {/* Component Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <span>Upload or Capture Clothing Image</span>
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Upload one clear photo showing the complete garment or a readable care label. The backend identifies the image type automatically.
        </p>
      </div>

      {/* Validation or API Error Alerts */}
      {(validationError || apiError) && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">{validationError ? "Validation Notice" : "API Message"}</p>
            <p className="text-xs text-red-700 mt-0.5">{validationError || apiError}</p>
          </div>
        </div>
      )}

      {/* Image Upload Zone (If no image selected yet) */}
      {!imagePreviewUrl ? (
        <div className="space-y-4">
          
          {/* Hidden HTML file inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileInputChange}
          />

          {/* Drag & Drop Surface */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
              dragOver
                ? "border-emerald-600 bg-emerald-50 scale-[1.01]"
                : "border-gray-300 hover:border-emerald-500 hover:bg-emerald-50/40"
            }`}
          >
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4">
              <UploadCloud className="w-8 h-8" />
            </div>

            <p className="text-base font-semibold text-gray-800">
              Drag and drop your clothing image here, or{" "}
              <span className="text-emerald-600 underline">browse files</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Supports JPEG, PNG, WEBP (Maximum size: 10 MB)
            </p>
          </div>

          {/* Action Row: Camera Button */}
          <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
            <button
              type="button"
              onClick={onOpenLiveCamera}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-sm border border-emerald-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Camera className="w-4 h-4 text-emerald-600" />
              <span>Use Device Camera</span>
            </button>
          </div>


        </div>
      ) : (
        /* Image preview area */
        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden border border-emerald-100 bg-gray-900/5 max-h-96 flex items-center justify-center group">
            <img
              src={imagePreviewUrl}
              alt="Selected clothing preview"
              className="max-h-96 w-full object-contain"
            />
            
            {/* Top Badge */}
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-800 flex items-center gap-1.5 shadow-sm">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span>Ready for AI Analysis</span>
            </div>

            {/* Remove / Replace Button */}
            <button
              type="button"
              onClick={onImageRemoved}
              disabled={isLoading}
              className="absolute top-3 right-3 bg-red-600/90 hover:bg-red-700 text-white p-2 rounded-lg shadow-sm transition-colors cursor-pointer"
              title="Remove image"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* File Meta Information */}
          <div className="flex flex-wrap items-center justify-between text-xs text-gray-500 px-1">
            <span>
              <strong>File:</strong> {selectedImage?.name || "Captured image"}
            </span>
            {selectedImage?.size && (
              <span>
                <strong>Size:</strong> {(selectedImage.size / 1024).toFixed(1)} KB
              </span>
            )}
          </div>

          {/* Action Row: Analyze Garment Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={onTriggerAnalysis}
              disabled={isLoading}
              className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold text-base shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2.5 transition-all cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing Textile & LCA Data...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Run Environmental Analysis</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onImageRemoved}
              disabled={isLoading}
              className="w-full sm:w-auto py-3.5 px-5 rounded-xl border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Choose Different Image
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
