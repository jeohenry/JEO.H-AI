// src/components/SmartChat.jsx
import React, { useState } from "react";
import axios from "axios";

function SmartChat() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8000/chat", {
        prompt: prompt,
        user_id: "user123" // optional
      });
      setResponse(res.data.response);
    } catch (err) {
      setResponse("Error: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-xl font-semibold">JEO.H Smart AI Chat</h2>
      <textarea
        className="w-full p-4 border-2 border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-lg bg-white shadow-sm transition-all duration-200 placeholder-gray-500 text-gray-800"
        rows={4}
        placeholder="Ask JEO.H anything..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={handleSend}
        disabled={loading}
      >
        {loading ? "Thinking..." : "Send"}