// 📁 src/components/FlagButton.jsx
import React from "react";
import API from "../api";

function FlagButton({ contentId, contentType }) {
  const handleFlag = async () => {
    const reason = prompt("Why are you flagging this content?");
    if (reason) {
      try {
        await API.post("/api/flag", {
          content_id: contentId,
          content_type: contentType,
          reason,
        });
        alert("Flag submitted successfully.");
      } catch (err) {
        alert("Error submitting flag.");
      }
    }
  };

  return (
    <button onClick={handleFlag} className="text-red-500 underline text-sm ml-2">
      Report
    </button>
  );
}

export default FlagButton;
