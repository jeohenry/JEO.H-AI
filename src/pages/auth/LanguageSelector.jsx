// src/pages/relationship/LanguageSelector.jsx

import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PageWrapper from "@/components/PageWrapper";
import { scaleFade } from "@/config/animations";
import { playGreetingVoice } from "@/api/voice"; // Adjust path as needed

const languages = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "es", label: "Español" },
  { code: "yo", label: "Yorùbá" },
  { code: "ig", label: "Igbo" },
  { code: "ha", label: "Hausa" },
  { code: "zh", label: "中文" },
  { code: "urh", label: "Urhobo" },
];

const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  const handleLanguageSelect = async (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem("i18nextLng", code);
    
    try {
      await playGreetingVoice("Welcome to JEO.H AI", code);
    } catch (error) {
      console.error("Voice greeting failed:", error);
    }

    navigate("/relationship/login");
  };

  return (
    <PageWrapper animation={scaleFade}>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-100 to-purple-200 dark:from-gray-900 dark:to-black transition-colors duration-500">
        <h1 className="text-4xl font-bold mb-8 text-gray-800 dark:text-white drop-shadow">
          Select Your Language
        </h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-[90%] max-w-md">
          {languages.map(({ code, label }) => (
            <button
              key={code}
              onClick={() => handleLanguageSelect(code)}
              className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl py-3 px-4 shadow-md hover:scale-105 transform transition-transform duration-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
};

export default LanguageSelector;









