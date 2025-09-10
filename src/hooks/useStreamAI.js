// src/hooks/useStreamAI.js
import { useState, useRef, useCallback } from "react";

// Base URL from env or fallback to localhost
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";
const DEFAULT_STREAM_ENDPOINT = `${API_BASE}/stream-jeoh`;

export function useStreamAI({ userId = "guest", endpoint = DEFAULT_STREAM_ENDPOINT } = {}) {
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const controllerRef = useRef(null);
  const cacheRef = useRef({}); // Stores response per user+prompt

  const abortPreviousRequest = () => {
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
  };

  const streamAIResponse = useCallback(
    async ({ prompt, onData, onDone, onError, retryCount = 0 }) => {
      const cacheKey = `${userId}:${prompt}`;

      // Check cache
      if (cacheRef.current[cacheKey]) {
        const cached = cacheRef.current[cacheKey];
        setResponse(cached);
        if (onData) onData(cached);
        if (onDone) onDone();
        return;
      }

      abortPreviousRequest();
      setLoading(true);
      setError("");
      setResponse("");

      controllerRef.current = new AbortController();
      const signal = controllerRef.current.signal;

      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, user_id: userId }),
          signal,
        });

        if (!res.ok) throw new Error("Server returned an error");

        const reader = res.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let fullText = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          fullText += chunk;
          setResponse((prev) => prev + chunk);
          if (onData) onData(chunk);
        }

        cacheRef.current[cacheKey] = fullText;
        if (onDone) onDone();
      } catch (err) {
        if (signal.aborted) {
          setError("Request aborted.");
        } else if (retryCount < 2 && !err.message.includes("Server returned an error")) {
          // Only retry for network errors, not server errors
          streamAIResponse({
            prompt,
            onData,
            onDone,
            onError,
            retryCount: retryCount + 1,
          });
        } else {
          const errorMessage = err.message.includes("fetch") 
            ? "AI service is currently offline. Please check if the backend is running." 
            : err.message;
          setError(errorMessage);
          if (onError) onError(err);
        }
      } finally {
        setLoading(false);
      }
    },
    [endpoint, userId]
  );

  const reset = () => {
    setResponse("");
    setError("");
    abortPreviousRequest();
  };

  return {
    response,
    loading,
    error,
    streamAIResponse,
    reset,
    abort: abortPreviousRequest,
  };
}

// 👇 Added default export so `import useStreamAI from ...` works
export default useStreamAI;