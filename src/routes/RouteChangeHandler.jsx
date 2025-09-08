// src/routes/RouteChangeHandler.jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLoading } from "@/context/LoadingContext";

/**
 * 🔹 Handles loading state whenever the route changes
 * Syncs with Axios requests + React rendering
 */
function RouteChangeHandler() {
  const { startLoading, stopLoading } = useLoading();
  const location = useLocation();

  useEffect(() => {
    // Start loader on route change
    startLoading();

    // Let React finish rendering, then stop loader
    const raf = requestAnimationFrame(() => {
      stopLoading();
    });

    return () => cancelAnimationFrame(raf);
  }, [location.pathname, startLoading, stopLoading]);

  return null;
}

export default RouteChangeHandler;