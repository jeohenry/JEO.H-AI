// src/components/WelcomeGreeting.jsx

import React, { useEffect } from "react";
import { detectLanguage } from "@/utils/langDetector";
import { playGreetingVoice } from "@/services/voice";

const WelcomeGreeting = ({ message = "Welcome to JEO.H AI" }) => {
  useEffect(() => {
    const lang = detectLanguage();
    playGreetingVoice(message, lang);
  }, [message]);

  return null;
};

export default WelcomeGreeting;