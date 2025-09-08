// src/components/PostCard.jsx
import React from "react";
import FlagButton from "./FlagButton";
import { Heart, MessageCircle, Bookmark, Share2 } from "lucide-react";

const PostCard = ({ post, onLike, onComment, onSave, onShare }) => {
  return (
    <div className="border p-4 mb-4 rounded shadow bg-white dark:bg-gray-800">
      {/* 👤 User */}
      <p className="font-bold">@{post.user?.username}</p>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {new Date(post.created_at).toLocaleString()}
      </p>

      {/* 📖 Caption */}
      <p className="mt-2">{post.caption}</p>

      {/* 📸 Media */}
      {post.content_type === "image" ? (
        <img src={post.content_url} alt="" className="w-full rounded mt-2" />
      ) : (
        <video
          src={post.content_url}
          controls
          className="w-full rounded mt-2"
        />
      )}

      {/* 🎛️ Actions */}
      <div className="mt-3 flex gap-4 items-center text-gray-600 dark:text-gray-300">
        <button
          onClick={onLike}
          className="hover:text-pink-600 dark:hover:text-pink-400 hover:scale-110 transition transform duration-150"
          title="Like"
        >
          <Heart size={20} />
        </button>
        <button
          onClick={onComment}
          className="hover:text-blue-600 dark:hover:text-blue-400 hover:scale-110 transition transform duration-150"
          title="Comment"
        >
          <MessageCircle size={20} />
        </button>
        <button
          onClick={onSave}
          className="hover:text-yellow-600 dark:hover:text-yellow-400 hover:scale-110 transition transform duration-150"
          title="Save"
        >
          <Bookmark size={20} />
        </button>
        <button
          onClick={onShare}
          className="hover:text-green-600 dark:hover:text-green-400 hover:scale-110 transition transform duration-150"
          title="Share"
        >
          <Share2 size={20} />
        </button>
        {/* 🚩 Report Button */}
        <FlagButton contentId={post.id} contentType="post" />
      </div>
    </div>
  );
};

export default PostCard;