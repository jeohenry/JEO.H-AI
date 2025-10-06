// src/modules/ContentCreator.jsx

import React, { useState } from "react";
import API from "@/api"; // ✅ Use your configured axios instance
import PageWrapper from "@/components/PageWrapper";
import { motion } from "framer-motion";
import { slideUp } from "@/config/animations";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Download } from "lucide-react";

const ContentCreator = () => {
  const [prompt, setPrompt] = useState("");
  const [contentType, setContentType] = useState("blog");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  /* ───────── 🧠 Generate Content ───────── */
  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);

    try {
      // ✅ Use the shared API instance for both requests
      const [defaultRes, templateRes] = await Promise.all([
        API.post("/content/create", {
          prompt,
          content_type: contentType,
        }),
        API.post("/generate-content", {
          topic: prompt,
          content_type: contentType,
          model: "auto",
        }),
      ]);

      const combined =
        `✨ Default Generator Output:\n\n${defaultRes.data.content || "No content"}\n\n` +
        `✨ Template Generator Output:\n\n${templateRes.data.result || "No content"}`;

      setResult(combined);
    } catch (err) {
      console.error("Error generating content:", err);
      setResult("❌ Error generating combined content.");
    } finally {
      setLoading(false);
    }
  };

  /* ───────── 💾 Export Functions ───────── */
  const handleExport = (format) => {
    if (!result) return;
    let blob;
    let fileName = `content_${contentType}.${format}`;

    if (format === "txt") {
      blob = new Blob([result], { type: "text/plain;charset=utf-8" });
    } else if (format === "docx") {
      blob = new Blob(
        [`Content Type: ${contentType}\n\n${result}`],
        {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        }
      );
    } else if (format === "pdf") {
      import("jspdf").then(({ default: jsPDF }) => {
        const doc = new jsPDF();
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        const margin = 10;
        const lineHeight = 7;
        let y = margin;

        const lines = doc.splitTextToSize(result, 180);
        lines.forEach((line) => {
          if (y > 280) {
            doc.addPage();
            y = margin;
          }
          doc.text(line, margin, y);
          y += lineHeight;
        });

        doc.save(fileName);
      });
      return;
    }

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  /* ───────── 💡 UI ───────── */
  return (
    <PageWrapper>
      <motion.div
        variants={slideUp}
        initial="initial"
        animate="animate"
        exit="exit"
        className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-10"
      >
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-6 text-indigo-700 dark:text-indigo-400">
          ✨ AI Content Creator
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-300 text-sm sm:text-base mb-8">
          Generate blogs, scripts, stories, ads, and more with AI.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Input Section */}
          <Card className="shadow-lg rounded-2xl border border-gray-200 dark:border-gray-700">
            <CardContent className="space-y-6 p-4 sm:p-6 lg:p-8">
              {/* Content Type Selector */}
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                  Content Type
                </label>
                <Select onValueChange={setContentType} defaultValue="blog">
                  <SelectTrigger className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md">
                    <SelectValue placeholder="Select content type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-md rounded-md">
                    <SelectItem value="blog">📝 Blog Post</SelectItem>
                    <SelectItem value="ad">📢 Advertisement</SelectItem>
                    <SelectItem value="story">📚 Short Story</SelectItem>
                    <SelectItem value="script">🎬 Script</SelectItem>
                    <SelectItem value="caption">📸 Caption</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Prompt Input */}
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                  Prompt / Idea
                </label>
                <Textarea
                  placeholder="Enter your idea or prompt here..."
                  rows={10}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full text-sm sm:text-base bg-white text-black placeholder-gray-500 
                             dark:bg-gray-900 dark:text-white dark:placeholder-gray-400 
                             border border-gray-300 dark:border-gray-700 rounded-md"
                />
              </div>

              {/* Action Button */}
              <div className="flex justify-end">
                <Button onClick={handleGenerate} disabled={loading || !prompt}>
                  {loading ? "Generating..." : "Generate Content"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Right: Result Section */}
          <Card className="shadow-lg rounded-2xl border border-gray-200 dark:border-gray-700">
            <CardContent className="space-y-6 p-4 sm:p-6 lg:p-8 h-full flex flex-col">
              <h4 className="font-semibold text-lg sm:text-xl text-green-700 dark:text-green-400">
                Generated Content:
              </h4>
              <div className="flex-1 overflow-y-auto p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                {result ? (
                  <pre className="whitespace-pre-wrap leading-relaxed text-gray-800 dark:text-gray-200 text-sm sm:text-base">
                    {result}
                  </pre>
                ) : (
                  <p className="text-gray-400 dark:text-gray-500 text-sm italic">
                    Your generated content will appear here...
                  </p>
                )}
              </div>

              {/* Export Buttons */}
              {result && (
                <div className="mt-4 flex flex-col sm:flex-row flex-wrap gap-3">
                  <Button variant="outline" onClick={() => handleExport("txt")} className="flex-1">
                    <Download className="w-4 h-4 mr-2" /> TXT
                  </Button>
                  <Button variant="outline" onClick={() => handleExport("docx")} className="flex-1">
                    <Download className="w-4 h-4 mr-2" /> DOCX
                  </Button>
                  <Button variant="outline" onClick={() => handleExport("pdf")} className="flex-1">
                    <Download className="w-4 h-4 mr-2" /> PDF
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </PageWrapper>
  );
};

export default ContentCreator;