// src/components/CameraModal.jsx
// Modal for capturing clothing images directly from device webcam or phone camera

import React, { useState, useEffect, useRef } from "react";
import { Camera, X, RefreshCw, Check, AlertCircle } from "lucide-react";

export default function CameraModal({ isOpen, onClose, onPhotoCaptured }) {
  const [stream, setStream] = useState(null);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState(null);
  const [capturedFile, setCapturedFile] = useState(null);
  const [cameraError, setCameraError] = useState(() => {
    if (typeof navigator !== "undefined" && (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia)) {
      return "Your browser does not support direct camera capture. Please use file upload.";
    }
    return "";
  });
  const videoRef = useRef(null);

  // 1. Initialize device camera when component mounts
  useEffect(() => {
    let isMounted = true;
    let activeStream = null;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return;
    }

    // Request camera access (prefers environment/back camera on mobile)
    navigator.mediaDevices
      .getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })
      .then((mediaStream) => {
        // If modal was closed/unmounted while getUserMedia was resolving,
        // immediately stop all tracks to avoid leaving hardware camera running!
        if (!isMounted) {
          mediaStream.getTracks().forEach((track) => track.stop());
          return;
        }

        activeStream = mediaStream;
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Camera access error:", err);
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setCameraError("Camera permission was denied. Please allow camera permissions in your browser.");
        } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
          setCameraError("No camera device was detected on your system.");
        } else {
          setCameraError(`Camera error: ${err.message || "Could not start camera."}`);
        }
      });

    // Cleanup: Stop all camera tracks when component unmounts
    return () => {
      isMounted = false;
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Make sure videoRef gets attached when stream updates
  useEffect(() => {
    if (videoRef.current && stream && !capturedPhotoUrl) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, capturedPhotoUrl]);

  // Helper to safely stop hardware camera streams
  const stopCameraHardware = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const streamFromVideo = videoRef.current.srcObject;
      if (streamFromVideo && streamFromVideo.getTracks) {
        streamFromVideo.getTracks().forEach((track) => track.stop());
      }
      videoRef.current.srcObject = null;
    }
  };

  // 2. Capture snapshot from current video frame using HTML5 Canvas
  const handleSnapPhoto = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to Blob & create a File object
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const photoFile = new File([blob], `garment-camera-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        const previewUrl = URL.createObjectURL(blob);

        setCapturedFile(photoFile);
        setCapturedPhotoUrl(previewUrl);
      },
      "image/jpeg",
      0.9
    );
  };

  // 3. Retake photo
  const handleRetake = () => {
    if (capturedPhotoUrl) {
      URL.revokeObjectURL(capturedPhotoUrl);
    }
    setCapturedPhotoUrl(null);
    setCapturedFile(null);
  };

  // 4. Confirm and send captured photo back to parent
  const handleConfirmPhoto = () => {
    if (capturedFile && capturedPhotoUrl) {
      // Transfer URL ownership to parent component; DO NOT revoke here!
      onPhotoCaptured(capturedFile, capturedPhotoUrl);
      stopCameraHardware();
      setCapturedPhotoUrl(null);
      setCapturedFile(null);
      onClose();
    }
  };

  // 5. Cancel or close modal without using the photo
  const handleClose = () => {
    stopCameraHardware();
    // Only revoke if user canceled without confirming
    if (capturedPhotoUrl) {
      URL.revokeObjectURL(capturedPhotoUrl);
      setCapturedPhotoUrl(null);
    }
    setCapturedFile(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 flex flex-col">
        
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-emerald-50/50">
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-base">
            <Camera className="w-5 h-5 text-emerald-600" />
            <span>Capture Garment or Care Label</span>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Camera Viewport */}
        <div className="p-5 flex flex-col items-center">
          
          {cameraError ? (
            /* Error State (Permission Denied, No Camera) */
            <div className="w-full py-10 px-6 rounded-xl bg-red-50 border border-red-200 text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
              <p className="text-sm font-semibold text-red-800">{cameraError}</p>
              <p className="text-xs text-red-600">
                You can close this modal and use the <strong>Browse Image File</strong> button instead.
              </p>
            </div>
          ) : capturedPhotoUrl ? (
            /* Preview of captured photo */
            <div className="w-full flex flex-col items-center space-y-3">
              <div className="relative rounded-xl overflow-hidden bg-black max-h-80 w-full flex items-center justify-center border">
                <img
                  src={capturedPhotoUrl}
                  alt="Captured garment"
                  className="w-full max-h-80 object-contain"
                />
              </div>
              <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Photo Captured Successfully!
              </span>
            </div>
          ) : (
            /* Live Camera Stream */
            <div className="w-full relative rounded-xl overflow-hidden bg-black min-h-[260px] flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover max-h-80"
              />
              {/* Aiming Reticle Overlay */}
              <div className="absolute inset-6 border-2 border-dashed border-white/60 rounded-xl pointer-events-none flex items-center justify-center">
                <span className="text-white/80 text-[11px] bg-black/40 px-2 py-0.5 rounded backdrop-blur-xs">
                  Center garment or care label here
                </span>
              </div>
            </div>
          )}

          {/* Modal Footer Controls */}
          <div className="mt-5 w-full flex items-center justify-between gap-3 pt-2">
            {capturedPhotoUrl ? (
              <>
                <button
                  type="button"
                  onClick={handleRetake}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Retake</span>
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPhoto}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Use This Photo</span>
                </button>
              </>
            ) : !cameraError ? (
              <>
                <button
                  type="button"
                  onClick={handleClose}
                  className="py-2.5 px-4 rounded-xl border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSnapPhoto}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>Snap Photo</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleClose}
                className="w-full py-2.5 px-4 rounded-xl bg-gray-800 text-white font-semibold text-sm hover:bg-gray-900 cursor-pointer"
              >
                Close
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
