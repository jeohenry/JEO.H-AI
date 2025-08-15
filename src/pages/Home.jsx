// src/pages/Home.jsx

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";
import PageWrapper from "@/components/PageWrapper";
import { slideUp } from "@/config/animations";
import { detectLanguage } from "@/utils/langDetector";
import { playGreetingVoice } from "@/utils/voice";
import {
  FaRobot,
  FaHeart,
  FaGlobe,
  FaRocket,
  FaLanguage,
  FaVolumeUp,
} from "react-icons/fa";

const getGreetingTime = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  if (hour < 21) return "evening";
  return "night";
};

const modules = [
  { name: "chat", icon: <FaRobot />, path: "/chat" },
  { name: "translate", icon: <FaGlobe />, path: "/translate" },
  { name: "predict", icon: <FaRocket />, path: "/predict" },
  { name: "recommend", icon: <FaHeart />, path: "/recommend" },
];

const supportedLanguages = {
  en: "English",
  fr: "Français",
  ha: "Hausa",
  ig: "Igbo",
  yo: "Yorùbá",
  urh: "Urhobo",
  es: "Español",
  zh: "中文",
};

const Home = () => {
  const { t, i18n } = useTranslation();
  const { darkMode } = useTheme();
  const [lang, setLang] = useState(i18n.language || "en");
  const [greeted, setGreeted] = useState(false);

  const greetingTime = getGreetingTime();

  useEffect(() => {
    const browserLang = detectLanguage();
    if (browserLang && browserLang !== i18n.language) {
      i18n.changeLanguage(browserLang);
      setLang(browserLang);
    }
  }, []);

  useEffect(() => {
    if (!greeted) {
      playGreetingVoice(t("greeting", { time: greetingTime }), lang);
      setGreeted(true);
    }
  }, [lang, greeted]);

  const handleLanguageChange = (e) => {
    const selected = e.target.value;
    setLang(selected);
    i18n.changeLanguage(selected);
    playGreetingVoice(t("greeting", { time: greetingTime }), selected);
  };

  return (
    <PageWrapper animation={slideUp}>
      <div
        className={`min-h-screen px-6 py-10 transition-all duration-500 ${
          darkMode
            ? "bg-gray-900 text-white"
            : "bg-gradient-to-br from-pink-50 via-white to-white text-gray-800"
        }`}
      >
        <div className="max-w-6xl mx-auto">
          {/* Welcome Header */}
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-extrabold mb-2 animate-fade-in-down">
              {t("welcome")}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 animate-fade-in-up">
              {t("greeting", { time: greetingTime })}
            </p>
          </div>

          {/* Language Switcher */}
          <div className="flex justify-center items-center gap-4 mb-10">
            <FaLanguage className="text-xl text-pink-500" />
            <select
              value={lang}
              onChange={handleLanguageChange}
              className="bg-white dark:bg-gray-800 border border-pink-300 dark:border-pink-600 rounded-lg px-3 py-2 focus:outline-none"
            >
              {Object.entries(supportedLanguages).map(([code, label]) => (
                <option key={code} value={code}>
                  {label}
                </option>
              ))}
            </select>
            <button
              onClick={() =>
                playGreetingVoice(t("greeting", { time: greetingTime }), lang)
              }
              className="text-pink-500 hover:text-pink-700 dark:hover:text-pink-300 transition"
              title="Play AI Greeting"
            >
              <FaVolumeUp className="text-xl" />
            </button>
          </div>

          {/* Module Grid */}
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {modules.map((mod) => (
              <a
                href={mod.path}
                key={mod.name}
                className="flex flex-col items-center justify-center border border-pink-200 dark:border-pink-800 bg-white dark:bg-gray-800 hover:bg-pink-100 hover:dark:bg-gray-700 shadow rounded-xl p-6 transition-all duration-300 group"
              >
                <div className="text-3xl mb-3 text-pink-600 group-hover:scale-110 transition-transform duration-200">
                  {mod.icon}
                </div>
                <p className="text-lg font-medium text-center">
                  {t(`modules.${mod.name}`)}
                </p>
              </a>
            ))}
          </div>

          {/* Footer */}
          <footer className="mt-16 text-center text-sm text-gray-400 dark:text-gray-600">
            ❤️ {new Date().getFullYear()} © JEO.H AI — Empowering Human Connections.
          </footer>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Home;








