// services/voice.js
import axios from "../utils/API";

export const playGreetingVoice = async (text, lang = "en") => {
  try {
    const res = await axios.post(
      "/utils/voice-greeting",
      { text, lang },
      { responseType: "blob" }
    );
    const audioBlob = new Blob([res.data], { type: "audio/mpeg" });
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audio.play();
  } catch (e) {
    console.warn("🎤 Voice playback failed:", e.message);
  }
};