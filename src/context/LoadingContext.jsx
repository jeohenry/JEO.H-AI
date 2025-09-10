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
  const showTimeRef = useRef(null); // track when loader became visible

  const MIN_VISIBLE_MS = 150; // Reduced for better UX

  const updateLoading = useCallback(() => {
    const active = requestCount.current > 0 || suspenseCount.current > 0;

    if (active) {
      // If turning ON, record start time
      if (!loading) {
        showTimeRef.current = Date.now();
        setLoading(true);
      }
    } else {
      // If turning OFF, enforce min visible time
      const elapsed = Date.now() - (showTimeRef.current || 0);
      if (elapsed >= MIN_VISIBLE_MS) {
        setLoading(false);
        showTimeRef.current = null;
      } else {
        const remaining = MIN_VISIBLE_MS - elapsed;
        setTimeout(() => {
          setLoading(false);
          showTimeRef.current = null;
        }, remaining);
      }
    }
  }, [loading]);

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
      {loading && <Loading />}
      {children}
    </LoadingContext.Provider>
  );
};
  