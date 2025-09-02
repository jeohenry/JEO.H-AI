// src/context/LoadingContext.jsx
import React, { createContext, useContext, useState } from "react";
import Loading from "../components/Loading"; // make sure you have Loading.jsx

// Create context
const LoadingContext = createContext();

// Custom hook to access loading context
export const useLoading = () => useContext(LoadingContext);

export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);

  return (
    <LoadingContext.Provider value={{ loading, setLoading }}>
      {/* Show loading overlay if true */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <Loading />
        </div>
      )}
      {children}
    </LoadingContext.Provider>
  );
};