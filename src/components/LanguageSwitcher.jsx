// src/components/LanguageSwitcher.jsx
import React from "react";
import { useTranslation } from "react-i18next";

const supportedLanguages = {
  en: "English 🇬🇧",
  fr: "Français 🇫🇷",
  es: "Español 🇪🇸",
  de: "Deutsch 🇩🇪",
  zh: "中文 🇨🇳",
  ja: "日本語 🇯🇵",
  hi: "हिंदी 🇮🇳",
  ar: "العربية 🇸🇦",
  ru: "Русский 🇷🇺",
  pt: "Português 🇧🇷",
  // Add more here
};

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  return (
    <select
      value={i18n.language}
      onChange={(e) => i18n.changeLanguage(e.target.value)}
      className="rounded px-2 py-1 text-sm border"
    >
      {Object.entries(supportedLanguages).map(([code, label]) => (
        <option key={code} value={code}>
          {label}
        </option>
      ))}
    </select>
  );
};

export default LanguageSwitcher;
