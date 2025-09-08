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
import { GlobalErrorProvider } from "@/context/GlobalErrorContext";

// ✅ Load Eruda only in browser when ?debug=true
if (typeof window !== "undefined" && window.location.search.includes("debug=true")) {
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

// ❌ Removed service worker (Cloudflare Pages doesn’t generate one automatically)
// If you want a service worker, add one manually in `public/service-worker.js`