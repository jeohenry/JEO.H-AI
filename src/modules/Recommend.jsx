//src/modules/Recommend.jsx

import React, { useState } from "react";
import axios from "@/api";
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
      const res = await axios.post("/recommend", {
        interest,
      });
      setRecommendations(res.data.recommendations || []);
    } catch (err) {
      setError("Something went wrong. Please try again.");
      console.error("Error fetching recommendations:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <motion.div
        className="min-h-screen p-6 max-w-5xl mx-auto space-y-8"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={slideUp}
      >
        <h1 className="text-3xl font-bold text-center">🧠 Smart Recommender</h1>

        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-end">
          <input
            type="text"
            placeholder="💡 Enter your interest (e.g., AI, Books, Fitness)"
            className="p-3 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={interest}
            onChange={(e) => setInterest(e.target.value)}
          />
          <button
            onClick={fetchRecommendations}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? "🔄 Loading..." : "🚀 Get Recommendations"}
          </button>
        </div>

        {error && <p className="text-red-500">{error}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
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

        {recommendations.length === 0 && !loading && (
          <p className="text-center text-gray-500 mt-10">✨ No recommendations yet.</p>
        )}
      </motion.div>
    </PageWrapper>
  );
};

export default Recommend;


