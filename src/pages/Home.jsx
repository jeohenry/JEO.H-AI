// src/pages/Home.jsx

import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  FaComments, FaHeartbeat, FaMusic, 
  FaGlobe, FaChartLine, FaPalette 
} from "react-icons/fa";

export default function Home() {
  const features = [
    { name: "AI Chat", icon: FaComments, path: "/chat", description: "Intelligent conversations" },
    { name: "Health AI", icon: FaHeartbeat, path: "/health", description: "Health analysis & advice" },
    { name: "Music AI", icon: FaMusic, path: "/music", description: "Music creation & mixing" },
    { name: "Translation", icon: FaGlobe, path: "/translate", description: "50+ languages supported" },
    { name: "Predictions", icon: FaChartLine, path: "/predict", description: "AI-powered forecasting" },
    { name: "Content Creator", icon: FaPalette, path: "/content", description: "Creative AI assistance" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center py-20 px-4 md:px-8"
      >
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-pink-500 to-rose-600 bg-clip-text text-transparent mb-6">
          JEO.H AI
        </h1>
        <p className="text-lg md:text-xl lg:text-2xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto mb-8">
          Your intelligent all-in-one AI assistant for chat, health, music, translation, and creative content.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link to="/chat">
            <Button size="lg" className="w-full sm:w-auto">Start Chatting</Button>
          </Link>
          <Link to="/relationship/profile">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">View Profile</Button>
          </Link>
        </div>
      </motion.div>

      {/* Features Grid */}
      <div className="px-4 md:px-8 lg:px-16 pb-20">
        <motion.h2 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-2xl md:text-3xl font-bold text-center mb-12 text-gray-800 dark:text-white"
        >
          Explore AI Modules
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index + 1) }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl text-pink-500 mb-4">
                      <Icon />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">{feature.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{feature.description}</p>
                    <Link to={feature.path} className="w-full">
                      <Button className="w-full flex items-center justify-center gap-2 group">
                        <motion.span
                          whileHover={{ rotate: 15, scale: 1.2 }}
                          transition={{ type: "spring", stiffness: 300 }}
                          className="text-lg text-pink-500"
                        >
                          <Icon />
                        </motion.span>
                        <span>Open {feature.name}</span>
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}