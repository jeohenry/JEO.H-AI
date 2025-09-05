// src/components/LoadingSuspense.jsx
import React, { useEffect } from "react";
import { Suspense } from "react";
import { useLoading } from "@/context/LoadingContext";
import Loading from "@/components/Loading";

const LoadingSuspense = ({ children }) => {
  const { startLoading, stopLoading } = useLoading();

  useEffect(() => {
    startLoading(); // show loader when Suspense mounts
    return () => stopLoading(); // hide loader when ready
  }, [startLoading, stopLoading]);

  return <Suspense fallback={<div />}>{children}</Suspense>;
};

export default LoadingSuspense;