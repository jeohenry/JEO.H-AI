// src/pages/relationship/ChatRoom.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import API from "@/api"; // ✅ Shared API import from first code
import ChatBox from "@/components/ChatBox";
import PageWrapper from "@/components/PageWrapper";
import { useWebRTCChat } from "@/hooks/useWebRTCChat";
import { useStreamAI } from "@/hooks/useStreamAI";

const ChatRoom = () => {
  const [matches, setMatches] = useState([]);
  const [aiPrompt, setAiPrompt] = useState("");
  const navigate = useNavigate();
  const userId = localStorage.getItem("user_id");

  // ✅ Unified backend chat WebSocket hook
  const {
    messages: groupMessages,
    sendMessage,
    connectionStatus,
  } = useWebRTCChat(userId, "/api/chat/ws");

  // ✅ AI streaming hook
  const {
    response: aiResponse,
    loading: aiLoading,
    error: aiError,
    fetchAIResponse,
    abort: abortAI,
  } = useStreamAI({ userId });

  // ✅ Fetch matches from unified backend
  useEffect(() => {
    if (!userId) return navigate("/relationship/login");

    API.get(`/api/relationship/match/compatible/${userId}`)
      .then((res) => setMatches(res.data.matches))
      .catch((err) => console.error("Error fetching matches:", err));
  }, [userId, navigate]);

  // ✅ Handle AI Submit
  const handleAISubmit = (e) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    // Broadcast user’s question
    sendMessage({
      translated_text: aiPrompt,
      original_text: aiPrompt,
      sender: userId,
    });

    // Stream AI response
    fetchAIResponse({
      prompt: aiPrompt,
      stream: true,
      outputType: "text",
      onData: (chunk) => {
        sendMessage({
          translated_text: chunk,
          original_text: chunk,
          sender: "AI",
          partial: true,
        });
      },
      onDone: () => {
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
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            💑 Private Chats
          </h2>
          {matches.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">
              No matches found.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
              {matches.map((m) => (
                <motion.div
                  key={m.id}
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center justify-between border p-4 rounded-xl shadow-sm 
                             bg-white dark:bg-gray-800 transition"
                >
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white">
                      {m.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      @{m.username}
                    </p>
                  </div>
                  <button
                    className="bg-blue-600 text-white px-4 py-1 rounded-lg hover:bg-blue-700"
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
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            💬 Group Chat
          </h2>

          {/* Connection status */}
          <div
            className={`px-3 py-1 rounded-md text-sm font-medium inline-block ${
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

          {/* Chat UI */}
          <ChatBox messages={groupMessages} onSend={sendMessage} />

          {/* Group Messages */}
          <div className="space-y-4">
            {groupMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`border rounded-lg p-3 shadow-sm break-words ${
                  msg.sender === "AI"
                    ? "bg-purple-50 dark:bg-purple-900 border-purple-200"
                    : "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                }`}
              >
                <p className="text-gray-900 dark:text-gray-100">
                  {msg.translated_text}
                </p>

                {msg.translated_text !== msg.original_text && (
                  <details className="text-sm text-gray-600 dark:text-gray-300 mt-2">
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

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  — {msg.sender === "AI" ? "🤖 AI" : `@${msg.sender}`}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 🧠 AI Input Box */}
        <div className="space-y-4 border-t pt-6 mt-8">
          <h2 className="text-2xl font-bold text-purple-700 dark:text-purple-400">
            🧠 Ask AI in Group
          </h2>
          <form
            onSubmit={handleAISubmit}
            className="flex flex-col sm:flex-row gap-2"
          >
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Ask something smart..."
              className="flex-1 border-2 border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 px-4 py-3 rounded-lg 
                         bg-white text-gray-900 placeholder-gray-500 
                         dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-400 
                         shadow-sm transition-all duration-200"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={aiLoading}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {aiLoading ? "Thinking..." : "Ask AI"}
              </button>
              <button
                type="button"
                onClick={abortAI}
                className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600"
              >
                Stop
              </button>
            </div>
          </form>
          {aiError && <p className="text-red-500">⚠️ {aiError}</p>}
        </div>
      </motion.div>
    </PageWrapper>
  );
};

export default ChatRoom;