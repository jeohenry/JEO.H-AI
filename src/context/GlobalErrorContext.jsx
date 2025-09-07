// src/context/GlobalErrorContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

const GlobalErrorContext = createContext({
  error: null,
  setError: () => {},
});

export const GlobalErrorProvider = ({ children }) => {
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleError = (event) => {
      console.error("🌍 Global error:", event.message, event.error);
      setError(event.error || new Error(event.message));
    };

    const handleRejection = (event) => {
      console.error("🌍 Unhandled Promise rejection:", event.reason);
      setError(event.reason instanceof Error ? event.reason : new Error(String(event.reason)));
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  return (
    <GlobalErrorContext.Provider value={{ error, setError }}>
      {children}
    </GlobalErrorContext.Provider>
  );
};

export const useGlobalError = () => useContext(GlobalErrorContext);