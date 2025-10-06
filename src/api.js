// src/api.jsx
import axios from "axios";

/* ───────── 🌍 BASE URL DETECTION ───────── */
let BASE_URL;

if (import.meta.env.VITE_API_BASE) {
  // ✅ Use environment variable (Replit, Vercel, Netlify, etc.)
  BASE_URL = import.meta.env.VITE_API_BASE;
} else if (import.meta.env.DEV) {
  // ✅ Local dev mode
  BASE_URL = import.meta.env.VITE_USE_PROXY ? "/api" : "http://localhost:8000";
} else {
  // ✅ Production fallback
  BASE_URL = "https://your-api.onrender.com"; // 🔗 replace with your live API URL
}

/* ───────── 🔗 AXIOS INSTANCE ───────── */
const API = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

/* ───────── 🔐 REQUEST INTERCEPTOR ───────── */
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    // Keep default header in sync
    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.common["Authorization"];
  }

  return config;
});

/* ───────── 🚨 RESPONSE ERROR HANDLER ───────── */
API.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth info and redirect
      localStorage.removeItem("token");
      localStorage.removeItem("userRole");
      localStorage.removeItem("adminUsername");
      window.location.href = "/admin/login";
    }
    return Promise.reject(error);
  }
);

export { BASE_URL };
export default API;