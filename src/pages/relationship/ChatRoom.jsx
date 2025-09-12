// src/pages/relationship/ChatRoom.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "@/api";
import ChatBox from "@/components/ChatBox";
import PageWrapper from "@/components/PageWrapper";
import { useWebRTCChat } from "@/hooks/useWebRTCChat";
import { useStreamAI } from "@/hooks/useStreamAI"; // ✅ Import the hook

const ChatRoom = () => {
  const [matches, setMatches] = useState([]);
  const [aiPrompt, setAiPrompt] = useState("");
  const navigate = useNavigate();
  const userId = localStorage.getItem("user_id");

  const {
    messages: groupMessages,
    sendMessage,
    connectionStatus,
  } = useWebRTCChat(userId);

  const {
    response: aiResponse,
    loading: aiLoading,
    error: aiError,
    fetchAIResponse,
    reset: resetAI,
    abort: abortAI,
  } = useStreamAI({ userId });

  useEffect(() => {
    if (!userId) return navigate("/relationship/login");

    axios
      .get(`/relationship/match/compatible/${userId}`)
      .then((res) => setMatches(res.data.matches));
  }, []);

  const handleAISubmit = (e) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    // ✅ Broadcast the user’s question as a group message
    sendMessage({
      translated_text: aiPrompt,
      original_text: aiPrompt,
      sender: userId,
    });

    // ✅ Request AI streaming answer
    fetchAIResponse({
      prompt: aiPrompt,
      stream: true,
      outputType: "text",
      onData: (chunk) => {
        // Send incremental AI chunks into chat
        sendMessage({
          translated_text: chunk,
          original_text: chunk,
          sender: "AI",
          partial: true, // mark as streaming
        });
      },
      onDone: () => {
        // Send final AI response into chat
        sendMessage({
          translated_text: aiResponse,
          original_text: aiResponse,
          sender: "AI",
        });
      },
    });

    setAiPrompt("");
  };

  return (
    <PageWrapper>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-6xl mx-auto px-4 py-6 space-y-10"
      >
        {/* 💑 Private Chats */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">💑 Private Chats</h2>
          {matches.length === 0 ? (
            <p className="text-gray-500">No matches found.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {matches.map((m) => (
                <motion.div
                  key={m.id}
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center justify-between border p-4 rounded-lg shadow bg-white"
                >
                  <div>
                    <p className="font-semibold text-gray-800">{m.name}</p>
                    <p className="text-sm text-gray-500">@{m.username}</p>
                  </div>
                  <button
                    className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
                    onClick={() => navigate(`/relationship/chat/${m.id}`)}
                  >
                    Chat
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* 💬 Group Chat */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">💬 Group Chat</h2>

          {/* ✅ Show connection status */}
          <div
            className={`px-3 py-1 rounded text-sm font-medium inline-block ${
              connectionStatus === "connected"
                ? "bg-green-100 text-green-700"
                : connectionStatus === "reconnecting"
                ? "bg-yellow-100 text-yellow-700 animate-pulse"
                : connectionStatus === "connecting"
                ? "bg-blue-100 text-blue-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {connectionStatus === "connected" && "🟢 Connected"}
            {connectionStatus === "reconnecting" && "🟡 Reconnecting..."}
            {connectionStatus === "connecting" && "🔵 Connecting..."}
            {connectionStatus === "disconnected" && "🔴 Disconnected"}
          </div>

          <ChatBox messages={groupMessages} onSend={sendMessage} />

          {/* ✅ Group Messages with Translation Toggle + Voice */}
          <div className="space-y-4">
            {groupMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`border rounded-lg p-3 shadow-sm ${
                  msg.sender === "AI"
                    ? "bg-purple-50 border-purple-200"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <p className="text-gray-800">{msg.translated_text}</p>

                {msg.translated_text !== msg.original_text && (
                  <details className="text-sm text-gray-500 mt-2">
                    <summary className="cursor-pointer hover:underline">
                      View Original
                    </summary>
                    <p className="mt-1">{msg.original_text}</p>
                  </details>
                )}

                {msg.voice_url && (
                  <audio controls className="w-full mt-2">
                    <source src={msg.voice_url} type="audio/mpeg" />
                  </audio>
                )}

                {/* ✅ Show sender */}
                <p className="text-xs text-gray-500 mt-2">
                  — {msg.sender === "AI" ? "🤖 AI" : `@${msg.sender}`}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 🧠 AI Input Box */}
        <div className="space-y-4 border-t pt-6 mt-8">
          <h2 className="text-2xl font-bold text-purple-700">
            🧠 Ask AI in Group
          </h2>
          <form onSubmit={handleAISubmit} className="flex gap-2">
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Ask something smart..."
              className="flex-1 border-2 border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 px-4 py-3 rounded-lg bg-white shadow-sm transition-all duration-200 placeholder-gray-500 text-gray-800"
            />
            <button
              type="submit"
              disabled={aiLoading}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              {aiLoading ? "Thinking..." : "Ask AI"}
            </button>
            <button
              type="button"
              onClick={abortAI}
              className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
            >
              Stop
            </button>
          </form>
          {aiError && <p className="text-red-500">⚠️ {aiError}</p>}
        </div>
      </motion.div>
    </PageWrapper>
  );
};

export default ChatRoom;