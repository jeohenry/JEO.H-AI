// src/components/ScrollFadeIn.jsx
import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { animations } from "@/config/Animations";

const ScrollFadeIn = ({
  children,
  variant = "slideUp", // default variant
  duration,             // optional override
  delay = 0,
  once = true,
  margin = "0px 0px -100px 0px",
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin });

  // Pull variant from animations.js
  const selected = animations[variant] || animations.slideUp;

  // Allow duration override if passed
  const motionConfig = {
    ...selected,
    transition: {
      ...selected.transition,
      duration: duration ?? selected.transition.duration,
      delay,
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="initial"
      animate={isInView ? "animate" : "initial"}
      exit="exit"
      {...motionConfig}
    >
      {children}
    </motion.div>
  );
};

export default ScrollFadeIn;
