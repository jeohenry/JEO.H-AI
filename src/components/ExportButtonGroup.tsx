// src/components/ExportButtonGroup.tsx

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";

// shadcn/ui components
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ExportButtonGroupProps {
  voiceUrl?: string;
  lyrics?: string;
}

const ExportButtonGroup: React.FC<ExportButtonGroupProps> = ({ voiceUrl, lyrics }) => {
  const [fontStyle, setFontStyle] = useState<"normal" | "bold" | "italic" | "bolditalic">("normal");
  const [fontSize, setFontSize] = useState(14);

  const docRef = useRef<jsPDF | null>(null);

  // ✅ Load fonts dynamically from /public/fonts
  useEffect(() => {
    const loadFonts = async () => {
      const [regular, bold, italic, bolditalic] = await Promise.all([
        fetch("/fonts/NotoSans-Regular.js").then((res) => res.text()),
        fetch("/fonts/NotoSans-Bold.js").then((res) => res.text()),
        fetch("/fonts/NotoSans-Italic.js").then((res) => res.text()),
        fetch("/fonts/NotoSans-BoldItalic.js").then((res) => res.text()),
      ]);

      const doc = new jsPDF();

      doc.addFileToVFS("NotoSans-Regular.ttf", regular);
      doc.addFont("NotoSans-Regular.ttf", "NotoSans", "normal");

      doc.addFileToVFS("NotoSans-Bold.ttf", bold);
      doc.addFont("NotoSans-Bold.ttf", "NotoSans", "bold");

      doc.addFileToVFS("NotoSans-Italic.ttf", italic);
      doc.addFont("NotoSans-Italic.ttf", "NotoSans", "italic");

      doc.addFileToVFS("NotoSans-BoldItalic.ttf", bolditalic);
      doc.addFont("NotoSans-BoldItalic.ttf", "NotoSans", "bolditalic");

      docRef.current = doc;
    };

    loadFonts();
  }, []);

  const handleExportText = () => {
    if (!lyrics) return;
    const blob = new Blob([lyrics], { type: "text/plain;charset=utf-8" });
    saveAs(blob, "translation.txt");
  };

  const handleExportAudio = () => {
    if (!voiceUrl) return;
    saveAs(voiceUrl, "translation.mp3");
  };

  const handleExportPDF = () => {
    if (!lyrics || !docRef.current) return;

    const doc = docRef.current;

    // ✅ Reset document
    doc.deletePage(1);
    doc.addPage();
    doc.setPage(1);

    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    const lineHeight = fontSize * 1.2;
    let cursorY = 55;

    // ✅ Header
    doc.setFont("NotoSans", "bold");
    doc.setFontSize(18);
    doc.text("🌍 Live Translator Export", margin, 20);

    // ✅ Sub-header
    doc.setFont("NotoSans", "italic");
    doc.setFontSize(12);
    doc.text("Translated Text:", margin, 40);

    // ✅ Body text split into lines
    doc.setFont("NotoSans", fontStyle);
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(lyrics, pageWidth - margin * 2);

    lines.forEach((line) => {
      if (cursorY + lineHeight > pageHeight - 30) {
        doc.addPage();
        cursorY = margin;
      }
      doc.text(line, margin, cursorY);
      cursorY += lineHeight;
    });

    // ✅ Footer: add "Page X of Y" on each page
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFont("NotoSans", "italic");
      doc.setFontSize(10);

      doc.text(`Generated on ${new Date().toLocaleDateString()}`, margin, pageHeight - 20);
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 20, {
        align: "right",
      });
    }

    doc.save("translation.pdf");
  };

  return (
    <Card className="mt-6 shadow-md rounded-2xl">
      <CardHeader>
        <CardTitle>Export Options</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 mb-4">
          {/* Font Style Selector */}
          <Select value={fontStyle} onValueChange={(val) => setFontStyle(val as any)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Font Style" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Noto Sans Regular</SelectItem>
              <SelectItem value="bold">Noto Sans Bold</SelectItem>
              <SelectItem value="italic">Noto Sans Italic</SelectItem>
              <SelectItem value="bolditalic">Noto Sans BoldItalic</SelectItem>
            </SelectContent>
          </Select>

          {/* Font Size Selector */}
          <Select value={fontSize.toString()} onValueChange={(val) => setFontSize(Number(val))}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Font Size" />
            </SelectTrigger>
            <SelectContent>
              {[12, 14, 16, 18, 20, 24].map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}px
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Export Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleExportText} variant="outline" disabled={!lyrics}>
            <Download className="w-4 h-4 mr-2" /> Export Text
          </Button>
          <Button onClick={handleExportAudio} variant="outline" disabled={!voiceUrl}>
            <Download className="w-4 h-4 mr-2" /> Export Audio
          </Button>
          <Button onClick={handleExportPDF} variant="outline" disabled={!lyrics}>
            <FileText className="w-4 h-4 mr-2" /> Export PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExportButtonGroup;