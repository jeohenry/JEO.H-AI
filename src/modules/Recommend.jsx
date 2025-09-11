//src/modules/Recommend.jsx

import React, { useState } from "react";
import API from "@/api"; // ✅ Unified axios instance
import PageWrapper from "../components/PageWrapper";
import RecommendCard from "../components/RecommendCard";
import { motion } from "framer-motion";
import { slideUp } from "../config/animations";

const Recommend = () => {
  const [interest, setInterest] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchRecommendations = async () => {
    if (!interest.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await API.post("/recommend/", { interests: interest });
      setRecommendations(res.data.recommendations || []);
    } catch (err) {
      setError("❌ Something went wrong. Please try again.");
      console.error("Error fetching recommendations:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <motion.div
        className="min-h-screen p-4 sm:p-6 lg:p-10 max-w-6xl mx-auto space-y-8"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={slideUp}
      >
        <h1 className="text-3xl md:text-4xl font-bold text-center">
          🧠 Smart Recommender
        </h1>

        {/* Input + Button */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-end">
          <input
            type="text"
            placeholder="💡 Enter your interest (e.g., AI, Books, Fitness)"
            className="p-3 md:p-4 border rounded-lg w-full 
                       focus:outline-none focus:ring-2 focus:ring-blue-500
                       bg-white text-black placeholder-gray-400
                       dark:bg-gray-900 dark:text-white dark:placeholder-gray-500
                       transition"
            value={interest}
            onChange={(e) => setInterest(e.target.value)}
          />
          <button
            onClick={fetchRecommendations}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg 
                       hover:bg-blue-700 transition disabled:opacity-50 
                       text-sm md:text-base"
            disabled={loading}
          >
            {loading ? "🔄 Loading..." : "🚀 Get Recommendations"}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-red-500 text-center font-medium">{error}</p>
        )}

        {/* Results */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {recommendations.map((item, index) => (
            <motion.div
              key={index}
              variants={slideUp}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <RecommendCard content={item} index={index} />
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {recommendations.length === 0 && !loading && (
          <p className="text-center text-gray-500 mt-10">
            ✨ No recommendations yet.
          </p>
        )}
      </motion.div>
    </PageWrapper>
  );
};

export default Recommend;