// src/hooks/useStreamAI.js
import { useState, useRef, useCallback } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";
const DEFAULT_ENDPOINT = `${API_BASE}/generate`;  // ✅ unified with backend

export function useStreamAI({ userId = "guest", endpoint = DEFAULT_ENDPOINT } = {}) {
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const controllerRef = useRef(null);
  const cacheRef = useRef({});

  const abortPreviousRequest = () => {
    if (controllerRef.current) controllerRef.current.abort();
  };

  /**
   * Unified function for AI requests
   * - If stream = true → streamed text response
   * - If stream = false → full JSON response
   */
  const fetchAIResponse = useCallback(
    async ({ prompt, stream = false, outputType = "text", onData, onDone, onError, retryCount = 0 }) => {
      const cacheKey = `${userId}:${prompt}:${stream}:${outputType}`;
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
          body: JSON.stringify({
            prompt,
            user_id: userId,
            stream,
            output_type: outputType,
          }),
          signal,
        });

        if (!res.ok) throw new Error("Server returned an error");

        if (stream) {
          // ----------------------
          // Streaming response
          // ----------------------
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
        } else {
          // ----------------------
          // Non-streaming response
          // ----------------------
          const data = await res.json();
          const result = data.response || data.url || "";
          setResponse(result);
          cacheRef.current[cacheKey] = result;
          if (onData) onData(result);
          if (onDone) onDone();
        }
      } catch (err) {
        if (signal.aborted) {
          setError("Request aborted.");
        } else if (retryCount < 2 && !err.message.includes("Server returned an error")) {
          fetchAIResponse({
            prompt,
            stream,
            outputType,
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
    fetchAIResponse, // ✅ unified function
    reset,
    abort: abortPreviousRequest,
  };
}

export default useStreamAI;