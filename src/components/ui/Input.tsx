// src/components/ui/Input.tsx
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface InputProps {
  name?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: string
  placeholder?: string
  className?: string
}

// Inline ShadCN Input
const BaseInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm " +
            "ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium " +
            "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 " +
            "focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
BaseInput.displayName = "Input"

// Your wrapper
export const Input = ({
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  className,
}: InputProps) => {
  return (
    <BaseInput
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
    />
  )
}