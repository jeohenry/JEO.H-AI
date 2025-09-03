// components/ui/Textarea.tsx
"use client";

import { Textarea as ShadcnTextarea } from "@/components/ui/textarea";

interface TextareaProps {
  name?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}

export const Textarea = ({
  name,
  value,
  onChange,
  placeholder,
  rows = 4,
  className,
}: TextareaProps) => {
  return (
    <ShadcnTextarea
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className={className}
    />
  );
};
