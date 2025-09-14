// src/services/Voice.js
import axios from "@/api";

export const playGreetingVoice = async (text, lang = "en") => {
  try {
    const res = await axios.post(
      "/utils/voice-greeting",
      { text, lang },
      { responseType: "blob" }
    );

    // 🎵 Create audio from blob
    const audioBlob = new Blob([res.data], { type: "audio/mpeg" });
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audio.play();

    // 🔗 Also grab saved file URL from headers (if backend provided)
    const savedUrl = res.headers["x-file-url"];
    return { success: true, url: savedUrl || null };

  } catch (e) {
    console.warn("🎤 Voice playback failed:", e.message);
    return { success: false, error: e.message };
  }
};