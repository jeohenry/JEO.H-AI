// src/routes/RouteChangeHandler.jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLoading } from "@/context/LoadingContext";

/**
 * 🔹 Handles loading state whenever the route changes
 */
function RouteChangeHandler() {
  const { startLoading, stopLoading } = useLoading();
  const location = useLocation();

  useEffect(() => {
    let active = true;
    startLoading();

    // Simulate loading while the new route is resolving/rendering
    const timer = setTimeout(() => {
      if (active) stopLoading();
    }, 300); // keep short so UI feels snappy

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [location.pathname]); // only fire when path changes

  return null;
}

export default RouteChangeHandler;