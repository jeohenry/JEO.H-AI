// src/components/ExportButtonGroup.tsx

import React, { useState } from "react";
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

// ✅ Import your pre-bundled font
import notoSans from "@/assets/fonts/NotoSans-Regular-normal.js";

interface ExportButtonGroupProps {
  voiceUrl?: string;
  lyrics?: string;
}

const ExportButtonGroup: React.FC<ExportButtonGroupProps> = ({ voiceUrl, lyrics }) => {
  const [font, setFont] = useState("NotoSans");
  const [fontSize, setFontSize] = useState(14);

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
    if (!lyrics) return;
    const doc = new jsPDF();

    // ✅ Register font
    doc.addFileToVFS("NotoSans-Regular.ttf", notoSans);
    doc.addFont("NotoSans-Regular.ttf", "NotoSans", "normal");
    doc.setFont(font);

    doc.setFontSize(18);
    doc.text("🌍 Live Translator Export", 20, 20);

    doc.setFontSize(12);
    doc.text("Translated Text:", 20, 40);

    doc.setFontSize(fontSize);
    doc.text(lyrics, 20, 55, { maxWidth: 170 });

    doc.save("translation.pdf");
  };

  return (
    <Card className="mt-6 shadow-md rounded-2xl">
      <CardHeader>
        <CardTitle>Export Options</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 mb-4">
          {/* Font Selector */}
          <Select value={font} onValueChange={setFont}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Font" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NotoSans">Noto Sans Regular</SelectItem>
              <SelectItem value="NotoSans-Bold">Noto Sans Bold</SelectItem>
              <SelectItem value="NotoSans-Italic">Noto Sans Italic</SelectItem>
              <SelectItem value="NotoSans-BoldItalic">Noto Sans BoldItalic</SelectItem>
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