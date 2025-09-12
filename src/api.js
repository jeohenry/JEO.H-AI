// src/api.js
import axios from "axios";

/* ───────── 🌍 BASE URL DETECTION ───────── */
let BASE_URL;

// 1️⃣ Prefer environment variable (Replit, Vercel, Netlify, etc.)
if (import.meta.env.VITE_API_BASE) {
  BASE_URL = import.meta.env.VITE_API_BASE;

// 2️⃣ Development (Vite dev server / Replit preview)
} else if (import.meta.env.DEV) {
  BASE_URL = import.meta.env.VITE_USE_PROXY ? "/api" : "http://localhost:8000";

// 3️⃣ Fallback → safe default for production
} else {
  BASE_URL = "https://your-api.onrender.com"; // 🔗 replace with your actual Render URL
}

/* ───────── 🔗 AXIOS INSTANCE ───────── */
const API = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000, // prevent hanging requests
});

/* ───────── 🔐 AUTH INTERCEPTOR ───────── */
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ───────── 🚨 RESPONSE ERROR HANDLER ───────── */
API.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("userRole");
      localStorage.removeItem("adminUsername");
      // Adjust redirect if you're using React Router
      window.location.href = "/admin/login";
    }
    return Promise.reject(error);
  }
);

export default API;