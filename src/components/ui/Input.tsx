// components/ui/Input.tsx
"use client";

import { Input as ShadcnInput } from "@/components/ui/input";

interface InputProps {
  name?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  className?: string;
}

export const Input = ({
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  className,
}: InputProps) => {
  return (
    <ShadcnInput
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
    />
  );
};
