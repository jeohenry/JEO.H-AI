// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import i18n from "@/i18n";
import App from "@/App";
import "@/index.css";

// Context providers
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { AuthProvider } from "@/context/AuthContext";
import { LoadingProvider } from "@/context/LoadingContext";
import LoadingSuspense from "@/components/LoadingSuspense"; // ✅ new wrapper
import ErrorBoundary from "@/components/ErrorBoundary"; // ✅ error boundary

/* ───────── 🔹 Mobile Debug Console (Eruda) ───────── */
if (window.location.search.includes("debug=true")) {
  import("eruda").then((eruda) => eruda.init());
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <AuthProvider>
          <LoadingProvider>
            <BrowserRouter>
              <ErrorBoundary>
                <LoadingSuspense>
                  <App />
                </LoadingSuspense>
              </ErrorBoundary>
            </BrowserRouter>
          </LoadingProvider>
        </AuthProvider>
      </ThemeProvider>
    </I18nextProvider>
  </React.StrictMode>
);

/* ───────── 🔹 Service Worker Registration ───────── */
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((reg) => {
        console.log("✅ Service Worker registered:", reg.scope);
      })
      .catch((err) => {
        console.error("❌ Service Worker registration failed:", err);
      });
  });
}