// utils/langDetect.js
export const detectLanguage = () => {
  if (typeof navigator !== "undefined") {
    return navigator.language.split("-")[0]; // "en", "fr", etc.
  }
  return "en";
};