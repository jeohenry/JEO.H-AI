// src/modules/ContentCreator.jsx

import React, { useState } from 'react';
import axios from 'axios';
import PageWrapper from '@/components/PageWrapper';
import { motion } from 'framer-motion';
import { slideUp } from '@/config/animations';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select';
import { Download } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

const ContentCreator = () => {
  const [prompt, setPrompt] = useState('');
  const [contentType, setContentType] = useState('blog');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/content/create`, {
        prompt,
        content_type: contentType,
      });
      setResult(response.data.content);
    } catch (err) {
      setResult('❌ Error generating content.');
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Export Handlers
  const handleExport = (format) => {
    if (!result) return;
    let blob;
    let fileName = `content_${contentType}.${format}`;

    if (format === "txt") {
      blob = new Blob([result], { type: "text/plain;charset=utf-8" });
    } else if (format === "docx") {
      blob = new Blob(
        [
          `Content Type: ${contentType}\n\n${result}`
        ],
        { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }
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
      return; // exit since PDF handled separately
    }

    // Trigger download for txt/docx
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <PageWrapper>
      <motion.div
        variants={slideUp}
        initial="initial"
        animate="animate"
        exit="exit"
        className="max-w-3xl mx-auto p-6 space-y-6"
      >
        <Card className="shadow-md">
          <CardContent className="space-y-4">
            <h2 className="text-2xl font-bold text-center text-indigo-700 dark:text-indigo-400">
              ✨ AI Content Creator
            </h2>

            {/* Content Type Selector */}
            <Select onValueChange={setContentType} defaultValue="blog">
              <SelectTrigger>
                <SelectValue placeholder="Select content type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="blog">📝 Blog Post</SelectItem>
                <SelectItem value="ad">📢 Advertisement</SelectItem>
                <SelectItem value="story">📚 Short Story</SelectItem>
                <SelectItem value="script">🎬 Script</SelectItem>
                <SelectItem value="caption">📸 Caption</SelectItem>
              </SelectContent>
            </Select>

            {/* Input */}
            <Textarea
              placeholder="Enter your idea or prompt here..."
              rows={5}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full bg-white text-black placeholder-gray-500 dark:bg-gray-900 dark:text-white dark:placeholder-gray-400"
            />

            {/* Generate Button */}
            <div className="flex justify-end">
              <Button onClick={handleGenerate} disabled={loading || !prompt}>
                {loading ? 'Generating...' : 'Generate Content'}
              </Button>
            </div>

            {/* Output */}
            {result && (
              <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <h4 className="font-semibold mb-2 text-green-700 dark:text-green-400">
                  Generated Content:
                </h4>
                <p className="whitespace-pre-wrap">{result}</p>

                {/* Export Options */}
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" onClick={() => handleExport("txt")}>
                    <Download className="w-4 h-4 mr-2" /> TXT
                  </Button>
                  <Button variant="outline" onClick={() => handleExport("docx")}>
                    <Download className="w-4 h-4 mr-2" /> DOCX
                  </Button>
                  <Button variant="outline" onClick={() => handleExport("pdf")}>
                    <Download className="w-4 h-4 mr-2" /> PDF
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </PageWrapper>
  );
};

export default ContentCreator;