// src/components/LoadingSuspense.jsx
import React, { useEffect } from "react";
import { Suspense } from "react";
import { useLoading } from "@/context/LoadingContext";

const LoadingSuspense = ({ children }) => {
  const { startSuspense, stopSuspense } = useLoading();

  useEffect(() => {
    startSuspense();
    return () => stopSuspense();
  }, [startSuspense, stopSuspense]);

  return <Suspense fallback={<div />}>{children}</Suspense>;
};

export default LoadingSuspense;