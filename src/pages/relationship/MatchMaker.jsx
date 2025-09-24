//src/pages/relationship/MatchMaker.jsx 

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "@/api";
import MatchSignalBox from "@/components/MatchSignalBox";
import PageWrapper from "@/components/PageWrapper";

const MatchMaker = () => {
  const [matches, setMatches] = useState([]);
  const [signalMessage, setSignalMessage] = useState("");
  const [bgColor, setBgColor] = useState("white"); // Track input bg for text contrast
  const user_id = localStorage.getItem("user_id");

  useEffect(() => {
    if (!user_id) return;
    axios
      .get(`/relationship/match/compatible/${user_id}`)
      .then((res) => setMatches(res.data.matches))
      .catch((err) => console.error("❌ Error fetching matches", err));
  }, [user_id]);

  // Ensure visible text (black on light bg, white on dark bg)
  const getTextColor = (bg) => {
    return bg === "white" ? "text-black" : "text-white";
  };

  const sendSignalToUser = async (receiver_id) => {
    if (!signalMessage.trim()) {
      alert("⚠️ Please enter a message before sending!");
      return;
    }
    try {
      await axios.post("/relationship/match/send", {
        sender_id: user_id,
        receiver_id,
        signal_message: signalMessage,
      });
      alert("💌 Signal sent successfully!");
      setSignalMessage("");
    } catch (err) {
      console.error("❌ Failed to send signal:", err);
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
            {matches.map((match) => (
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

        {/* Input for custom signal message */}
        <div className="mt-10 max-w-xl mx-auto">
          <textarea
            value={signalMessage}
            onChange={(e) => setSignalMessage(e.target.value)}
            placeholder="Write your signal message..."
            className={`w-full p-4 rounded-2xl border shadow-md resize-none transition-colors duration-200 ${
              getTextColor(bgColor)
            }`}
            style={{
              backgroundColor: bgColor,
            }}
            onFocus={() => setBgColor("white")}
            onBlur={() => setBgColor("black")}
            rows={3}
          />
          <button
            onClick={() => alert("⚠️ Select a user to send a signal!")}
            className="w-full mt-3 px-6 py-3 bg-pink-600 text-white font-semibold rounded-2xl shadow hover:bg-pink-700 transition"
          >
            Send Signal
          </button>
        </div>
      </motion.div>
    </PageWrapper>
  );
};

export default MatchMaker;