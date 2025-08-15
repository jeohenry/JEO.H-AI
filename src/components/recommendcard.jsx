import React from 'react';

const RecommendCard = ({ content, index }) => (
  <div className="bg-white p-4 shadow rounded">
    <h2 className="font-semibold text-lg mb-2">Recommendation {index + 1}</h2>
    <p>{content}</p>
  </div>
);

export default RecommendCard;