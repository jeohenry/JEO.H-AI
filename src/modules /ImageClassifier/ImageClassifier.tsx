import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud } from "lucide-react";
import PageWrapper from "@/components/PageWrapper";
import { motion } from "framer-motion";
import { slideUp } from "@/config/animations";

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
      const response = await fetch("http://localhost:8000/vision/classify", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setResult(data);
    } catch (err) {
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
        <h2 className="text-2xl font-bold text-center text-indigo-700">🖼️ Image Classifier AI</h2>

        <Card className="shadow-lg">
          <CardContent className="p-4 space-y-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm"
            />

            {preview && (
              <div className="flex justify-center">
                <img
                  src={preview}
                  alt="Preview"
                  className="rounded-xl shadow-md w-full max-w-xs"
                />
              </div>
            )}

            <Button
              onClick={handleSubmit}
              disabled={loading || !selectedFile}
              className="w-full"
            >
              <UploadCloud className="mr-2 h-4 w-4" />
              {loading ? "Classifying..." : "Classify Image"}
            </Button>

            {result && (
              <div className="mt-4 bg-green-50 p-4 rounded-lg shadow-inner">
                <p className="text-green-700 font-semibold text-lg">
                  ✅ Prediction: <span className="font-bold">{result.label}</span>
                </p>
                <p className="text-green-600 text-sm">
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







