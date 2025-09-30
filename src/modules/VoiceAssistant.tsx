// src/modules/VoiceAssistant.tsx
import React, { useState, useEffect, useRef } from "react";
import API from "@/api"; // ✅ central axios instance
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, StopCircle, Volume2, Loader2, Download } from "lucide-react";
import { motion } from "framer-motion";
import PageWrapper from "@/components/PageWrapper";

type Props = {
  userId?: string | null;
};

export default function UnifiedVoice({ userId = "system" }: Props) {
  const [voices, setVoices] = useState<any[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [previewText, setPreviewText] = useState("Hello, this is a preview!");
  const [savedVoiceText, setSavedVoiceText] = useState("Hi, this is my saved voice!");
  const [mimicText, setMimicText] = useState("This is my custom mimic voice text!");

  const [playingUrl, setPlayingUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const [listening, setListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>("");
  const [responseText, setResponseText] = useState<string>("");
  const [translatedText, setTranslatedText] = useState<string>("");
  const [audioUrl, setAudioUrl] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [targetLang, setTargetLang] = useState<string>("fr");

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playingAudioInstanceRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any | null>(null);

  // ---------- fetch voices ----------
  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const res = await API.get("/voice-assistant/voice-preview/");
        if (Array.isArray(res.data.voices)) {
          setVoices(res.data.voices);
        } else if (res.data?.voice_id) {
          setVoices([{ id: res.data.voice_id, name: res.data.voice_id }]);
        }
      } catch (err) {
        console.warn("Failed to fetch voices:", err);
      }
    };
    fetchVoices();
  }, []);

  // cleanup audio + recognition
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      if (playingAudioInstanceRef.current) {
        playingAudioInstanceRef.current.pause();
        playingAudioInstanceRef.current.src = "";
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort?.();
        } catch {}
      }
    };
  }, []);

  // ---------- audio helpers ----------
  const playAudioBlob = (blob: Blob) => {
    if (playingAudioInstanceRef.current) {
      playingAudioInstanceRef.current.pause();
      URL.revokeObjectURL(playingAudioInstanceRef.current.src);
    }

    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    playingAudioInstanceRef.current = audio;
    setPlayingUrl(url);
    setIsPlaying(true);

    audio.addEventListener("timeupdate", () => {
      if (audio.duration > 0) {
        setProgress(Math.min(1, audio.currentTime / audio.duration));
      }
    });
    audio.addEventListener("ended", () => {
      setIsPlaying(false);
      setProgress(0);
      URL.revokeObjectURL(url);
      setPlayingUrl(null);
    });

    audio.play().catch(() => setIsPlaying(false));
    return url;
  };

  const downloadAudioBlob = (blob: Blob, filename = "audio.mp3") => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  // ---------- voice endpoints ----------
  const saveVoice = async () => {
    if (!selectedVoice) return alert("Choose a voice first");
    try {
      await API.post("/voice-assistant/choose-voice/", {
        user_id: userId,
        voice_id: selectedVoice,
      });
      alert("Voice saved!");
    } catch {
      alert("Failed to save voice");
    }
  };

  const handlePreview = async (voice_id: string, download = false) => {
    try {
      setLoading(true);
      const res = await API.get("/voice-assistant/voice-preview-tts/", {
        params: { voice_id, text: previewText },
        responseType: "blob",
      });
      if (download) downloadAudioBlob(res.data, `preview_${voice_id}.mp3`);
      else playAudioBlob(res.data);
    } catch {
      alert("Preview failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSavedVoice = async (download = false) => {
    try {
      setLoading(true);
      const res = await API.get("/voice-assistant/play-saved-voice/", {
        params: { user_id: userId, text: savedVoiceText },
        responseType: "blob",
      });
      if (download) downloadAudioBlob(res.data, `${userId}_saved_voice.mp3`);
      else playAudioBlob(res.data);
    } catch {
      alert("Failed to play saved voice.");
    } finally {
      setLoading(false);
    }
  };

  const handleSpeakDirect = async (text: string) => {
    try {
      setLoading(true);
      const res = await API.get("/voice-assistant/speak/", {
        params: { user_id: userId, text },
        responseType: "blob",
      });
      playAudioBlob(res.data);
    } catch {
      alert("Direct speak failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleMimic = async () => {
    try {
      setLoading(true);
      const res = await API.post("/voice-assistant/voice-mimic/", { text: mimicText });
      if (res.data?.url) {
        const open = confirm("Mimic generated, open preview?");
        if (open) window.open(res.data.url, "_blank");
      } else {
        alert("Mimic generated.");
      }
    } catch {
      alert("Voice mimic generation failed.");
    } finally {
      setLoading(false);
    }
  };

  // ---------- speech recognition ----------
  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("SpeechRecognition API not available in your browser");
      return;
    }
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = "en-US";
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      const parts: string[] = [];
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        parts.push(event.results[i][0].transcript);
      }
      setTranscript(parts.join(" "));
    };

    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognition.start();
    setListening(true);
    setTranscript("");
  };

  const stopListening = () => {
    try {
      recognitionRef.current?.stop?.();
    } catch {}
    setListening(false);
  };

  // ---------- unified submit ----------
  const handleSubmitVoice = async () => {
    if (!transcript?.trim()) return;
    setLoading(true);
    setResponseText("");
    setTranslatedText("");
    setAudioUrl("");

    try {
      const aiResp = await API.post("/voice-assistant/voice-text/", { text: transcript });
      const answer = aiResp.data?.response || "";
      setResponseText(answer);

      let finalText = answer;
      if (targetLang && targetLang !== "en") {
        try {
          const t = await API.post("/translate/", {
            text: answer,
            source: "en",
            target: targetLang,
          });
          setTranslatedText(t.data?.translated || "");
          finalText = t.data?.translated || answer;
        } catch {
          console.warn("translation failed");
        }
      }

      const tts = await API.post(
        "/voice-assistant/speak/",
        { user_id: userId, text: finalText },
        { responseType: "blob" }
      );
      const localUrl = URL.createObjectURL(tts.data);
      setAudioUrl(localUrl);

      if (audioRef.current) {
        audioRef.current.src = localUrl;
        audioRef.current.play().catch(() => {});
      } else {
        new Audio(localUrl).play().catch(() => {});
      }
    } catch {
      setResponseText("Error processing voice.");
    } finally {
      setLoading(false);
    }
  };

  // ---------- UI ----------
  return (
    <PageWrapper>
      <motion.div
        className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="shadow-lg border bg-white dark:bg-gray-900">
          <CardContent className="p-4 sm:p-6 lg:p-8 space-y-6">
            {/* header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Mic className="text-blue-600" />
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                  🎙️ JEO.H Voice Assistant
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 dark:text-gray-300">Target language</label>
                <select
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="border rounded px-2 py-1 bg-white text-black dark:bg-gray-800 dark:text-white"
                >
                  <option value="en">English</option>
                  <option value="fr">French</option>
                  <option value="es">Spanish</option>
                  <option value="de">German</option>
                  <option value="zh">Chinese</option>
                  <option value="ar">Arabic</option>
                </select>
              </div>
            </div>

            {/* controls */}
            <div className="flex flex-col sm:flex-row gap-3">
              {!listening ? (
                <Button onClick={startListening} className="flex-1 bg-blue-600 text-white">
                  <Mic className="mr-2" /> Start Listening
                </Button>
              ) : (
                <Button onClick={stopListening} variant="destructive" className="flex-1">
                  <StopCircle className="mr-2" /> Stop
                </Button>
              )}
              <Button
                onClick={handleSubmitVoice}
                disabled={loading || !transcript}
                className="flex-1"
              >
                {loading ? <Loader2 className="animate-spin mr-2" /> : <Volume2 className="mr-2" />}
                Process Voice
              </Button>
            </div>

            {/* rest of your UI stays the same... */}
            {/* voices, preview, saved voice, mimic, transcripts, outputs */}
          </CardContent>
        </Card>
      </motion.div>
    </PageWrapper>
  );
}