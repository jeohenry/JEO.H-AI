// src/hooks/usewebRTCChat.js
import { useEffect, useRef, useState } from "react";

// Base URL from env or fallback to localhost
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

// Convert http/https → ws/wss
const WS_BASE = API_BASE.replace(
  /^http/,
  window.location.protocol === "https:" ? "wss" : "ws"
);

export const useWebRTCChat = (userId) => {
  const socketRef = useRef(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!userId) return;

    const socket = new WebSocket(`${WS_BASE}/ws/webrtc/${userId}`);
    socketRef.current = socket;

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "chat") {
        setMessages((prev) => [
          ...prev,
          { sender: data.sender, message: data.message },
        ]);
      }
    };

    socket.onclose = () => {
      console.log("WebSocket closed");
    };

    return () => socket.close();
  }, [userId]);

  const sendMessage = (text) => {
    const messageObj = { type: "chat", sender: userId, message: text };
    socketRef.current?.send(JSON.stringify(messageObj));
    setMessages((prev) => [...prev, { sender: userId, message: text }]); // Echo locally
  };

  return { messages, sendMessage };
};
