// src/modules/FaceDetection.tsx

import React, { useState, DragEvent } from "react";
import { API } from "@/api"; // ✅ Unified to use named API import
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, ImageIcon } from "lucide-react";
import PageWrapper from "@/components/PageWrapper";
import { motion } from "framer-motion";
import { slideUp } from "@/config/animations";

// ✅ Use environment variable or fallback
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

const FaceDetection = () => {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // --- Handle selected file
  const handleFile = (file: File) => {
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
  };

  // --- Handle manual file input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  // --- Handle drag events
  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // --- Handle drop event
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // --- Face detection API call
  const detectFace = async () => {
    if (!image) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("file", image);

    try {
      const res = await API.post(`${API_BASE}/face/detect`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data);
    } catch (err) {
      console.error("Face detection error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <motion.div
        variants={slideUp}
        initial="initial"
        animate="animate"
        exit="exit"
        className="max-w-3xl mx-auto space-y-6 p-6"
      >
        <h2 className="text-2xl font-bold text-indigo-700 dark:text-indigo-400 text-center">
          🧠 Face Detection AI
        </h2>

        {/* --- File Upload & Drag-and-Drop Area --- */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer transition ${
            dragActive
              ? "border-indigo-500 bg-indigo-50 dark:bg-gray-800"
              : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
          }`}
        >
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              className="w-full max-w-xs sm:max-w-md lg:max-w-lg h-auto rounded-xl shadow-lg"
            />
          ) : (
            <div className="flex flex-col items-center text-gray-500 dark:text-gray-400">
              <ImageIcon className="w-12 h-12 mb-2" />
              <p className="text-sm">
                Drag & drop an image here, or click below to select
              </p>
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="fileInput"
          />
          <label
            htmlFor="fileInput"
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition text-sm"
          >
            <Upload className="w-4 h-4 inline mr-1" /> Choose File
          </label>
        </div>

        {/* --- Detect Button --- */}
        <div className="flex justify-center">
          <Button
            onClick={detectFace}
            disabled={loading || !image}
            className="w-full sm:w-auto px-6 py-2"
          >
            {loading && <Loader2 className="animate-spin mr-2" />}
            {loading ? "Processing..." : "Detect Face"}
          </Button>
        </div>

        {/* --- Results --- */}
        {result && (
          <Card className="shadow-md bg-white dark:bg-gray-900">
            <CardContent className="p-4 space-y-4">
              <h3 className="text-xl font-semibold text-green-700 dark:text-green-400">
                🎯 Detected Faces:
              </h3>

              {Array.isArray(result.faces) && result.faces.length > 0 ? (
                result.faces.map((face: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 bg-gray-100 dark:bg-gray-800 rounded-xl border dark:border-gray-700 text-black dark:text-white"
                  >
                    {face.age && (
                      <p>
                        <strong>Age:</strong> {face.age}
                      </p>
                    )}
                    {face.gender && (
                      <p>
                        <strong>Gender:</strong> {face.gender}
                      </p>
                    )}
                    {face.emotion && (
                      <p>
                        <strong>Emotion:</strong> {face.emotion}
                      </p>
                    )}
                    {face.box && (
                      <p>
                        <strong>Box:</strong> {JSON.stringify(face.box)}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-red-500 dark:text-red-400">
                  No detailed face attributes available, but boxes were detected.
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </motion.div>
    </PageWrapper>
  );
};

export default FaceDetection;