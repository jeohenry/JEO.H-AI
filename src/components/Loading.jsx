// src/components/Loading.jsx
import React from "react";
import { motion } from "framer-motion";

const Loading = ({ message = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* Spinner */}
      <motion.div
        className="h-14 w-14 border-4 border-blue-500 border-t-transparent rounded-full"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      />

      {/* Message */}
      <motion.p
        className="text-gray-700 text-lg font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, repeat: Infinity, repeatType: "reverse" }}
      >
        {message}
      </motion.p>
    </div>
  );
};

export default Loading;