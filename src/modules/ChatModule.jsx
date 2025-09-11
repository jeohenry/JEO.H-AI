// src/modules/ChatModule.jsx
import React, { useState } from 'react';
import PageWrapper from '@/components/PageWrapper';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';
import { slideUp } from '@/config/animations';

const API_BASE = `${import.meta.env.VITE_API_BASE}/chat`;

const ChatModule = () => {
  const [messages, setMessages] = useState([
    { from: 'ai', text: '👋 Hello! I am JEO.H AI. How can I assist you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const userId = localStorage.getItem('user_id') || 'guest_user';

  const handleAIStream = async () => {
    if (!input.trim()) return;
    const userMessage = { from: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.text, user_id: userId })
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      let aiMessage = { from: "ai", text: "" };
      setMessages(prev => [...prev, aiMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });

        setMessages(prev => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last && last.from === "ai") {
            last.text += chunk;
          }
          return updated;
        });
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { from: "ai", text: "❌ Stream error." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleAIStream();
  };

  return (
    <PageWrapper>
      <motion.div
        className="p-4 md:p-6 max-w-4xl mx-auto space-y-4 md:space-y-6 h-full"
        variants={slideUp}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <h2 className="text-xl md:text-2xl font-bold text-center text-indigo-700 dark:text-indigo-400">
          💬 Chat with JEO.H AI
        </h2>

        <Card className="h-[60vh] md:h-[500px] shadow-md">
          <CardContent className="flex flex-col h-full p-3 md:p-6">
            {/* Chat Messages */}
            <ScrollArea className="flex-1 overflow-y-auto pr-2 space-y-3">
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className={`rounded-xl px-3 md:px-4 py-2 md:py-3 text-sm md:text-base max-w-[85%] md:max-w-[80%] whitespace-pre-wrap ${
                    msg.from === 'user'
                      ? 'ml-auto bg-blue-500 text-white text-right'
                      : 'bg-gray-200 dark:bg-gray-700 text-left dark:text-white'
                  }`}
                >
                  {msg.text}
                </motion.div>
              ))}
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-gray-200 dark:bg-gray-700 rounded-xl px-3 md:px-4 py-2 md:py-3 text-sm md:text-base max-w-[80%] flex items-center gap-2"
                >
                  <div className="animate-pulse">🤖 AI is thinking...</div>
                </motion.div>
              )}
            </ScrollArea>

            {/* Input Area */}
            <div className="flex gap-2 mt-3 md:mt-4">
              <Input
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                className="flex-1 text-sm md:text-base 
                           bg-white text-black placeholder-gray-500
                           dark:bg-gray-900 dark:text-white dark:placeholder-gray-400"
              />
              <Button 
                onClick={handleAIStream} 
                disabled={loading}
                className="px-3 md:px-4 text-sm md:text-base"
              >
                {loading ? '⏳' : '📤'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </PageWrapper>
  );
};

export default ChatModule;