// src/modules/ChatModule.jsx

import React, { useState } from 'react';
import PageWrapper from '@/components/PageWrapper';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';
import { slideUp } from '@/config/animations';
import useStreamAI from '@/hooks/useStreamAI';

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
      await useStreamAI({
        prompt: input,
        userId,
        onData: (chunk) => {
          setMessages(prev => {
            const last = prev[prev.length - 1];
            if (last && last.from === 'ai') {
              // Append to last AI message
              const updated = [...prev];
              updated[updated.length - 1].text += chunk;
              return updated;
            } else {
              return [...prev, { from: 'ai', text: chunk }];
            }
          });
        },
        onDone: () => setLoading(false),
        onError: () => {
          setMessages(prev => [
            ...prev,
            { from: 'ai', text: '❌ Error streaming from AI.' }
          ]);
          setLoading(false);
        }
      });
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { from: 'ai', text: '❌ Unexpected error. Please try again later.' }
      ]);
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleAIStream();
  };

  return (
    <PageWrapper>
      <motion.div
        className="p-6 max-w-3xl mx-auto space-y-6"
        variants={slideUp}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <h2 className="text-2xl font-bold text-center text-indigo-700">
          💬 Chat with JEO.H AI
        </h2>

        <Card className="h-[500px] shadow-md">
          <CardContent className="flex flex-col h-full">
            <ScrollArea className="flex-1 overflow-y-auto pr-2 space-y-2">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`rounded-xl px-4 py-2 text-sm max-w-[80%] whitespace-pre-wrap ${
                    msg.from === 'user'
                      ? 'ml-auto bg-blue-100 text-right'
                      : 'bg-gray-200 text-left'
                  }`}
                >
                  {msg.text}
                </div>
              ))}
            </ScrollArea>

            <div className="flex gap-2 mt-4">
              <Input
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                className="flex-1"
              />
              <Button onClick={handleAIStream} disabled={loading}>
                {loading ? '...' : 'Send'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </PageWrapper>
  );
};

export default ChatModule;













