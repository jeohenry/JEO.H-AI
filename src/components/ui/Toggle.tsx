//src/components/ui/Toggle.tsx

"use client";

import { Switch } from "@/components/ui/switch";

interface ToggleProps {
  checked: boolean;
  onChange: (event: { target: { checked: boolean } }) => void;
  id?: string;
  label?: string;
}

export const Toggle = ({ checked, onChange, id, label }: ToggleProps) => {
  // Adapter: convert onCheckedChange (boolean) → onChange (event-like)
  const handleChange = (value: boolean) => {
    onChange({ target: { checked: value } });
  };

  return (
    <div className="flex items-center space-x-2">
      <Switch id={id} checked={checked} onCheckedChange={handleChange} />
      {label && (
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
      )}
    </div>
  );
};
