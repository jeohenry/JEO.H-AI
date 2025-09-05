// src/components/ui/Toggle.tsx
"use client"

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"
import { cn } from "@/lib/utils"

interface ToggleProps {
  checked: boolean
  onChange: (event: { target: { checked: boolean } }) => void
  id?: string
  label?: string
}

// Inline Switch component
const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    ref={ref}
    className={cn(
      "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors " +
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 " +
        "disabled:cursor-not-allowed disabled:opacity-50 " +
        "data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
      className
    )}
    {...props}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform " +
          "data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

// Toggle wrapper using Switch
export const Toggle = ({ checked, onChange, id, label }: ToggleProps) => {
  // Adapter: convert onCheckedChange (boolean) → onChange (event-like)
  const handleChange = (value: boolean) => {
    onChange({ target: { checked: value } })
  }

  return (
    <div className="flex items-center space-x-2">
      <Switch id={id} checked={checked} onCheckedChange={handleChange} />
      {label && (
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
      )}
    </div>
  )
}