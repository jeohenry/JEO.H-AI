// src/components/ChatBox.jsx
import React, { useState } from "react";

const ChatBox = ({ messages, onSend }) => {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (text.trim()) {
      onSend(text);
      setText("");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-2 bg-gray-50">
        {messages.map((msg, index) => (
          <p
            key={index}
            className={`p-2 my-1 rounded max-w-xs ${
              msg.fromMe ? "bg-blue-100 ml-auto" : "bg-gray-200"
            }`}
          >
            {msg.text}
          </p>
        ))}
      </div>
      <div className="p-2 border-t bg-white flex gap-2">
        <input
          className="flex-1 border p-2 rounded"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 text-white px-4 py-1 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
