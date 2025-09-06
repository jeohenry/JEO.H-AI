//src/pages/relationship/MatchMaker.jsx

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "@/api";
import MatchSignalBox from "@/components/MatchSignalBox";
import PageWrapper from "@/components/PageWrapper";

const MatchMaker = () => {
  const [matches, setMatches] = useState([]);
  const user_id = localStorage.getItem("user_id");

  useEffect(() => {
    if (!user_id) return;

    axios
      .get(`/api/relationship/match/compatible/${user_id}`)
      .then((res) => setMatches(res.data.matches))
      .catch((err) => console.error("Error fetching matches", err));
  }, []);

  const sendSignalToUser = async (receiver_id) => {
    try {
      await axios.post("/api/relationship/match/send", {
        sender_id: user_id,
        receiver_id,
        signal_message: "I feel we're a perfect match! 💕",
      });
      alert("💌 Signal sent successfully!");
    } catch (err) {
      console.error("Failed to send signal:", err);
    }
  };

  return (
    <PageWrapper>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-6xl mx-auto px-4 py-6"
      >
        <h2 className="text-3xl font-bold text-center mb-8 text-pink-600">
          💘 Match Suggestions
        </h2>

        {matches.length === 0 ? (
          <p className="text-center text-gray-600">
            No match suggestions at the moment.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match, i) => (
              <motion.div
                key={match.id}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <MatchSignalBox
                  match={match}
                  onSend={() => sendSignalToUser(match.id)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </PageWrapper>
  );
};

export default MatchMaker;
