// src/context/LoadingContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import axios from "axios";
import Loading from "../components/Loading";

const LoadingContext = createContext();
export const useLoading = () => useContext(LoadingContext);

export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const requestCount = useRef(0);
  const suspenseCount = useRef(0);

  const updateLoading = useCallback(() => {
    setLoading(requestCount.current > 0 || suspenseCount.current > 0);
  }, []);

  // --- API loading ---
  const startLoading = useCallback(() => {
    requestCount.current += 1;
    updateLoading();
  }, [updateLoading]);

  const stopLoading = useCallback(() => {
    requestCount.current = Math.max(0, requestCount.current - 1);
    updateLoading();
  }, [updateLoading]);

  // --- Suspense loading ---
  const startSuspense = useCallback(() => {
    suspenseCount.current += 1;
    updateLoading();
  }, [updateLoading]);

  const stopSuspense = useCallback(() => {
    suspenseCount.current = Math.max(0, suspenseCount.current - 1);
    updateLoading();
  }, [updateLoading]);

  // --- Manual wrapper for promises ---
  const withLoading = useCallback(
    async (promise) => {
      startLoading();
      try {
        return await promise;
      } finally {
        stopLoading();
      }
    },
    [startLoading, stopLoading]
  );

  // --- Axios interceptors ---
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