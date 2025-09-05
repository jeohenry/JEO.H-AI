// src/context/LoadingContext.jsx
import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import axios from "axios";
import Loading from "../components/Loading";

const LoadingContext = createContext();

export const useLoading = () => useContext(LoadingContext);

export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [requestCount, setRequestCount] = useState(0);
  const [suspenseCount, setSuspenseCount] = useState(0);

  // Start/stop for API
  const startLoading = useCallback(() => {
    setRequestCount((prev) => prev + 1);
    setLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setRequestCount((prev) => {
      const newCount = prev - 1;
      if (newCount <= 0 && suspenseCount === 0) {
        setLoading(false);
        return 0;
      }
      return newCount;
    });
  }, [suspenseCount]);

  // Start/stop for Suspense
  const startSuspense = useCallback(() => {
    setSuspenseCount((prev) => prev + 1);
    setLoading(true);
  }, []);

  const stopSuspense = useCallback(() => {
    setSuspenseCount((prev) => {
      const newCount = prev - 1;
      if (newCount <= 0 && requestCount === 0) {
        setLoading(false);
        return 0;
      }
      return newCount;
    });
  }, [requestCount]);

  // withLoading for manual promises
  const withLoading = useCallback(
    async (promise) => {
      try {
        startLoading();
        return await promise;
      } finally {
        stopLoading();
      }
    },
    [startLoading, stopLoading]
  );

  // Axios interceptors
  useEffect(() => {
    const reqInterceptor = axios.interceptors.request.use(
      (config) => {
        if (!config.skipLoading) startLoading();
        return config;
      },
      (error) => {
        stopLoading();
        return Promise.reject(error);
      }
    );

    const resInterceptor = axios.interceptors.response.use(
      (res) => {
        if (!res.config.skipLoading) stopLoading();
        return res;
      },
      (error) => {
        if (error.config && !error.config.skipLoading) stopLoading();
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(reqInterceptor);
      axios.interceptors.response.eject(resInterceptor);
    };
  }, [startLoading, stopLoading]);

  return (
    <LoadingContext.Provider
      value={{
        loading,
        startLoading,
        stopLoading,
        startSuspense,
        stopSuspense,
        withLoading,
      }}
    >
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <Loading message="Please wait..." />
        </div>
      )}
      {children}
    </LoadingContext.Provider>
  );
};