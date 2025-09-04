// src/pages/post/TranslatedPost.jsx

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "@/api"; // ✅ fixed import
import PageWrapper from "@/components/PageWrapper"; // ✅ fixed import
import { motion } from "framer-motion";
import { fadeIn, slideUp } from "@/config/animations"; // ✅ fixed import

const TranslatedPost = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    axios.get(`/post/${id}/translated`).then((res) => {
      setPost(res.data);
    });
  }, [id]);

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
        className="p-6 max-w-2xl mx-auto bg-white rounded shadow space-y-6"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={slideUp}
      >
        <div>
          <h2 className="text-xl font-semibold mb-2">📝 Original</h2>
          <p className="text-gray-700">{post.original}</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">🌍 Translated</h2>
          <p className="text-gray-900">{post.translated}</p>
        </div>

        {post.summary && (
          <div>
            <h2 className="text-xl font-semibold mb-2">🧠 Summary</h2>
            <p className="text-gray-800">{post.summary}</p>
          </div>
        )}

        {post.voice_url && (
          <div>
            <h2 className="text-xl font-semibold mb-2">🔊 Voice Playback</h2>
            <audio controls className="w-full mt-2">
              <source src={post.voice_url} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>
        )}
      </motion.div>
    </PageWrapper>
  );
};

export default TranslatedPost;