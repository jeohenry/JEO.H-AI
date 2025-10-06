// src/modules/ChatModule.jsx
import React, { useState } from "react";
import PageWrapper from "@/components/PageWrapper";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { slideUp } from "@/config/animations";
import API from "@/api"; // ✅ Shared Axios instance

const ChatModule = () => {
  const [messages, setMessages] = useState([
    { from: "ai", text: "👋 Hello! I am JEO.H AI. How can I assist you today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const userId = localStorage.getItem("user_id") || "guest_user";

  const handleAIStream = async () => {
    if (!input.trim()) return;

    const userMessage = { from: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // ✅ Use the Axios instance baseURL for consistency
      const response = await fetch(`${API.defaults.baseURL}/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.text,
          user_id: userId,
        }),
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      // Add placeholder for AI reply
      let aiMessage = { from: "ai", text: "" };
      setMessages((prev) => [...prev, aiMessage]);

      let fullText = "";
      const typeDelay = 20; // ⏳ Typing speed in ms per chunk

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;

        // Smoothly "type" text character by character
        for (let i = 0; i < chunk.length; i++) {
          await new Promise((res) => setTimeout(res, typeDelay));
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last && last.from === "ai") {
              last.text += chunk[i];
            }
            return updated;
          });
        }
      }
    } catch (err) {
      console.error("Stream error:", err);
      setMessages((prev) => [
        ...prev,
        { from: "ai", text: "❌ Error connecting to AI stream." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleAIStream();
  };

  return (
    <PageWrapper>
      <motion.div
        className="p-3 sm:p-4 md:p-6 max-w-5xl mx-auto h-full flex flex-col"
        variants={slideUp}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {/* Header */}
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-center text-indigo-700 dark:text-indigo-400 mb-3 sm:mb-4 md:mb-6">
          💬 Chat with JEO.H AI
        </h2>

        {/* Chat Area */}
        <Card className="flex-1 shadow-md flex flex-col">
          <CardContent className="flex flex-col h-full p-0">
            <ScrollArea className="flex-1 px-2 sm:px-3 md:px-6 py-3 sm:py-4 overflow-y-auto space-y-2 sm:space-y-3">
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className={`rounded-xl px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-3 
                             text-xs sm:text-sm md:text-base max-w-[90%] sm:max-w-[85%] md:max-w-[80%] 
                             whitespace-pre-wrap break-words ${
                    msg.from === "user"
                      ? "ml-auto bg-blue-500 text-white text-right"
                      : "bg-gray-200 dark:bg-gray-700 text-left dark:text-white"
                  }`}
                >
                  {msg.text}
                  {/* Show blinking cursor while loading */}
                  {loading && index === messages.length - 1 && msg.from === "ai" && (
                    <span className="inline-block w-1 h-4 ml-1 bg-gray-500 dark:bg-gray-300 animate-pulse"></span>
                  )}
                </motion.div>
              ))}

              {/* Loader */}
              {loading && messages[messages.length - 1]?.from === "user" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-gray-200 dark:bg-gray-700 rounded-xl px-3 py-2 text-sm max-w-[75%] flex items-center gap-2"
                >
                  <div className="animate-pulse">🤖 AI is typing...</div>
                </motion.div>
              )}
            </ScrollArea>

            {/* Input */}
            <div className="border-t border-gray-300 dark:border-gray-700 p-2 sm:p-3 md:p-4 bg-white dark:bg-gray-900 flex gap-1.5 sm:gap-2">
              <Input
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                className="flex-1 text-xs sm:text-sm md:text-base 
                           bg-white text-black placeholder-gray-500
                           dark:bg-gray-900 dark:text-white dark:placeholder-gray-400"
              />
              <Button
                onClick={handleAIStream}
                disabled={loading}
                className="px-2 sm:px-3 md:px-4 text-xs sm:text-sm md:text-base"
              >
                {loading ? "⏳" : "📤"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </PageWrapper>
  );
};

export default ChatModule;