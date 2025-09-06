// src/components/PageWrapper.jsx
import React from "react";
import { motion } from "framer-motion";
import { defaultPageTransition } from "../config/animations";
import ScrollFadeIn from "@/components/ScrollFadeIn"; // ✅ fixed import

const PageWrapper = ({ children, animation = defaultPageTransition }) => (
  <motion.div
    initial={animation.initial}
    animate={animation.animate}
    exit={animation.exit}
    transition={animation.transition}
    className="h-full w-full min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100 transition-colors duration-300"
  >
    {/* 👇 Wrap children in ScrollFadeIn */}
    <ScrollFadeIn variant="slideUp" delay={0.1}>
      {children}
    </ScrollFadeIn>
  </motion.div>
);

export default PageWrapper;