// src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
  .use(HttpBackend) // fetches translations from /public/locales/{{lng}}.json
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    debug: false,
    supportedLngs: ["en", "fr", "es", "yo", "ig", "ha", "zh", "urh"],

    // ✅ Using flat structure: /public/locales/en.json, /public/locales/fr.json, etc.
    backend: {
      loadPath: "/locales/{{lng}}.json",
    },

    ns: ["translation"],        // default namespace name
    defaultNS: "translation",   // ensures i18n uses these flat files

    detection: {
      order: ["localStorage", "navigator", "htmlTag", "querystring", "cookie"],
      caches: ["localStorage"],
    },
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: true,
    },
  });

export default i18n;