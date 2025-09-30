// src/modules/HealthAI.tsx

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, FileDown } from "lucide-react";
import PageWrapper from "../components/PageWrapper";
import { motion } from "framer-motion";
import jsPDF from "jspdf";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";
import API from "@/api"; // ✅ use centralized API

const HealthAI = () => {
  const [symptoms, setSymptoms] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [prescription, setPrescription] = useState("");
  const [healthAdvice, setHealthAdvice] = useState("");
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  /**
   * 🔹 Unified streaming handler (diagnosis + prescription + advice + analytics)
   */
  const handleUnifiedStream = async () => {
    if (!symptoms.trim()) return;
    setLoading(true);
    setDiagnosis("");
    setPrescription("");
    setHealthAdvice("");
    setAnalytics(null);

    try {
      // ✅ use API baseURL + token from @/api.jsx
      const url = `${API.defaults.baseURL}/health/stream`;

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: API.defaults.headers.common["Authorization"] || "",
        },
        body: JSON.stringify({ symptoms }),
      });

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      let diagnosisBuffer = "";
      let prescriptionBuffer = "";
      let adviceBuffer = "";
      let analyticsBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n\n");

        for (let line of lines) {
          if (!line.startsWith("data:")) continue;
          const payload = JSON.parse(line.replace("data: ", ""));

          if (payload.section === "diagnosis") {
            diagnosisBuffer += payload.content + " ";
            setDiagnosis(diagnosisBuffer);
          }
          if (payload.section === "prescription") {
            prescriptionBuffer += payload.content + " ";
            setPrescription(prescriptionBuffer);
          }
          if (payload.section === "advice") {
            adviceBuffer += payload.content + " ";
            setHealthAdvice(adviceBuffer);
          }
          if (payload.section === "analytics") {
            analyticsBuffer += payload.content + " ";
            try {
              setAnalytics(JSON.parse(analyticsBuffer));
            } catch {
              setAnalytics(analyticsBuffer);
            }
          }
        }
      }
    } catch (err) {
      console.error("❌ Streaming error:", err);
      setDiagnosis("❌ Error streaming results.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🔹 Export report as PDF
   */
  const handleExportPDF = () => {
    const doc = new jsPDF();
    const now = new Date().toLocaleString();

    doc.setFont("helvetica", "bold").setFontSize(20);
    doc.text("📊 AI Health Report", 20, 20);

    doc.setFont("helvetica", "normal").setFontSize(10);
    doc.text(`Date: ${now}`, 20, 30);
    doc.text("Symptoms:", 20, 38);
    doc.text(doc.splitTextToSize(symptoms || "N/A", 170), 20, 44);

    let y = 70;
    const addSection = (title: string, content: string) => {
      if (!content) return;
      doc.setFontSize(14).setFont("helvetica", "bold");
      doc.text(title, 20, y);
      y += 10;
      doc.setFontSize(12).setFont("helvetica", "normal");
      doc.text(doc.splitTextToSize(content, 170), 20, y);
      y += 20;
    };

    addSection("🩺 Diagnosis:", diagnosis);
    addSection("💊 Prescription:", prescription);
    addSection("💡 AI Health Advice:", healthAdvice);
    addSection(
      "📈 Analytics Summary:",
      typeof analytics === "string"
        ? analytics
        : JSON.stringify(analytics, null, 2)
    );

    doc.save("AI_Health_Report.pdf");
  };

  /**
   * 🔹 Export report as Word Docx
   */
  const handleExportDocx = async () => {
    const now = new Date().toLocaleString();
    const children: Paragraph[] = [
      new Paragraph({
        children: [new TextRun({ text: "📊 AI Health Report", bold: true, size: 32 })],
      }),
      new Paragraph(`Date: ${now}`),
      new Paragraph({ children: [new TextRun({ text: "Symptoms:", bold: true })] }),
      new Paragraph(symptoms || "N/A"),
    ];

    const addSection = (title: string, content: string) => {
      if (!content) return;
      children.push(
        new Paragraph({ children: [new TextRun({ text: title, bold: true, size: 28 })] }),
        new Paragraph(content)
      );
    };

    addSection("🩺 Diagnosis:", diagnosis);
    addSection("💊 Prescription:", prescription);
    addSection("💡 AI Health Advice:", healthAdvice);
    addSection(
      "📈 Analytics Summary:",
      typeof analytics === "string"
        ? analytics
        : JSON.stringify(analytics, null, 2)
    );

    const doc = new Document({ sections: [{ children }] });
    const blob = await Packer.toBlob(doc);
    saveAs(blob, "AI_Health_Report.docx");
  };

  return (
    <PageWrapper>
      <motion.div
        className="p-4 sm:p-6 w-full max-w-3xl mx-auto space-y-6"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -40 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* Input Form */}
        <Card className="shadow-lg">
          <CardContent className="space-y-5 p-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-blue-700">
              🩺 AI Health Assistant
            </h2>

            <Textarea
              placeholder="📝 Describe your symptoms in detail..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              className="min-h-[120px] w-full bg-white text-black placeholder-gray-500
                         dark:bg-gray-900 dark:text-white dark:placeholder-gray-400"
            />

            <div className="flex justify-center pt-2">
              <Button
                onClick={handleUnifiedStream}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <Loader2 className="animate-spin w-4 h-4" />
                ) : (
                  "🚀 Get Full AI Health Report"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Report Section */}
        {(diagnosis || prescription || healthAdvice || analytics) && (
          <Card className="bg-gradient-to-br from-green-50 via-yellow-50 to-blue-50 shadow-lg border">
            <CardContent className="p-5 space-y-4">
              <h3 className="text-2xl font-bold text-center text-indigo-700">
                📊 AI Health Report
              </h3>

              {diagnosis && (
                <div>
                  <h4 className="text-lg font-semibold text-green-700">🩺 Diagnosis</h4>
                  <p className="whitespace-pre-wrap">{diagnosis}</p>
                </div>
              )}

              {prescription && (
                <div>
                  <h4 className="text-lg font-semibold text-blue-700">💊 Prescription</h4>
                  <p className="whitespace-pre-wrap">{prescription}</p>
                </div>
              )}

              {healthAdvice && (
                <div>
                  <h4 className="text-lg font-semibold text-yellow-700">💡 AI Health Advice</h4>
                  <p className="whitespace-pre-wrap">{healthAdvice}</p>
                </div>
              )}

              {analytics && (
                <div>
                  <h4 className="text-lg font-semibold text-indigo-700">
                    📈 Analytics Summary
                  </h4>
                  <pre className="whitespace-pre-wrap text-sm">
                    {typeof analytics === "string"
                      ? analytics
                      : JSON.stringify(analytics, null, 2)}
                  </pre>
                </div>
              )}

              {/* Export Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  onClick={handleExportPDF}
                  className="flex-1 bg-red-500 hover:bg-red-600"
                >
                  <FileDown className="w-4 h-4 mr-2" /> Export PDF
                </Button>
                <Button
                  onClick={handleExportDocx}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <FileDown className="w-4 h-4 mr-2" /> Export Word
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </PageWrapper>
  );
};

export default HealthAI;