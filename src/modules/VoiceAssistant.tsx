// src/modules/VoiceAssistant.tsx

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, StopCircle, Volume2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import PageWrapper from "@/components/PageWrapper";

export default function UnifiedVoice({ userId }) {
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [previewText, setPreviewText] = useState("Hello, this is a preview!");
  const [savedVoiceText, setSavedVoiceText] = useState("Hi, this is my saved voice!");
  const [mimicText, setMimicText] = useState("This is my custom mimic voice text!");
  const [playingUrl, setPlayingUrl] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [responseText, setResponseText] = useState(""); // AI response
  const [translatedText, setTranslatedText] = useState(""); // Translation
  const [audioUrl, setAudioUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [targetLang, setTargetLang] = useState("fr"); // default French

  const audioRef = useRef(null);
  const BASE_URL = "http://localhost:8000";

  // ---------------- Fetch Voices ----------------
  useEffect(() => {
    axios
      .get(`${BASE_URL}/voices/`)
      .then((res) => setVoices(res.data.voices || res.data || []))
      .catch((err) => console.error(err));
  }, []);

  // ---------------- Audio Playback Helpers ----------------
  const playAudioBlob = (blob) => {
    if (audioRef.current) {
      audioRef.current.pause();
      URL.revokeObjectURL(audioRef.current.src);
    }
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audioRef.current = audio;
    setPlayingUrl(url);
    setIsPlaying(true);

    audio.addEventListener("timeupdate", () =>
      setProgress(audio.currentTime / audio.duration)
    );
    audio.addEventListener("ended", () => {
      setIsPlaying(false);
      setProgress(0);
      URL.revokeObjectURL(url);
      setPlayingUrl(null);
    });

    audio.play();
    return url;
  };

  const downloadAudioBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  // ---------------- Voice Actions ----------------
  const saveVoice = () => {
    if (!selectedVoice) return;
    axios
      .post(`${BASE_URL}/choose-voice/`, { user_id: userId, voice_id: selectedVoice })
      .then(() => alert("Voice saved!"))
      .catch((err) => console.error(err));
  };

  const handlePreview = async (voice_id, download = false) => {
    try {
      const response = await axios.get(`${BASE_URL}/voice-preview-tts/`, {
        params: { voice_id, text: previewText },
        responseType: "blob",
      });
      if (download) downloadAudioBlob(response.data, `preview_${voice_id}.mp3`);
      else playAudioBlob(response.data);
    } catch (err) {
      console.error(err);
      alert("Preview failed.");
    }
  };

  const handleSavedVoice = async (download = false) => {
    try {
      const response = await axios.get(`${BASE_URL}/play-saved-voice/`, {
        params: { user_id: userId, text: savedVoiceText },
        responseType: "blob",
      });
      if (download) downloadAudioBlob(response.data, `${userId}_saved_voice.mp3`);
      else playAudioBlob(response.data);
    } catch (err) {
      console.error(err);
      alert("Failed to play saved voice.");
    }
  };

  const handleSpeakDirect = async (text) => {
    try {
      const response = await axios.get(`${BASE_URL}/speak/`, {
        params: { user_id: userId, text },
        responseType: "blob",
      });
      playAudioBlob(response.data);
    } catch (err) {
      console.error(err);
      alert("Direct speak failed.");
    }
  };

  const handleMimic = async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/voice-mimic/`,
        { text: mimicText },
        { responseType: "blob" }
      );
      downloadAudioBlob(response.data, "voice_mimic.mp3");
    } catch (err) {
      console.error(err);
      alert("Voice mimic generation failed.");
    }
  };

  // ---------------- Speech Recognition ----------------
  const recognition =
    typeof window !== "undefined" &&
    new (window.SpeechRecognition || window.webkitSpeechRecognition)();

  const startListening = () => {
    setTranscript("");
    setListening(true);
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      const transcriptParts = [];
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        transcriptParts.push(event.results[i][0].transcript);
      }
      setTranscript(transcriptParts.join(" "));
    };

    recognition.onend = () => setListening(false);
    recognition.start();
  };

  const stopListening = () => recognition.stop();

  // ---------------- Unified Voice Submit ----------------
  const handleSubmitVoice = async () => {
    if (!transcript) return;
    setLoading(true);
    setResponseText("");
    setTranslatedText("");
    setAudioUrl("");

    try {
      // 1. Get AI response
      const aiResponse = await axios.post(`${BASE_URL}/voice-text/`, {
        text: transcript,
      });
      const answer = aiResponse.data.response;
      setResponseText(answer);

      // 2. Translate if needed
      let finalText = answer;
      if (targetLang && targetLang !== "en") {
        const translation = await axios.post(`${BASE_URL}/translate/`, {
          text: answer,
          source: "en",
          target: targetLang,
        });
        setTranslatedText(translation.data.translated);
        finalText = translation.data.translated;
      }

      // 3. Generate speech
      const audio = await axios.post(
        `${BASE_URL}/speak/`,
        { user_id: userId, text: finalText },
        { responseType: "blob" }
      );
      setAudioUrl(URL.createObjectURL(audio.data));
    } catch (err) {
      console.error(err);
      setResponseText("Error processing voice.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <motion.div
        className="max-w-3xl mx-auto p-6"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="shadow-lg border bg-gradient-to-tr from-blue-50 to-indigo-100">
          <CardContent className="space-y-6 p-6">
            {/* Voice Assistant Section */}
            <div className="flex items-center gap-2 mb-2">
              <Mic className="text-blue-600" />
              <h2 className="text-2xl font-bold">🎙️ JEO.H Voice Assistant</h2>
            </div>

            {/* Language Selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Target Language</label>
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="border rounded px-2 py-1"
              >
                <option value="en">English</option>
                <option value="fr">French</option>
                <option value="es">Spanish</option>
                <option value="de">German</option>
                <option value="zh">Chinese</option>
                <option value="ar">Arabic</option>
              </select>
            </div>

            {/* Controls */}
            <div className="flex gap-4 flex-wrap">
              {!listening ? (
                <Button onClick={startListening} className="bg-blue-600 text-white">
                  <Mic className="mr-2" /> Start Listening
                </Button>
              ) : (
                <Button onClick={stopListening} variant="destructive">
                  <StopCircle className="mr-2" /> Stop
                </Button>
              )}
              <Button onClick={handleSubmitVoice} disabled={loading || !transcript}>
                {loading ? (
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                ) : (
                  <Volume2 className="mr-2" />
                )}
                Process Voice
              </Button>
            </div>

            {/* Input / Output */}
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-gray-700 mb-1">🗣️ Your Input</h3>
                <p className="bg-white p-3 rounded shadow text-gray-800 min-h-[48px]">
                  {transcript || "Waiting for input..."}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-1">🤖 AI Response</h3>
                <p className="bg-white p-3 rounded shadow text-gray-800 min-h-[48px]">
                  {responseText || "Awaiting AI response..."}
                </p>
              </div>
              {translatedText && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-1">🌍 Translation</h3>
                  <p className="bg-white p-3 rounded shadow text-gray-800 min-h-[48px]">
                    {translatedText}
                  </p>
                </div>
              )}
              {audioUrl && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-1">🔊 Audio Output</h3>
                  <audio controls src={audioUrl} className="w-full mt-2 rounded" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </PageWrapper>
  );
}