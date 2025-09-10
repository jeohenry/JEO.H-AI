//src/pages/relationship/Upload.jsx

import React, { useState } from "react";
import axios from "@/api";

const UploadPicture = () => {
  const [file, setFile] = useState(null);
  const userId = localStorage.getItem("user_id");

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("user_id", userId);

    try {
      const res = await axios.post("/relationship/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Upload successful!");
    } catch (err) {
      console.error(err);
      alert("Upload failed.");
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Upload Picture</h2>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0])}
        className="mb-2"
      />
      <button
        onClick={handleUpload}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Upload
      </button>
    </div>
  );
};

export default UploadPicture;
