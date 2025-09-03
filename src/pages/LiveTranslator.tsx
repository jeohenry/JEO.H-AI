//src/pages/LiveTranslator.tsx

import React, { useState, useEffect, useRef } from "react";
import axios from "../../utils/API";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Mic, Volume2 } from "lucide-react";
import PageWrapper from "@/components/PageWrapper";
import { motion } from "framer-motion";
import ExportButtonGroup from "@/components/ExportButtonGroup";

const languageNames = {
  fr: "🇫🇷 French",
  es: "🇪🇸 Spanish",
  yo: "🇳🇬 Yoruba",
  ha: "🇳🇬 Hausa",
  ig: "🇳🇬 Igbo",
  zh: "🇨🇳 Chinese",
  urh: "🌀 Urhobo",
};

const supportedLangs = Object.keys(languageNames);

const LiveTranslator = () => {
  const [input, setInput] = useState("");
  const [targetLang, setTargetLang] = useState("fr");
  const [sourceLang, setSourceLang] = useState("");
  const [translated, setTranslated] = useState("");
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [listening, setListening] = useState(false);

  const recognitionRef = useRef(null);

  useEffect(() => {
    const browserLang = navigator.language.split("-")[0];
    if (supportedLangs.includes(browserLang)) {
      setTargetLang(browserLang);
    }

    if (typeof window !== "undefined") {
      recognitionRef.current = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognitionRef.current.lang = "en-US";
      recognitionRef.current.interimResults = false;
      recognitionRef.current.continuous = false;
    }
  }, []);

  const handleTranslate = async () => {
    if (!input || !targetLang) return;
    setLoading(true);
    try {
      const res = await axios.post("/utils/live-translate", {
        text: input,
        target: targetLang,
      });
      setTranslated(res.data.translation);
      setSourceLang(res.data.source);
      const voiceRes = await axios.post(
        "/api/music/voice",
        { text: res.data.translation, voice_id: "default" },
        { responseType: "blob" }
      );
      const url = URL.createObjectURL(voiceRes.data);
      setAudioUrl(url);
    } catch (err) {
      setTranslated("❌ Failed to translate.");
    } finally {
      setLoading(false);
    }
  };

  const swapLanguages = () => {
    const temp = targetLang;
    setTargetLang(sourceLang || "en");
    setSourceLang(temp);
    setInput(translated);
    setTranslated("");
  };

  const handleSpeech = () => {
    if (!recognitionRef.current) return;

    recognitionRef.current.onresult = (event) => {
      const result = event.results[0][0].transcript;
      setInput(result);
    };

    recognitionRef.current.onend = () => setListening(false);

    setListening(true);
    recognitionRef.current.start();
  };

  return (
    <PageWrapper>
      <motion.div
        className="max-w-3xl mx-auto mt-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="shadow-lg">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-bold text-pink-600 dark:text-pink-300">
              🌍 Live Translator
            </h2>
            <div className="flex gap-2">
              <Textarea
                rows={3}
                placeholder="Enter English text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <Button onClick={handleSpeech} variant="ghost" className="self-start">
                <Mic className="text-blue-500" />
              </Button>
            </div>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="w-full p-2 border rounded"
            >
              {supportedLangs.map((lang) => (
                <option key={lang} value={lang}>
                  {languageNames[lang]}
                </option>
              ))}
            </select>
            <Button
              onClick={handleTranslate}
              disabled={loading}
              className="bg-pink-600 text-white w-full"
            >
              {loading ? "Translating..." : "Translate"}
            </Button>

            {translated && (
              <div className="p-4 rounded bg-gray-100 dark:bg-gray-800 border dark:border-gray-700 space-y-4">
                <div>
                  <strong className="text-pink-600">Detected Language:</strong>
                  <p className="text-sm">📘 {sourceLang || "Not detected"}</p>
                </div>
                <div>
                  <strong className="text-pink-600">Translation:</strong>
                  <p>{translated}</p>
                </div>
                {audioUrl && (
                  <div>
                    <strong className="text-pink-600">Text-to-Speech:</strong>
                    <audio controls src={audioUrl} className="mt-2 w-full rounded" />
                  </div>
                )}
                <ExportButtonGroup voiceUrl={audioUrl} lyrics={translated} />
                <Button variant="outline" onClick={swapLanguages}>
                  🔄 Swap Source/Target
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </PageWrapper>
  );
};

export default LiveTranslator;
