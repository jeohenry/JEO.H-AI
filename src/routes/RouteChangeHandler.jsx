// src/routes/RouteChangeHandler.jsx
import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";
import { useLoading } from "@/context/LoadingContext";

/**
 * 🔹 Handles loading state whenever route changes
 */
function RouteChangeHandler() {
  const { setLoading } = useLoading();
  const location = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, [location, navigationType, setLoading]);

  return null;
}

export default RouteChangeHandler;