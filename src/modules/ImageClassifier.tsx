// src/modules/ImageClassifier.tsx

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud } from "lucide-react";
import PageWrapper from "@/components/PageWrapper";
import { motion } from "framer-motion";
import { slideUp } from "@/config/animations";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000/api";

const ImageClassifier = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<{ label: string; confidence: number } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch(`${API_BASE}/vision/classify`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setResult(data.result);
    } catch (err) {
      console.error("Classification error:", err);
      setResult({ label: "Error", confidence: 0 });
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
        className="w-full max-w-3xl mx-auto p-6 space-y-6"
      >
        <h2 className="text-2xl font-bold text-center text-indigo-700">
          🖼️ Image Classifier AI
        </h2>

        <Card className="shadow-lg bg-white dark:bg-gray-900">
          <CardContent className="p-4 space-y-6">
            {/* File Upload */}
            <label className="w-full flex flex-col items-center justify-center px-4 py-6 bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition">
              <UploadCloud className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mb-2" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Click or drag image to upload
              </span>
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>

            {/* Image Preview */}
            {preview && (
              <div className="flex justify-center">
                <img
                  src={preview}
                  alt="Preview"
                  className="rounded-xl shadow-md w-full max-w-xs sm:max-w-md lg:max-w-lg h-auto"
                />
              </div>
            )}

            {/* Action Button */}
            <Button
              onClick={handleSubmit}
              disabled={loading || !selectedFile}
              className="w-full"
            >
              <UploadCloud className="mr-2 h-4 w-4" />
              {loading ? "Classifying..." : "Classify Image"}
            </Button>

            {/* Results */}
            {result && (
              <div className="mt-4 bg-green-50 dark:bg-green-900 p-4 rounded-lg shadow-inner">
                <p className="text-green-700 dark:text-green-300 font-semibold text-lg">
                  ✅ Prediction: <span className="font-bold">{result.label}</span>
                </p>
                <p className="text-green-600 dark:text-green-400 text-sm">
                  Confidence: {(result.confidence * 100).toFixed(2)}%
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </PageWrapper>
  );
};

export default ImageClassifier;