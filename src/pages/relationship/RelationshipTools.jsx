// src/pages/relationship/RelationshipTools.jsx

import React, { useState } from "react";
import API from "@/api";
import PageWrapper from "@/components/PageWrapper";
import { motion } from "framer-motion";
import { fadeIn, slideUp } from "@/config/animations";

export default function RelationshipTools() {
  const [adviceInput, setAdviceInput] = useState("");
  const [advice, setAdvice] = useState("");

  const [toneInput, setToneInput] = useState("");
  const [tone, setTone] = useState("");

  const [userA, setUserA] = useState("");
  const [userB, setUserB] = useState("");
  const [signal, setSignal] = useState("");

  const [isTyping, setIsTyping] = useState(false);

  // ======================
  // API CALLS
  // ======================
  const getAdvice = async () => {
    try {
      setIsTyping(true);
      const res = await API.post("/relationship/ai/advice", { query: adviceInput });
      setAdvice(res.data.advice);
    } catch (err) {
      console.error("❌ Advice fetch failed:", err);
    } finally {
      setIsTyping(false);
    }
  };

  const analyzeTone = async () => {
    try {
      const res = await API.post("/relationship/ai/sentiment", { message: toneInput });
      setTone(res.data.tone);
    } catch (err) {
      console.error("❌ Tone analysis failed:", err);
    }
  };

  const sendSignal = async () => {
    try {
      const res = await API.post("/relationship/ai/signal-message", {
        user1: { name: userA, interests: ["music", "movies"] },
        user2: { name: userB, interests: ["books", "travel"] },
      });
      setSignal(res.data.message);
    } catch (err) {
      console.error("❌ Signal generation failed:", err);
    }
  };

  // ======================
  // Dynamic Input Styling
  // ======================
  const getInputClasses = (value) =>
    `w-full border rounded p-3 transition text-base 
     ${value.trim()
       ? "bg-white text-black placeholder-gray-500"
       : "bg-gray-900 text-white placeholder-gray-400"} 
     focus:ring-2 focus:ring-blue-500 outline-none`;

  return (
    <PageWrapper>
      <motion.div
        className="max-w-4xl mx-auto p-4 md:p-6 space-y-10"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={fadeIn}
      >
        <h2 className="text-2xl md:text-3xl font-bold text-center">
          💖 Relationship AI Tools
        </h2>

        {/* 💬 Relationship Advice */}
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4 md:p-6 space-y-4"
          variants={slideUp}
        >
          <h3 className="text-lg md:text-xl font-semibold">💬 Relationship Advice</h3>
          <textarea
            rows={4}
            placeholder="Ask your relationship question..."
            value={adviceInput}
            onChange={(e) => setAdviceInput(e.target.value)}
            className={getInputClasses(adviceInput)}
          />
          <button
            onClick={getAdvice}
            className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
          >
            Get Advice
          </button>
          {isTyping && (
            <p className="text-sm text-gray-500 animate-pulse">AI is typing...</p>
          )}
          {advice && (
            <div className="mt-2 bg-gray-100 dark:bg-gray-700 border-l-4 border-blue-500 p-4 rounded">
              <strong>Advice:</strong> {advice}
            </div>
          )}
        </motion.div>

        {/* 🧠 Tone Analyzer */}
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4 md:p-6 space-y-4"
          variants={slideUp}
        >
          <h3 className="text-lg md:text-xl font-semibold">🧠 Tone Analyzer</h3>
          <input
            type="text"
            placeholder="Type a message to analyze..."
            value={toneInput}
            onChange={(e) => setToneInput(e.target.value)}
            className={getInputClasses(toneInput)}
          />
          <button
            onClick={analyzeTone}
            className="w-full md:w-auto px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
          >
            Analyze Tone
          </button>
          {tone && (
            <div className="mt-2 bg-gray-100 dark:bg-gray-700 border-l-4 border-green-500 p-4 rounded">
              <strong>Detected Tone:</strong> {tone}
            </div>
          )}
        </motion.div>

        {/* 🔔 Match Signal Generator */}
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4 md:p-6 space-y-4"
          variants={slideUp}
        >
          <h3 className="text-lg md:text-xl font-semibold">🔔 Match Signal Generator</h3>
          <input
            placeholder="User A Name"
            value={userA}
            onChange={(e) => setUserA(e.target.value)}
            className={getInputClasses(userA)}
          />
          <input
            placeholder="User B Name"
            value={userB}
            onChange={(e) => setUserB(e.target.value)}
            className={`${getInputClasses(userB)} mt-2`}
          />
          <button
            onClick={sendSignal}
            className="w-full md:w-auto px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition"
          >
            Generate Signal
          </button>
          {signal && (
            <div className="mt-2 bg-gray-100 dark:bg-gray-700 border-l-4 border-purple-500 p-4 rounded">
              <strong>Signal Message:</strong> {signal}
            </div>
          )}
        </motion.div>
      </motion.div>
    </PageWrapper>
  );
}