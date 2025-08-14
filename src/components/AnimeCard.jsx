// components/AnimeCard.jsx
import React from "react";

const AnimeCard = ({ anime }) => (
  <div className="bg-gray-800 bg-opacity-70 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
    <div className="p-6">
      <h3 className="text-2xl font-bold text-purple-300 mb-3">{anime.title}</h3>
      <p className="text-gray-300 leading-relaxed">{anime.summary}</p>
    </div>
  </div>
);

export default AnimeCard;
