// src/components/FlagButton.jsx
import React from "react";
import API from "@/api";
import { Flag } from "lucide-react";

function FlagButton({ contentId, contentType }) {
  const handleFlag = async () => {
    const reason = prompt("Why are you flagging this content?");
    if (reason) {
      try {
        await API.post("/flag", {
          content_id: contentId,
          content_type: contentType,
          reason,
        });
        alert("🚩 Flag submitted successfully.");
      } catch (err) {
        console.error("Flag error:", err);
        alert("⚠️ Error submitting flag.");
      }
    }
  };

  return (
    <button
      onClick={handleFlag}
      className="hover:text-red-600 dark:hover:text-red-400 hover:scale-110 transition transform duration-150"
      title="Report"
    >
      <Flag size={20} />
    </button>
  );
}

export default FlagButton;