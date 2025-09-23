// src/pages/post/TranslatedPost.jsx

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "@/api";
import PageWrapper from "@/components/PageWrapper";
import { motion } from "framer-motion";
import { fadeIn, slideUp } from "@/config/animations";
import { useTranslation } from "react-i18next";

const API_BASE = import.meta.env.VITE_API_BASE;

const TranslatedPost = () => {
  const { id } = useParams();
  const { i18n } = useTranslation();
  const lang = i18n.language || "en";

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --- Load post ---
  const fetchPost = async () => {
    try {
      const res = await axios.get(`${API_BASE}/post/${id}/translated?lang=${lang}`);
      setPost(res.data);
    } catch (err) {
      console.error("Error loading post:", err);
    }
  };

  // --- Load comments ---
  const fetchComments = async () => {
    try {
      const res = await axios.get(`${API_BASE}/comments/${id}?lang=${lang}`);
      setComments(res.data);
    } catch (err) {
      console.error("Error loading comments:", err);
    }
  };

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [id, lang]);

  // --- WebSocket for live updates ---
  useEffect(() => {
    if (!id) return;

    const wsUrl = API_BASE.replace(/^http/, "ws") + `/webrtc/ws/post-${id}`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "comment_added" && data.post_id === parseInt(id)) {
          await fetchComments();
        }
      } catch (err) {
        console.error("WS error:", err);
      }
    };

    return () => ws.close();
  }, [id]);

  // --- Handle new comment submit (Optimistic UI) ---
  const handleSubmit = async () => {
    if (!newComment.trim()) return;

    setLoading(true);
    setError("");

    const tempComment = {
      id: Date.now(),
      user_id: "me",
      translated: newComment,
      original: newComment,
      voice_url: null,
      optimistic: true,
    };
    setComments((prev) => [tempComment, ...prev]);
    setNewComment("");

    try {
      const res = await axios.post(`${API_BASE}/comment/`, {
        post_id: Number(id),
        text: tempComment.original,
      });

      setComments((prev) =>
        prev.map((c) =>
          c.id === tempComment.id
            ? { ...c, ...res.data, optimistic: false }
            : c
        )
      );
    } catch (err) {
      console.error("Failed to post comment:", err);
      setError("❌ Failed to post comment. Please try again.");
      setComments((prev) => prev.filter((c) => c.id !== tempComment.id));
    } finally {
      setLoading(false);
    }
  };

  if (!post) {
    return (
      <PageWrapper>
        <motion.div
          className="p-6 max-w-xl mx-auto text-center"
          initial="initial"
          animate="animate"
          exit="exit"
          variants={fadeIn}
        >
          <p className="text-gray-500 animate-pulse">
            🔄 Loading translated post...
          </p>
        </motion.div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <motion.div
        className="p-6 w-full max-w-3xl mx-auto bg-white dark:bg-gray-900 
                   rounded-2xl shadow-lg space-y-6 text-base sm:text-lg
                   text-gray-900 dark:text-gray-100"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={slideUp}
      >
        {/* --- Post Section --- */}
        <div>
          <h2 className="text-xl font-semibold mb-2">📝 Original</h2>
          <p className="whitespace-pre-wrap">{post.original}</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">🌍 Translated</h2>
          <p className="whitespace-pre-wrap">{post.translated}</p>
        </div>

        {post.summary && (
          <div>
            <h2 className="text-xl font-semibold mb-2">🧠 Summary</h2>
            <p className="whitespace-pre-wrap">{post.summary}</p>
          </div>
        )}

        {post.voice_url && (
          <div>
            <h2 className="text-xl font-semibold mb-2">🔊 Voice Playback</h2>
            <audio controls className="w-full mt-2">
              <source src={post.voice_url} type="audio/mpeg" />
            </audio>
          </div>
        )}

        {/* --- Comment Input --- */}
        <div className="pt-6">
          <textarea
            placeholder="💬 Add your comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-300 
                       bg-white dark:bg-gray-800
                       text-gray-900 dark:text-gray-100
                       placeholder-gray-400 dark:placeholder-gray-500
                       focus:outline-none focus:ring-2 focus:ring-blue-500
                       resize-y min-h-[100px]"
          />
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-3 px-5 py-2 rounded-xl bg-blue-600 text-white 
                       hover:bg-blue-700 disabled:opacity-50 transition-all 
                       w-full sm:w-auto"
          >
            {loading ? "Posting..." : "Post Comment"}
          </button>

          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </div>

        {/* --- Comments Section --- */}
        <div className="pt-6 space-y-4">
          <h2 className="text-xl font-semibold">
            💬 Comments ({comments.length})
          </h2>
          {comments.length === 0 && (
            <p className="text-gray-500">No comments yet. Be the first!</p>
          )}
          {comments.map((c) => (
            <div
              key={c.id}
              className={`p-3 sm:p-4 rounded-lg shadow text-sm sm:text-base
                ${
                  c.optimistic
                    ? "bg-yellow-50 dark:bg-yellow-900/30"
                    : "bg-gray-50 dark:bg-gray-800"
                }`}
            >
              <p className="font-medium">{c.translated}</p>
              <details className="mt-1 text-xs text-gray-500">
                <summary>Show original</summary>
                <p>{c.original}</p>
              </details>
              {c.voice_url && (
                <audio controls className="w-full mt-2">
                  <source src={c.voice_url} type="audio/mpeg" />
                </audio>
              )}
              {c.optimistic && (
                <p className="mt-1 text-xs text-yellow-600 dark:text-yellow-400">
                  ⏳ Sending...
                </p>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </PageWrapper>
  );
};

export default TranslatedPost;