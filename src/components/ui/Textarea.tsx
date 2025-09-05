// src/components/ui/Textarea.tsx
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface TextareaProps {
  name?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  placeholder?: string
  rows?: number
  className?: string
}

// Inline ShadCN Textarea
const BaseTextarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm " +
          "ring-offset-background placeholder:text-muted-foreground " +
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 " +
          "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
BaseTextarea.displayName = "Textarea"

// Wrapper
export const Textarea = ({
  name,
  value,
  onChange,
  placeholder,
  rows = 4,
  className,
}: TextareaProps) => {
  return (
    <BaseTextarea
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className={className}
    />
  )
}