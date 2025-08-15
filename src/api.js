import axios from "axios";

// Use environment variable (VITE_ prefix required for Vite)
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const API = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Optional: Auth token interceptor
// API.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

/* ───────── 🔐 AUTH ───────── */
export const registerUser = (data) => API.post("/register", data);
export const loginUser = (data) => API.post("/login", data);

/* ───────── 👤 PROFILE ───────── */
export const fetchProfile = (id) => API.get(`/profile/${id}`);
export const updateProfile = (id, data) => API.put(`/profile/${id}`, data);
export const uploadPicture = (formData) =>
  API.post("/profile/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

/* ───────── 📝 POSTS ───────── */
export const createPost = (data) => API.post("/posts/", data);
export const fetchPosts = () => API.get("/posts/");
export const likePost = (id) => API.post(`/posts/${id}/like`);
export const commentPost = (id, data) => API.post(`/posts/${id}/comment`, data);
export const deletePost = (id) => API.delete(`/posts/${id}`);

/* ───────── 💬 CHAT ───────── */
export const sendMessage = (data) => API.post("/chat/send", data);
export const fetchMessages = (chatId) => API.get(`/chat/${chatId}`);

/* ───────── 💘 MATCHMAKER ───────── */
export const fetchMatches = () => API.get("/matchmaker");
export const sendSignal = (users) => API.post("/matchmaker/signal", users);

/* ───────── 🧠 PROGRESSIVE AI ───────── */
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

/* ───────── 💌 ADVICE AI ───────── */
export const askAdvice = (question) => API.post("/ai/advice", { question });
export const analyzeSentiment = (message) =>
  API.post("/ai/sentiment", { message });

/* ───────── 🏥 HEALTH AI ───────── */
export const diagnose = (symptoms) =>
  API.post("/health/diagnose", { symptoms });
export const prescribe = (diagnosis) =>
  API.post("/health/prescribe", { diagnosis });

/* ───────── 🌐 TRANSLATOR ───────── */
export const translateText = (text, toLang) =>
  API.post("/translate", { text, to_language: toLang });

/* ───────── 🧑‍💻 FACE DETECTION ───────── */
export const detectFace = (formData) =>
  API.post("/face/detect", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

/* ───────── 🖼️ IMAGE CLASSIFICATION ───────── */
export const classifyImage = (formData) =>
  API.post("/image/classify", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

/* ───────── 🔊 VOICE ASSISTANT ───────── */
export const processVoice = (formData) =>
  API.post("/voice/process", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

/* ───────── ✍️ CONTENT CREATION ───────── */
export const generateContent = (data) =>
  API.post("/content/generate", data);

/* ───────── 🎵 MUSIC AI ───────── */
export const generateMusic = (input) =>
  API.post("/music/generate", { input });
export const uploadAudio = (formData) =>
  API.post("/music/analyze", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const flagContent = (payload) => API.post("/flag", payload);
export const getAllFlags = () => API.get("/flag/all");

export const fetchAnalyticsSummary = () => API.get("/api/relationship/admin/analytics/summary");
export const fetchGlobalAnalytics = () => API.get("/api/admin/analytics/summary");


axios.post("http://localhost:8000/utils/generate-translations")
  .then(res => console.log(res.data))
  .catch(err => console.error(err));
/* ───────── 🌍 EXPORT AXIOS ───────── */
export default API;





