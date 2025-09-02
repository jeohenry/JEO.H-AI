// components/ui/Card.tsx
"use client";

import {
  Card as ShadcnCard,
  CardContent as ShadcnCardContent,
} from "@/components/ui/card";
import { ReactNode } from "react";

interface CardProps {
  className?: string;
  children: ReactNode;
}

export const Card = ({ className, children }: CardProps) => {
  return <ShadcnCard className={className}>{children}</ShadcnCard>;
};

export const CardContent = ({ className, children }: CardProps) => {
  return <ShadcnCardContent className={className}>{children}</ShadcnCardContent>;
};
