// src/components/music/ExportButtonGroup.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText, FileAudio2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type Props = {
  audioUrl: string;
  textContent: string;
  filenamePrefix?: string;
};

const ExportButtonGroup: React.FC<Props> = ({ audioUrl, textContent, filenamePrefix = "music_output" }) => {
  const handleDownloadText = () => {
    const blob = new Blob([textContent], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filenamePrefix}.txt`;
    link.click();
  };

  const handleDownloadAudio = () => {
    const link = document.createElement("a");
    link.href = audioUrl;
    link.download = `${filenamePrefix}.mp3`;
    link.click();
  };

  return (
    <TooltipProvider>
      <div className="flex gap-3 mt-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" onClick={handleDownloadAudio}>
              <Download className="mr-2" />
              MP3
            </Button>
          </TooltipTrigger>
          <TooltipContent>Download Audio</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" onClick={handleDownloadText}>
              <FileText className="mr-2" />
              Lyrics
            </Button>
          </TooltipTrigger>
          <TooltipContent>Export Lyrics</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};

export default ExportButtonGroup;