// src/components/PageWrapper.jsx
import React from "react";
import { motion } from "framer-motion";
import { defaultPageTransition } from "../config/animations";

const PageWrapper = ({ children, animation = defaultPageTransition }) => (
  <motion.div
    initial={animation.initial}
    animate={animation.animate}
    exit={animation.exit}
    transition={animation.transition}
  >
    {children}
  </motion.div>
);

export default PageWrapper;


