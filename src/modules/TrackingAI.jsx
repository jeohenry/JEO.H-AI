// src/modules/TrackingAI.jsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, LocateFixed, FileDown, FileText } from "lucide-react";
import PageWrapper from "../components/PageWrapper";
import { motion } from "framer-motion";
import { slideUp } from "../config/animations";
import { trackTarget, exportTrackingReport } from "@/api";  // ✅ use centralized API

const TrackingAI = () => {
  const [target, setTarget] = useState("");
  const [status, setStatus] = useState("");
  const [storageUrl, setStorageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTrack = async () => {
    if (!target.trim()) return;
    setLoading(true);
    setStatus("");
    setStorageUrl("");
    try {
      const data = await trackTarget(target);
      setStatus(data.status);
      setStorageUrl(data.storage_url);
    } catch (err) {
      console.error(err);
      setStatus("❌ Error tracking the target.");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      const blobData = await exportTrackingReport(target, status, format);

      const blob = new Blob([blobData], {
        type:
          format === "pdf"
            ? "application/pdf"
            : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `tracking_report.${format}`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(`Export ${format} failed:`, err);
    }
  };

  return (
    <PageWrapper>
      <motion.div
        className="p-4 sm:p-6 w-full max-w-2xl mx-auto space-y-6"
        variants={slideUp}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-blue-700">
          📍 Tracking AI
        </h2>

        <Card className="shadow-lg">
          <CardContent className="space-y-4 p-6">
            <Input
              placeholder="Track anything instantly (e.g., John Doe, Shipment A123)"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="w-full bg-white text-black placeholder-gray-500 
                         dark:bg-gray-900 dark:text-white dark:placeholder-gray-400"
            />
            <Button
              onClick={handleTrack}
              disabled={loading}
              className="w-full flex items-center justify-center"
            >
              {loading ? (
                <Loader2 className="animate-spin w-4 h-4" />
              ) : (
                <>
                  <LocateFixed className="mr-2 w-4 h-4" /> Track
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {status && (
          <Card className="bg-green-50 dark:bg-green-900 shadow-md border-green-200 dark:border-green-700">
            <CardContent className="p-5 space-y-4">
              <p className="text-lg">
                <strong>Status:</strong> {status}
              </p>

              {/* Export Options */}
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={() => handleExport("pdf")}
                  className="flex items-center justify-center w-full"
                >
                  <FileDown className="mr-2 w-4 h-4" /> Export PDF
                </Button>
                <Button
                  onClick={() => handleExport("docx")}
                  className="flex items-center justify-center w-full"
                >
                  <FileText className="mr-2 w-4 h-4" /> Export DOCX
                </Button>
              </div>

              {storageUrl && (
                <p className="text-sm text-gray-500 dark:text-gray-300">
                  ☁️ Stored securely:{" "}
                  <a
                    href={storageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    View JSON
                  </a>
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </motion.div>
    </PageWrapper>
  );
};

export default TrackingAI;