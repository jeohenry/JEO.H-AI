//src/pages/relationship/TranslatedFeed.jsx

import React, { useEffect, useState } from "react";
import axios from "../../utils/API";
import { useTranslation } from "react-i18next";

const TranslatedFeed = () => {
  const [posts, setPosts] = useState([]);
  const { i18n } = useTranslation();
  const lang = i18n.language || "en";

  useEffect(() => {
    axios.get(`/posts/feed?lang=${lang}`).then((res) => setPosts(res.data));
  }, [lang]);

  return (
    <div className="p-6 space-y-4">
      {posts.map((post) => (
        <div key={post.id} className="p-4 bg-white dark:bg-gray-800 rounded shadow">
          <p className="text-sm text-gray-400">Lang: {post.lang}</p>
          <p className="font-semibold">{post.translated}</p>
          <details className="text-xs mt-2 cursor-pointer">
            <summary className="text-blue-500">Show original</summary>
            <p>{post.original}</p>
          </details>
        </div>
      ))}
    </div>
  );
};

export default TranslatedFeed;