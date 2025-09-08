// src/routes/RouteChangeHandler.jsx
import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";
import { useLoading } from "@/context/LoadingContext";

/**
 * 🔹 Handles loading state whenever route changes
 */
function RouteChangeHandler() {
  const { startLoading, stopLoading } = useLoading();
  const location = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    startLoading();
    const timer = setTimeout(() => stopLoading(), 500); // simulate load complete
    return () => clearTimeout(timer);
  }, [location, navigationType, startLoading, stopLoading]);

  return null;
}

export default RouteChangeHandler;