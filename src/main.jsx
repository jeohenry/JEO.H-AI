// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import i18n from "@/i18n";
import App from "@/App";
import "@/index.css";

import { ThemeProvider } from "./context/ThemeContext.jsx";
import { AuthProvider } from "@/context/AuthContext";
import { LoadingProvider } from "@/context/LoadingContext";
import LoadingSuspense from "@/components/LoadingSuspense";
import ErrorBoundary from "@/components/ErrorBoundary";
import { GlobalErrorProvider } from "@/context/GlobalErrorContext"; // ✅ new

// ✅ Only load Eruda when ?debug=true
if (window.location.search.includes("debug=true")) {
  const script = document.createElement("script");
  script.src = "https://cdn.jsdelivr.net/npm/eruda";
  script.onload = () => window.eruda && window.eruda.init();
  document.body.appendChild(script);
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <AuthProvider>
          <LoadingProvider>
            <BrowserRouter>
              <GlobalErrorProvider>
                <ErrorBoundary>
                  <LoadingSuspense>
                    <App />
                  </LoadingSuspense>
                </ErrorBoundary>
              </GlobalErrorProvider>
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