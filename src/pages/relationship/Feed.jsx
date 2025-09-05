//src/pages/relationship/Feed.jsx

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import axios from "@/api";
import PostCard from "@/components/PostCard";
import PageWrapper from "@/components/PageWrapper";
import { Dialog } from "@headlessui/react";

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [activePostId, setActivePostId] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [voiceFile, setVoiceFile] = useState(null);
  const { i18n } = useTranslation();
  const userId = localStorage.getItem("user_id");

  // 🔄 Fetch posts with language support
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get(`/relationship/feed?lang=${i18n.language}`);
        setPosts(res.data);
      } catch (err) {
        console.error("Failed to fetch posts:", err);
      }
    };
    fetchPosts();
  }, [i18n.language]);

  // ❤️ Like post
  const handleLike = async (post_id) => {
    try {
      await axios.post("/relationship/like-post", { user_id: userId, post_id });
      setPosts((prev) =>
        prev.map((post) =>
          post.id === post_id ? { ...post, liked: true } : post
        )
      );
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  // 💬 Open comment modal
  const handleComment = (post_id) => {
    setActivePostId(post_id);
    setCommentText("");
    setVoiceFile(null);
    setCommentModalOpen(true);
  };

  // 💾 Save post (placeholder)
  const handleSave = (post_id) => {
    alert(`🔖 Save post ${post_id}`);
  };

  // 📤 Share post (placeholder)
  const handleShare = (post_id) => {
    alert(`📤 Share post ${post_id}`);
  };

  // ✅ Submit comment
  const submitComment = async () => {
    if (!commentText && !voiceFile) return;

    const formData = new FormData();
    formData.append("user_id", userId);
    formData.append("post_id", activePostId);
    formData.append("text", commentText);
    if (voiceFile) formData.append("voice", voiceFile);

    try {
      await axios.post("/relationship/comment-post", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Refresh comments on the post
      setPosts((prev) =>
        prev.map((post) =>
          post.id === activePostId
            ? {
                ...post,
                comments: [
                  ...post.comments,
                  {
                    username: "You",
                    text: commentText,
                    created_at: new Date().toISOString(),
                    voice_url: null, // if you return this from backend, update
                  },
                ],
              }
            : post
        )
      );
    } catch (error) {
      console.error("Failed to post comment:", error);
    } finally {
      setCommentModalOpen(false);
    }
  };

  return (
    <PageWrapper>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-4 max-w-5xl mx-auto space-y-8"
      >
        <h2 className="text-3xl font-bold text-pink-600 text-center">
          💞 Lovers Post Feed
        </h2>

        {posts.length === 0 ? (
          <p className="text-center text-gray-500">No posts yet.</p>
        ) : (
          posts.map((post) => (
            <motion.div
              key={post.id}
              whileHover={{ scale: 1.01 }}
              className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-md space-y-4"
            >
              <PostCard
                post={post}
                onLike={() => handleLike(post.id)}
                onComment={() => handleComment(post.id)}
                onSave={() => handleSave(post.id)}
                onShare={() => handleShare(post.id)}
              />

              {/* 💬 Comments */}
              {post.comments && post.comments.length > 0 && (
                <div className="space-y-3 text-sm text-gray-700 border-t pt-3 dark:text-gray-200">
                  <strong className="block text-base text-gray-800 dark:text-white">
                    💬 Comments
                  </strong>
                  {post.comments.map((c, idx) => (
                    <div
                      key={idx}
                      className="border-l-2 pl-3 border-gray-300 dark:border-gray-600"
                    >
                      <p>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          @{c.username}
                        </span>
                        : {c.text}
                      </p>
                      {c.voice_url && (
                        <audio controls className="w-full mt-1">
                          <source src={c.voice_url} type="audio/mpeg" />
                        </audio>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(c.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))
        )}
      </motion.div>

      {/* 💬 Comment Modal */}
      <Dialog
        open={commentModalOpen}
        onClose={() => setCommentModalOpen(false)}
        className="fixed z-50 inset-0 flex items-center justify-center"
      >
        <div className="bg-black/50 fixed inset-0" aria-hidden="true" />
        <Dialog.Panel className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md z-50">
          <Dialog.Title className="text-lg font-bold mb-4 text-gray-700 dark:text-white">
            💬 Add a Comment
          </Dialog.Title>
          <textarea
            rows={4}
            placeholder="Type your comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mb-3 dark:bg-gray-900 dark:text-white"
          />
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => setVoiceFile(e.target.files[0])}
            className="mb-4"
          />
          <div className="flex justify-between">
            <button
              onClick={() => setCommentModalOpen(false)}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-black dark:text-white rounded"
            >
              Cancel
            </button>
            <button
              onClick={submitComment}
              disabled={!commentText.trim() && !voiceFile}
              className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700 transition"
            >
              Submit
            </button>
          </div>
        </Dialog.Panel>
      </Dialog>
    </PageWrapper>
  );
};

export default Feed;









