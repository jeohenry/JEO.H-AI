
// src/components/MatchSignalBox.jsx
import React from "react";

const MatchSignalBox = ({ match, onSend }) => {
  return (
    <div className="bg-white p-5 rounded shadow hover:shadow-lg transition duration-300 border">
      <div className="mb-2">
        <h3 className="text-lg font-semibold">{match.name}</h3>
        <p className="text-sm text-gray-500">@{match.username}</p>
      </div>
      <p className="text-sm text-gray-700 mb-4">{match.bio}</p>
      <button
        onClick={onSend}
        className="w-full bg-pink-600 text-white py-2 rounded hover:bg-pink-700 transition"
      >
        Send Signal 💌
      </button>
    </div>
  );
};

export default MatchSignalBox;