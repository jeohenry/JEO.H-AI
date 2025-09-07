// src/api.js
import axios from "axios";

/* ───────── 🌍 BASE URL DETECTION ───────── */
let BASE_URL;

// 1️⃣ Prefer environment variable (Replit, Vercel, Netlify, etc.)
if (import.meta.env.VITE_API_BASE) {
  BASE_URL = import.meta.env.VITE_API_BASE;

// 2️⃣ Development (Vite dev server / Replit preview)
} else if (import.meta.env.DEV) {
  // Use Vite proxy if configured, otherwise fallback to localhost
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
      // Adjust redirect if you're using React Router
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

/* ───────── 🔗 API CALLS ───────── */

// Auth
export const registerUser = (data) => API.post("/register", data);
export const loginUser = (data) => API.post("/login", data);

// Profile
export const fetchProfile = (id) => API.get(`/profile/${id}`);
export const updateProfile = (id, data) => API.put(`/profile/${id}`, data);
export const uploadPicture = (formData) =>
  API.post("/profile/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// Posts
export const createPost = (data) => API.post("/posts/", data);
export const fetchPosts = () => API.get("/posts/");
export const likePost = (id) => API.post(`/posts/${id}/like`);
export const commentPost = (id, data) => API.post(`/posts/${id}/comment`, data);
export const deletePost = (id) => API.delete(`/posts/${id}`);

// Chat
export const sendMessage = (data) => API.post("/chat/send", data);
export const fetchMessages = (chatId) => API.get(`/chat/${chatId}`);

// Matchmaker
export const fetchMatches = () => API.get("/matchmaker");
export const sendSignal = (users) => API.post("/matchmaker/signal", users);

// AI
export const trainAI = (prompt) => API.post("/ai/train", { prompt });
export const trainManual = (input, output) =>
  API.post("/ai/train/manual", { input, output });
export const queryAI = (prompt) => API.post("/ai/query", { prompt });
export const getTrainingHistory = () => API.get("/ai/history");
export const deleteTrainingEntry = (id) => API.delete(`/ai/delete/${id}`);
export const importTrainingFile = (formData) =>
  API.post("/ai/import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const exportTrainingData = () => API.get("/ai/export");

// Advice AI
export const askAdvice = (question) => API.post("/ai/advice", { question });
export const analyzeSentiment = (message) =>
  API.post("/ai/sentiment", { message });

// Health AI
export const diagnose = (symptoms) =>
  API.post("/health/diagnose", { symptoms });
export const prescribe = (diagnosis) =>
  API.post("/health/prescribe", { diagnosis });

// Translator
export const translateText = (text, toLang) =>
  API.post("/translate", { text, to_language: toLang });

// Face Detection
export const detectFace = (formData) =>
  API.post("/face/detect", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// Image Classification
export const classifyImage = (formData) =>
  API.post("/image/classify", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// Voice Assistant
export const processVoice = (formData) =>
  API.post("/voice/process", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// Content Creation
export const generateContent = (data) =>
  API.post("/content/generate", data);

// Music AI
export const generateMusic = (input) =>
  API.post("/music/generate", { input });
export const uploadAudio = (formData) =>
  API.post("/music/analyze", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// Flagging
export const flagContent = (payload) => API.post("/flag", payload);
export const getAllFlags = () => API.get("/flag/all");

// Analytics
export const fetchAnalyticsSummary = () =>
  API.get("/relationship/admin/analytics/summary");
export const fetchGlobalAnalytics = () => API.get("/admin/analytics/summary");

/* ───────── 🌍 EXPORT AXIOS ───────── */
export default API;