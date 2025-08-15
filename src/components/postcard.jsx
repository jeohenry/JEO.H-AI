// components/PostCard.jsx
import React from "react";


const PostCard = ({ post, onLike, onComment, onSave, onShare }) => {
  return (
    <div className="border p-4 mb-4 rounded shadow bg-white">
      <p className="font-bold">@{post.user?.username}</p>
      <p className="text-sm text-gray-600">
        {new Date(post.created_at).toLocaleString()}
      </p>
      <p className="mt-2">{post.caption}</p>
      {post.content_type === "image" ? (
        <img src={post.content_url} alt="" className="w-full rounded mt-2" />
      ) : (
        <video
          src={post.content_url}
          controls
          className="w-full rounded mt-2"
        />
      )}
      <div className="mt-2 flex gap-3">
        <button onClick={onLike}>❤️</button>
        <button onClick={onComment}>💬</button>
        <button onClick={onSave}>🔖</button>
        <button onClick={onShare}>🔗</button>
      </div>
    </div>
  );
};
<FlagButton contentId={post.id} contentType="post" />
export default PostCard;
