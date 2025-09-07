// src/components/LoadingSuspense.jsx
import React, { useEffect } from "react";
import { Suspense } from "react";
import { useLoading } from "@/context/LoadingContext";
import { Loader2 } from "lucide-react";

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen w-screen">
    <Loader2 className="h-10 w-10 animate-spin text-primary" />
  </div>
);

const LoadingSuspense = ({ children }) => {
  const { startSuspense, stopSuspense } = useLoading();

  useEffect(() => {
    startSuspense();
    return () => stopSuspense();
  }, [startSuspense, stopSuspense]);

  return <Suspense fallback={<LoadingFallback />}>{children}</Suspense>;
};

export default LoadingSuspense;