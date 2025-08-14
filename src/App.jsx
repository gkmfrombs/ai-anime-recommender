import React, { useState, useCallback, useRef } from "react";
import Spinner from "./components/Spinner";
import ErrorMessage from "./components/ErrorMessage";
import AnimeCard from "./components/AnimeCard";
import "./App.css";

const App = () => {
  const [genre, setGenre] = useState("Shonen");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const dropdownRef = useRef();

  const animeGenres = [
    "Shonen", "Shojo", "Seinen", "Josei", "Isekai",
    "Slice of Life", "Mecha", "Cyberpunk", "Fantasy", "Horror",
    "Mystery", "Thriller", "Romance", "Adventure", "Supernatural",
    "Comedy", "Action", "Drama", "Historical", "Sports",
    "Magical Girl", "Psychological", "Post-Apocalyptic", "Music", "Ecchi"
  ];

  // Toggle dropdown
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  // Select a genre
  const selectGenre = (g) => {
    setGenre(g);
    setDropdownOpen(false);
  };

  // Close dropdown if clicked outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // The existing getRecommendations function (unchanged)
  const getRecommendations = useCallback(async () => {
    if (!genre) {
      setError("Please select a genre first.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setRecommendations([]);
    const prompt = `Suggest three distinct anime recommendations for the "${genre}" genre. For each anime, provide a unique title and a concise, one-paragraph summary.`;
    const schema = {
      type: "OBJECT",
      properties: {
        recommendations: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              title: { type: "STRING" },
              summary: { type: "STRING" }
            },
            required: ["title", "summary"]
          }
        }
      },
      required: ["recommendations"]
    };
    const payload = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json", responseSchema: schema, temperature: 0.8 }
    };
    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || "Server error while fetching recommendations.");
      }
      const result = await response.json();
      const responseText = result?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (responseText) {
        const parsedJson = JSON.parse(responseText);
        setRecommendations(parsedJson.recommendations || []);
      } else {
        throw new Error("Received empty or invalid response from the API.");
      }
    } catch (err) {
      console.error("API call failed:", err);
      setError("❌ Sorry, I couldn't fetch recommendations. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [genre]);

  return (
    <div className="relative min-h-screen bg-gray-900 text-white font-sans p-4 sm:p-6 lg:p-8 overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{ backgroundImage: "url('https://placehold.co/1920x1080/000000/FFFFFF?text=Anime+Collage')" }}
      ></div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-2">
            AI Anime Recommender
          </h1>
          <p className="text-lg text-gray-300">
            Discover your next favorite show, powered by Gemini.
          </p>
        </header>

        {/* Custom Dropdown */}
        <div className="relative mb-8" ref={dropdownRef}>
          <button
            onClick={toggleDropdown}
            className="w-full sm:w-auto bg-gray-700 text-white rounded-lg py-3 px-4 flex justify-between items-center focus:outline-none"
          >
            {genre}
            <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5.23 7.21l4.77 4.77 4.77-4.77 1.06 1.06-5.83 5.83-5.83-5.83z" />
            </svg>
          </button>

          {dropdownOpen && (
            <ul className="absolute z-20 mt-1 w-full bg-gray-800 border border-gray-600 rounded-lg max-h-60 overflow-y-auto shadow-lg">
              {animeGenres.map((g) => (
                <li
                  key={g}
                  className="px-4 py-2 hover:bg-purple-600 cursor-pointer"
                  onClick={() => selectGenre(g)}
                >
                  {g}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Submit Button */}
        <div className="mb-8">
          <button
            onClick={getRecommendations}
            disabled={isLoading}
            className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
          >
            {isLoading ? "Generating..." : "Get Recommendations"}
          </button>
        </div>

        {/* Main Content */}
        <main>
          {isLoading && <Spinner />}
          {error && <ErrorMessage message={error} />}
          {!isLoading && !error && recommendations.length > 0 && (
            <div className="grid grid-cols-1 gap-6">
              {recommendations.map((anime, index) => (
                <AnimeCard key={index} anime={anime} />
              ))}
            </div>
          )}
          {!isLoading && !error && recommendations.length === 0 && (
            <div className="text-center p-8 bg-gray-800 bg-opacity-50 rounded-2xl">
              <p className="text-gray-400 text-xl">
                Your recommendations will appear here. Select a genre and click the button to start!
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
