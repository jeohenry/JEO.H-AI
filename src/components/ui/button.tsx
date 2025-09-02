// components/ui/Button.tsx
"use client";

import { Button as ShadcnButton } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  variant?: "default" | "outline" | "destructive" | "ghost" | "link"; // shadcn variants
  type?: "button" | "submit" | "reset";
}

export const Button = ({
  children,
  onClick,
  className,
  disabled = false,
  loading = false,
  icon = null,
  variant = "default",
  type = "button",
}: ButtonProps) => {
  return (
    <ShadcnButton
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      variant={variant}
      className={className}
    >
      {loading && <Loader2 className="animate-spin w-4 h-4" />}
      {icon && !loading && <span className="w-4 h-4">{icon}</span>}
      {children}
    </ShadcnButton>
  );
};
