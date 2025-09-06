// src/components/PageWrapper.jsx
import React from "react";
import { motion } from "framer-motion";
import { defaultPageTransition } from "../config/animations";
import ScrollFadeIn from "@/components/ScrollFadeIn"; // 👈 Import scroll fade

const PageWrapper = ({ children, animation = defaultPageTransition }) => (
  <motion.div
    initial={animation.initial}
    animate={animation.animate}
    exit={animation.exit}
    transition={animation.transition}
    className="h-full w-full"
  >
    {/* 👇 Wrap children in ScrollFadeIn */}
    <ScrollFadeIn variant="slideUp" delay={0.1}>
      {children}
    </ScrollFadeIn>
  </motion.div>
);

export default PageWrapper;