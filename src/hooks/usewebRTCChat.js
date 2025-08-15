// src/hooks/useWebRTCChat.js
import { useEffect, useRef, useState } from "react";

export const useWebRTCChat = (userId) => {
  const socketRef = useRef(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!userId) return;

    const socket = new WebSocket(`ws://localhost:8000/ws/webrtc/${userId}`);
    socketRef.current = socket;

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "chat") {
        setMessages((prev) => [...prev, { sender: data.sender, message: data.message }]);
      }
    };

    socket.onclose = () => {
      console.log("WebSocket closed");
    };

    return () => socket.close();
  }, [userId]);

  const sendMessage = (text) => {
    const messageObj = {
      type: "chat",
      sender: userId,
      message: text,
    };
    socketRef.current?.send(JSON.stringify(messageObj));
    setMessages((prev) => [...prev, { sender: userId, message: text }]); // Echo locally
  };

  return { messages, sendMessage };
};