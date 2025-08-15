// src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

// Local static translations
import translationEN from "./locales/en.json";
import translationFR from "./locales/fr.json";
import translationES from "./locales/es.json";
import translationYO from "./locales/yo.json";
import translationIG from "./locales/ig.json";
import translationHA from "./locales/ha.json";
import translationZH from "./locales/zh.json";
import translationURH from "./locales/urh.json";

i18n
  .use(HttpBackend) // load from public/locales if not statically provided
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    debug: false,
    supportedLngs: ["en", "fr", "es", "yo", "ig", "ha", "zh", "urh"],
    resources: {
      en: { translation: translationEN },
      fr: { translation: translationFR },
      es: { translation: translationES },
      yo: { translation: translationYO },
      ig: { translation: translationIG },
      ha: { translation: translationHA },
      zh: { translation: translationZH },
      urh: { translation: translationURH },
    },
    backend: {
      loadPath: "/locales/{{lng}}.json",
    },
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







