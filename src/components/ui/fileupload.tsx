// src/components/ui/FileUpload.tsx
"use client";

import { useState, DragEvent } from "react";
import { UploadCloud } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onChange?: (files: FileList) => void;
  accept?: string;
  className?: string;
  message?: string;
}

export const FileUpload = ({
  onChange,
  accept = "*",
  className,
  message = "Click to upload or drag here",
}: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onChange?.(e.dataTransfer.files);
    }
  };

  return (
    <Label
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all",
        isDragging
          ? "bg-muted border-primary/50 text-primary"
          : "bg-muted/30 hover:bg-muted text-muted-foreground",
        className
      )}
    >
      <UploadCloud className="w-8 h-8 mb-2" />
      <span className="text-sm font-medium">{message}</span>
      <Input
        type="file"
        accept={accept}
        onChange={(e) => e.target.files && onChange?.(e.target.files)}
        className="hidden"
      />
    </Label>
  );
};
