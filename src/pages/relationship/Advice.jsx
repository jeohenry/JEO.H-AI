//src/pages/relationship/Advice.jsx

import React, { useState, useRef, useEffect } from "react";
import axios from "@/api";
import { motion } from "framer-motion";
import PageWrapper from "../components/PageWrapper";
import {
  FiMic,
  FiMicOff,
  FiShare2,
  FiSave,
  FiSun,
  FiMoon,
  FiDownload,
  FiRefreshCw,
} from "react-icons/fi";
import confetti from "canvas-confetti";
import { jsPDF } from "jspdf";

const Advice = () => {
  const [query, setQuery] = useState("");
  const [advice, setAdvice] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [adviceHistory, setAdviceHistory] = useState([]);
  const [adviceLoading, setAdviceLoading] = useState(false);
  const [adviceError, setAdviceError] = useState("");

  const [toneMsg, setToneMsg] = useState("");
  const [toneResult, setToneResult] = useState("");
  const [toneLoading, setToneLoading] = useState(false);
  const [toneError, setToneError] = useState("");

  const [listening, setListening] = useState(false);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) return;

    const SpeechRecognition = window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuery((prev) => prev + " " + transcript);
    };

    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
  }, []);

  const toggleMic = () => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
    } else {
      recognitionRef.current?.start();
      setListening(true);
    }
  };

  const getAdvice = async () => {
    setAdviceLoading(true);
    setAdviceError("");
    setAdvice("");
    setFollowUp("");
    try {
      const res = await axios.post("/relationship/advice", { question: query });
      const newAdvice = res.data.advice || "No advice returned.";
      setAdvice(newAdvice);

      // Confetti
      confetti({ particleCount: 120, spread: 70 });

      // Save to DB
      await axios.post("/relationship/save-advice", {
        question: query,
        advice: newAdvice,
      });

      // Get follow-up question
      const followRes = await axios.post("/relationship/follow-up", {
        advice: newAdvice,
      });
      setFollowUp(followRes.data.followup || "");

      // Update history
      setAdviceHistory((prev) => [
        { question: query, advice: newAdvice },
        ...prev.slice(0, 4),
      ]);
    } catch (err) {
      console.error("Advice fetch failed:", err);
      setAdviceError("Failed to fetch advice. Please try again.");
    } finally {
      setAdviceLoading(false);
    }
  };

  const analyzeTone = async () => {
    setToneLoading(true);
    setToneError("");
    setToneResult("");
    try {
      const res = await axios.post("/relationship/sentiment", {
        message: toneMsg,
      });
      setToneResult(res.data.tone || "No tone detected.");
    } catch (err) {
      console.error("Tone analysis failed:", err);
      setToneError("Failed to analyze tone. Please try again.");
    } finally {
      setToneLoading(false);
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Relationship Advice", 20, 20);
    doc.setFontSize(12);
    doc.text(`Question:\n${query}`, 20, 40);
    doc.text(`Advice:\n${advice}`, 20, 60);
    if (followUp) doc.text(`Follow-up:\n${followUp}`, 20, 80);
    doc.save("relationship_advice.pdf");
  };

  const shareAdvice = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Relationship Advice",
          text: `${query}\n\nAdvice:\n${advice}`,
        });
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      alert("Sharing not supported on this device.");
    }
  };

  const toggleTheme = () => setDarkMode(!darkMode);

  return (
    <div
      className={`min-h-screen transition ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800"
      }`}
    >
      <PageWrapper>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto px-4 py-8 space-y-12"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">❤️ Relationship AI Assistant</h1>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-300 dark:hover:bg-gray-700 transition"
            >
              {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
            </button>
          </div>

          {/* 💬 Relationship Advice */}
          <section className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                💬 Relationship Advice
              </h2>
              <button
                onClick={toggleMic}
                className="p-2 rounded-full bg-pink-100 dark:bg-pink-900 text-pink-600 dark:text-white"
              >
                {listening ? <FiMicOff /> : <FiMic />}
              </button>
            </div>
            <textarea
              rows={4}
              placeholder="Ask your relationship question..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
            <button
              onClick={getAdvice}
              disabled={adviceLoading || !query.trim()}
              className={`px-5 py-2 rounded text-white transition ${
                adviceLoading || !query.trim()
                  ? "bg-pink-300 cursor-not-allowed"
                  : "bg-pink-600 hover:bg-pink-700"
              }`}
            >
              {adviceLoading ? "Getting Advice..." : "Get Advice"}
            </button>
            {adviceError && <p className="text-red-500">{adviceError}</p>}
            {advice && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 bg-gray-100 dark:bg-gray-700 border rounded-lg space-y-3"
              >
                <div className="flex items-center justify-between">
                  <strong className="text-pink-700 dark:text-pink-300">
                    Advice:
                  </strong>
                  <div className="flex gap-3 text-gray-700 dark:text-white">
                    <button onClick={downloadPDF}>
                      <FiDownload />
                    </button>
                    <button onClick={shareAdvice}>
                      <FiShare2 />
                    </button>
                    <button onClick={() => setShowFollowUp((prev) => !prev)}>
                      <FiRefreshCw />
                    </button>
                  </div>
                </div>
                <p>{advice}</p>
                {showFollowUp && followUp && (
                  <div className="mt-3 p-3 rounded bg-blue-50 dark:bg-blue-900">
                    <strong>🤖 Follow-up:</strong> <p>{followUp}</p>
                  </div>
                )}
              </motion.div>
            )}
          </section>

          {/* 📜 Advice History */}
          {adviceHistory.length > 0 && (
            <section className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 space-y-2">
              <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-200">
                📜 Your Recent Advice
              </h3>
              <ul className="space-y-2 text-sm">
                {adviceHistory.map((item, idx) => (
                  <li
                    key={idx}
                    className="border-b border-gray-200 dark:border-gray-600 pb-2"
                  >
                    <p>
                      <strong>Q:</strong> {item.question}
                    </p>
                    <p>
                      <strong>A:</strong> {item.advice}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 🧠 Tone Analyzer */}
          <section className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 space-y-4">
            <h2 className="text-2xl font-bold text-gray-700 dark:text-white">
              🧠 Tone Analyzer
            </h2>
            <textarea
              rows={3}
              placeholder="Paste a message to analyze tone..."
              value={toneMsg}
              onChange={(e) => setToneMsg(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
            <button
              onClick={analyzeTone}
              disabled={toneLoading || !toneMsg.trim()}
              className={`px-5 py-2 rounded text-white transition ${
                toneLoading || !toneMsg.trim()
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gray-800 hover:bg-gray-900"
              }`}
            >
              {toneLoading ? "Analyzing..." : "Analyze Tone"}
            </button>
            {toneError && <p className="text-red-500 text-sm">{toneError}</p>}
            {toneResult && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 bg-gray-100 dark:bg-gray-700 border rounded-lg"
              >
                <strong>Detected Tone:</strong>{" "}
                <span className="text-gray-700 dark:text-white">
                  {toneResult}
                </span>
              </motion.div>
            )}
          </section>
        </motion.div>
      </PageWrapper>
    </div>
  );
};

export default Advice;















