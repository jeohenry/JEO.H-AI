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
        className="w-full p-2 border rounded"
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
      </button>
      <div className="mt-4 p-3 bg-gray-100 rounded">
        <strong>JEO.H:</strong>
        <p>{response}</p>
      </div>
    </div>
  );
}

export default SmartChat;
