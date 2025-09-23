//src/pages/relationship/TranslatedFeed.jsx
import React, { useEffect, useState } from "react";
import axios from "@/api";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

const TranslatedFeed = () => {
  const [posts, setPosts] = useState([]);
  const { i18n } = useTranslation();
  const lang = i18n.language || "en";

  // --- Load feed initially ---
  const loadFeed = async () => {
    try {
      const res = await axios.get(`${API_BASE}/feed?lang=${lang}`);
      setPosts(res.data);
    } catch (err) {
      console.error("Error loading feed:", err);
    }
  };

  useEffect(() => {
    loadFeed();
  }, [lang]);

  // --- WebSocket connection ---
  useEffect(() => {
    const wsUrl = API_BASE.replace(/^http/, "ws") + `/webrtc/ws/feed-client`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "comment_added") {
          setPosts((prev) =>
            prev.map((post) =>
              post.id === data.post_id
                ? { ...post, comment_count: post.comment_count + 1 }
                : post
            )
          );
        }
      } catch (err) {
        console.error("WS error:", err);
      }
    };

    return () => ws.close();
  }, []);

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-3xl mx-auto">
      {posts.map((post) => (
        <div
          key={post.id}
          className="p-4 sm:p-6 bg-white dark:bg-gray-900 
                     rounded-2xl shadow-lg space-y-2 
                     text-gray-900 dark:text-gray-100"
        >
          <p className="text-xs text-gray-500 dark:text-gray-400">
            🌐 Lang: {post.lang}
          </p>
          <p className="font-semibold">{post.translated}</p>

          <details className="text-sm mt-2 cursor-pointer">
            <summary className="text-blue-500">Show original</summary>
            <p className="mt-1">{post.original}</p>
          </details>

          {/* ✅ Live-updating comment count */}
          <div className="mt-3 flex items-center justify-between text-sm">
            <Link
              to={`/post/${post.id}`}
              className="text-blue-600 hover:underline"
            >
              💬 {post.comment_count}{" "}
              {post.comment_count === 1 ? "comment" : "comments"}
            </Link>
            <span className="text-gray-400 text-xs">Post ID: {post.id}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TranslatedFeed;