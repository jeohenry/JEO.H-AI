//src/pages/relationship/RelationshipTools.jsx

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

  const getAdvice = async () => {
    setIsTyping(true);
    const res = await API.post("/relationship/advice", { query: adviceInput });
    setAdvice(res.data.response);
    setIsTyping(false);
  };

  const analyzeTone = async () => {
    const res = await API.post("/relationship/sentiment", { message: toneInput });
    setTone(res.data.response);
  };

  const sendSignal = async () => {
    const res = await API.post("/relationship/signal", {
      user1: { name: userA, interests: ["music", "movies"] },
      user2: { name: userB, interests: ["books", "travel"] },
    });
    setSignal(res.data.response);
  };

  return (
    <PageWrapper>
      <motion.div
        className="max-w-4xl mx-auto p-6 space-y-10"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={fadeIn}
      >
        <h2 className="text-3xl font-bold text-center">💖 Relationship AI Tools</h2>

        {/* 💬 Relationship Advice */}
        <motion.div
          className="bg-white rounded shadow p-6 space-y-4"
          variants={slideUp}
        >
          <h3 className="text-xl font-semibold">💬 Relationship Advice</h3>
          <textarea
            rows={4}
            placeholder="Ask your relationship question..."
            value={adviceInput}
            onChange={(e) => setAdviceInput(e.target.value)}
            className="w-full border p-3 rounded"
          />
          <button
            onClick={getAdvice}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Get Advice
          </button>
          {isTyping && <p className="text-sm text-gray-500 animate-pulse">AI is typing...</p>}
          {advice && (
            <div className="mt-2 bg-gray-100 border-l-4 border-blue-500 p-4 rounded">
              <strong>Advice:</strong> {advice}
            </div>
          )}
        </motion.div>

        {/* 🧠 Tone Analyzer */}
        <motion.div
          className="bg-white rounded shadow p-6 space-y-4"
          variants={slideUp}
        >
          <h3 className="text-xl font-semibold">🧠 Tone Analyzer</h3>
          <input
            type="text"
            placeholder="Type a message to analyze..."
            value={toneInput}
            onChange={(e) => setToneInput(e.target.value)}
            className="w-full border p-3 rounded"
          />
          <button
            onClick={analyzeTone}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            Analyze Tone
          </button>
          {tone && (
            <div className="mt-2 bg-gray-100 border-l-4 border-green-500 p-4 rounded">
              <strong>Detected Tone:</strong> {tone}
            </div>
          )}
        </motion.div>

        {/* 🔔 Match Signal Generator */}
        <motion.div
          className="bg-white rounded shadow p-6 space-y-4"
          variants={slideUp}
        >
          <h3 className="text-xl font-semibold">🔔 Match Signal Generator</h3>
          <input
            placeholder="User A Name"
            value={userA}
            onChange={(e) => setUserA(e.target.value)}
            className="w-full border p-3 rounded"
          />
          <input
            placeholder="User B Name"
            value={userB}
            onChange={(e) => setUserB(e.target.value)}
            className="w-full border p-3 rounded mt-2"
          />
          <button
            onClick={sendSignal}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
          >
            Generate Signal
          </button>
          {signal && (
            <div className="mt-2 bg-gray-100 border-l-4 border-purple-500 p-4 rounded">
              <strong>Signal Message:</strong> {signal}
            </div>
          )}
        </motion.div>
      </motion.div>
    </PageWrapper>
  );
}












