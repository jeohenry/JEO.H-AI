// src/config/animations.js

// 🔹 General-purpose variants
export const pageFade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 }
};

// 🔹 Alias for backward compatibility
export const fadeIn = pageFade;

export const slideUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -40 },
  transition: { duration: 0.4, ease: "easeOut" }
};

export const slideDown = {
  initial: { opacity: 0, y: -40 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 40 },
  transition: { duration: 0.4, ease: "easeOut" }
};

export const slideLeft = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
  transition: { duration: 0.5, ease: "easeInOut" }
};

export const slideRight = {
  initial: { opacity: 0, x: -40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 40 },
  transition: { duration: 0.5, ease: "easeInOut" }
};

export const scaleFade = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: 0.3 }
};

// 🔹 Animation map for easier dynamic access
export const animations = {
  fade: pageFade,
  fadeIn,     // 👈 backward-compatible alias
  slideUp,
  slideDown,
  slideLeft,
  slideRight,
  scaleFade,
};

// 🔹 Set your default animation globally
export const defaultPageTransition = animations.slideUp;