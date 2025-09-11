//src/modules/LiveTranslator.tsx

import React, { useState, useEffect, useRef } from "react";
import API from "@/api"; // ✅ unified API instance
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Mic } from "lucide-react";
import PageWrapper from "@/components/PageWrapper";
import { motion } from "framer-motion";
import ExportButtonGroup from "@/components/ExportButtonGroup";

const languageNames: Record<string, string> = {
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

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const browserLang = navigator.language.split("-")[0];
    if (supportedLangs.includes(browserLang)) {
      setTargetLang(browserLang);
    }

    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.lang = "en-US";
        recognitionRef.current.interimResults = false;
        recognitionRef.current.continuous = false;
      }
    }
  }, []);

  const handleTranslate = async () => {
    if (!input || !targetLang) return;
    setLoading(true);
    try {
      const res = await API.post("/live-translate", {
        text: input,
        target: targetLang,
      });

      setTranslated(res.data.translation);
      setSourceLang(res.data.source);

      // ✅ Prefer instant base64 playback if available
      setAudioUrl(res.data.audio_base64 || res.data.audio_url || "");
    } catch (err) {
      console.error("Translation failed:", err);
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

    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
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
        className="max-w-3xl mx-auto mt-6 px-3 sm:px-4"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="shadow-lg">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-pink-600 dark:text-pink-300 text-center">
              🌍 Live Translator
            </h2>

            {/* Input Area */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Textarea
                rows={3}
                placeholder="Enter English text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 p-3 border rounded-lg 
                           bg-white text-black placeholder-gray-400
                           dark:bg-gray-900 dark:text-white dark:placeholder-gray-500
                           focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <Button
                onClick={handleSpeech}
                variant="ghost"
                className="self-start sm:self-auto"
              >
                <Mic className="text-blue-500" />
              </Button>
            </div>

            {/* Language Select */}
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="w-full p-2 border rounded-lg bg-white text-black dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              {supportedLangs.map((lang) => (
                <option key={lang} value={lang}>
                  {languageNames[lang]}
                </option>
              ))}
            </select>

            {/* Translate Button */}
            <Button
              onClick={handleTranslate}
              disabled={loading}
              className="bg-pink-600 text-white w-full py-3 rounded-lg hover:bg-pink-700 transition disabled:opacity-50"
            >
              {loading ? "🔄 Translating..." : "🚀 Translate"}
            </Button>

            {/* Output Section */}
            {translated && (
              <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800 border dark:border-gray-700 space-y-4">
                <div>
                  <strong className="text-pink-600">Detected Language:</strong>
                  <p className="text-sm">📘 {sourceLang || "Not detected"}</p>
                </div>
                <div>
                  <strong className="text-pink-600">Translation:</strong>
                  <p className="break-words">{translated}</p>
                </div>
                {audioUrl && (
                  <div>
                    <strong className="text-pink-600">Text-to-Speech:</strong>
                    <audio
                      controls
                      src={audioUrl}
                      className="mt-2 w-full rounded"
                    />
                  </div>
                )}
                <ExportButtonGroup voiceUrl={audioUrl} lyrics={translated} />
                <Button variant="outline" onClick={swapLanguages} className="w-full">
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