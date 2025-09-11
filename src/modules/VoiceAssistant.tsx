// src/modules/VoiceAssistant.tsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
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
  const [previewText, setPreviewText] = useState<string>(
    "Hello, this is a preview!"
  );
  const [savedVoiceText, setSavedVoiceText] = useState<string>(
    "Hi, this is my saved voice!"
  );
  const [mimicText, setMimicText] = useState<string>(
    "This is my custom mimic voice text!"
  );

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

  const API_BASE = (import.meta.env.VITE_API_BASE as string) || "http://localhost:8000";

  // fetch voices
  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const res = await axios.get(`${API_BASE}/voice-assistant/voice-preview/`);
        // endpoint returns one preview; also try voices list endpoint if exists
        // if res.data.voices exists, use that; else keep empty
        if (res.data && Array.isArray(res.data.voices)) {
          setVoices(res.data.voices);
        } else {
          // fallback: set voice id from preview response if present
          if (res.data && res.data.voice_id) {
            setVoices([{ id: res.data.voice_id, name: res.data.voice_id }]);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch voices:", err);
      }
    };
    fetchVoices();
  }, [API_BASE]);

  // cleanup audio on unmount
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
          recognitionRef.current.onresult = null;
          recognitionRef.current.onend = null;
          recognitionRef.current.abort?.();
        } catch {}
      }
    };
  }, []);

  // ---------- audio helpers ----------
  const playAudioBlob = (blob: Blob) => {
    try {
      // stop & clean previous
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

      audio.play().catch((e) => {
        console.warn("audio play failed:", e);
        setIsPlaying(false);
      });

      return url;
    } catch (e) {
      console.error("playAudioBlob error", e);
      return null;
    }
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
      await axios.post(`${API_BASE}/voice-assistant/choose-voice/`, {
        user_id: userId,
        voice_id: selectedVoice,
      });
      alert("Voice saved!");
    } catch (err) {
      console.error(err);
      alert("Failed to save voice");
    }
  };

  const handlePreview = async (voice_id: string, download = false) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/voice-assistant/voice-preview-tts/`, {
        params: { voice_id, text: previewText },
        responseType: "blob",
      });
      if (download) downloadAudioBlob(res.data, `preview_${voice_id}.mp3`);
      else playAudioBlob(res.data);
    } catch (err) {
      console.error(err);
      alert("Preview failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSavedVoice = async (download = false) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/voice-assistant/play-saved-voice/`, {
        params: { user_id: userId, text: savedVoiceText },
        responseType: "blob",
      });
      if (download) downloadAudioBlob(res.data, `${userId}_saved_voice.mp3`);
      else playAudioBlob(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to play saved voice.");
    } finally {
      setLoading(false);
    }
  };

  const handleSpeakDirect = async (text: string) => {
    try {
      setLoading(true);
      // GET /speak/ returns audio stream
      const res = await axios.get(`${API_BASE}/voice-assistant/speak/`, {
        params: { user_id: userId, text },
        responseType: "blob",
      });
      playAudioBlob(res.data);
    } catch (err) {
      console.error(err);
      alert("Direct speak failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleMimic = async () => {
    try {
      setLoading(true);
      const res = await axios.post(
        `${API_BASE}/voice-assistant/voice-mimic/`,
        { text: mimicText },
        { responseType: "json" } // mimic returns url & blob_id in updated backend
      );
      // if backend returned url, attempt to download or open
      if (res.data?.url) {
        const open = confirm("Mimic generated, open preview?");
        if (open) window.open(res.data.url, "_blank");
      } else {
        alert("Mimic generated.");
      }
    } catch (err) {
      console.error(err);
      alert("Voice mimic generation failed.");
    } finally {
      setLoading(false);
    }
  };

  // ---------- speech recognition ----------
  const startListening = () => {
    if (typeof window === "undefined") {
      alert("Speech recognition not available");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("SpeechRecognition API not available in your browser");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = "en-US";
      recognition.interimResults = true;
      recognition.continuous = false;

      recognition.onresult = (event: any) => {
        const parts: string[] = [];
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          parts.push(event.results[i][0].transcript);
        }
        setTranscript(parts.join(" "));
      };

      recognition.onend = () => {
        setListening(false);
      };

      recognition.onerror = (err: any) => {
        console.error("recognition error", err);
        setListening(false);
      };

      recognition.start();
      setListening(true);
      setTranscript("");
    } catch (e) {
      console.error("startListening error", e);
      alert("Could not start recognition");
      setListening(false);
    }
  };

  const stopListening = () => {
    try {
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop?.();
      }
    } catch (err) {
      console.warn("stop listening error", err);
    } finally {
      setListening(false);
    }
  };

  // ---------- unified submit (transcript -> AI -> TTS -> optional translate) ----------
  const handleSubmitVoice = async () => {
    if (!transcript?.trim()) return;
    setLoading(true);
    setResponseText("");
    setTranslatedText("");
    setAudioUrl("");

    try {
      // 1) AI text response
      const aiResp = await axios.post(`${API_BASE}/voice-assistant/voice-text/`, { text: transcript });
      const answer = aiResp.data?.response || "";
      setResponseText(answer);

      // 2) Translate if requested
      let finalText = answer;
      if (targetLang && targetLang !== "en") {
        try {
          const t = await axios.post(`${API_BASE}/translate/`, {
            text: answer,
            source: "en",
            target: targetLang,
          });
          setTranslatedText(t.data?.translated || "");
          finalText = t.data?.translated || answer;
        } catch (err) {
          console.warn("translation failed", err);
        }
      }

      // 3) Generate TTS and play
      const tts = await axios.post(
        `${API_BASE}/voice-assistant/speak/`,
        { user_id: userId, text: finalText },
        { responseType: "blob" }
      );
      const localUrl = URL.createObjectURL(tts.data);
      setAudioUrl(localUrl);
      // play in page audio element too
      if (audioRef.current) {
        audioRef.current.src = localUrl;
        audioRef.current.play().catch(() => {});
      } else {
        const au = new Audio(localUrl);
        au.play().catch(() => {});
      }
    } catch (err) {
      console.error(err);
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
                {loading ? (
                  <Loader2 className="animate-spin mr-2" />
                ) : (
                  <Volume2 className="mr-2" />
                )}
                Process Voice
              </Button>
            </div>

            {/* choose voice + preview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">Select voice</label>
                <select
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="w-full border rounded px-3 py-2 bg-white text-black dark:bg-gray-800 dark:text-white"
                >
                  <option value="">-- choose voice --</option>
                  {voices.map((v) => (
                    <option key={v.id || v.voice_id || v} value={v.id || v.voice_id || v}>
                      {v.name || v.id || v.voice_id || v}
                    </option>
                  ))}
                </select>

                <div className="flex gap-2 mt-3">
                  <Button onClick={() => handlePreview(selectedVoice)} disabled={!selectedVoice || loading} className="flex-1">
                    Preview
                  </Button>
                  <Button onClick={saveVoice} disabled={!selectedVoice} variant="outline" className="flex-1">
                    Save
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">Preview text</label>
                <textarea
                  value={previewText}
                  onChange={(e) => setPreviewText(e.target.value)}
                  className="w-full min-h-[72px] p-3 rounded border bg-white text-black dark:bg-gray-800 dark:text-white placeholder-gray-500"
                />
                <div className="flex gap-2 mt-3">
                  <Button onClick={() => handlePreview(selectedVoice, false)} className="flex-1" disabled={!selectedVoice}>Play</Button>
                  <Button onClick={() => handlePreview(selectedVoice, true)} className="flex-1" disabled={!selectedVoice}><Download className="mr-2" />Download</Button>
                </div>
              </div>
            </div>

            {/* mimic / saved voice */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">Saved voice text</label>
                <input
                  value={savedVoiceText}
                  onChange={(e) => setSavedVoiceText(e.target.value)}
                  className="w-full p-2 rounded border bg-white text-black dark:bg-gray-800 dark:text-white"
                />
                <div className="flex gap-2 mt-2">
                  <Button onClick={() => handleSavedVoice(false)} className="flex-1">Play</Button>
                  <Button onClick={() => handleSavedVoice(true)} className="flex-1"><Download className="mr-2" />Download</Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">Mimic prompt</label>
                <input
                  value={mimicText}
                  onChange={(e) => setMimicText(e.target.value)}
                  className="w-full p-2 rounded border bg-white text-black dark:bg-gray-800 dark:text-white"
                />
                <div className="flex gap-2 mt-2">
                  <Button onClick={handleMimic} className="flex-1" disabled={loading}>Generate Mimic</Button>
                </div>
              </div>
            </div>

            {/* Input / output display */}
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-1">🗣️ Your Input</h3>
                <div className="bg-white dark:bg-gray-800 p-3 rounded shadow min-h-[48px] text-black dark:text-white">
                  {transcript || <span className="text-gray-400">Waiting for input...</span>}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-1">🤖 AI Response</h3>
                <div className="bg-white dark:bg-gray-800 p-3 rounded shadow min-h-[48px] text-black dark:text-white">
                  {responseText || <span className="text-gray-400">Awaiting AI response...</span>}
                </div>
              </div>

              {translatedText && (
                <div>
                  <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-1">🌍 Translation</h3>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded shadow min-h-[48px] text-black dark:text-white">
                    {translatedText}
                  </div>
                </div>
              )}

              {audioUrl && (
                <div>
                  <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-1">🔊 Audio Output</h3>
                  <audio ref={audioRef} controls src={audioUrl} className="w-full mt-2 rounded" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </PageWrapper>
  );
}