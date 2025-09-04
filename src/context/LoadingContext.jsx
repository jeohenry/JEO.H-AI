// src/context/LoadingContext.jsx

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import axios from "axios";
import Loading from "../components/Loading";

// Create context
const LoadingContext = createContext();

// Custom hook to access loading context
export const useLoading = () => useContext(LoadingContext);

export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [requestCount, setRequestCount] = useState(0); // track concurrent requests

  // Start loading
  const startLoading = useCallback(() => {
    setRequestCount((prev) => prev + 1);
    setLoading(true);
  }, []);

  // Stop loading
  const stopLoading = useCallback(() => {
    setRequestCount((prev) => {
      const newCount = prev - 1;
      if (newCount <= 0) {
        setLoading(false);
        return 0;
      }
      return newCount;
    });
  }, []);

  // Wrap promise with loading (manual usage if needed)
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

  // Attach Axios interceptors
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        if (!config.skipLoading) {
          startLoading();
        }
        return config;
      },
      (error) => {
        stopLoading();
        return Promise.reject(error);
      }
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response) => {
        if (!response.config.skipLoading) {
          stopLoading();
        }
        return response;
      },
      (error) => {
        if (error.config && !error.config.skipLoading) {
          stopLoading();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [startLoading, stopLoading]);

  return (
    <LoadingContext.Provider
      value={{ loading, setLoading, startLoading, stopLoading, withLoading }}
    >
      {/* Overlay */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <Loading message="Please wait..." />
        </div>
      )}
      {children}
    </LoadingContext.Provider>
  );
};