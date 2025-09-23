//src/pages/relationship/Upload.jsx

import React, { useState, useRef } from "react";
import axios from "@/api";
import { X } from "lucide-react"; // icon for remove

const Upload = () => {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [fileType, setFileType] = useState("gallery"); // default backend type
  const [messages, setMessages] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  const userId = localStorage.getItem("user_id");
  const inputRef = useRef(null);

  // Handle selected or dropped files
  const handleFileChange = (selectedFiles) => {
    const fileArray = Array.from(selectedFiles);
    setFiles(fileArray);

    const previewUrls = fileArray.map((f) => ({
      file: f,
      url: URL.createObjectURL(f),
    }));
    setPreviews(previewUrls);
  };

  // Remove single file
  const handleRemove = (index) => {
    const newFiles = [...files];
    const newPreviews = [...previews];
    newFiles.splice(index, 1);
    URL.revokeObjectURL(newPreviews[index].url); // cleanup blob
    newPreviews.splice(index, 1);

    setFiles(newFiles);
    setPreviews(newPreviews);
  };

  // Drag & drop events
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files);
    }
  };

  const handleUpload = async () => {
    if (!files.length || !userId) {
      setMessages(["Please select at least one file and ensure you're logged in."]);
      return;
    }

    const formData = new FormData();
    files.forEach((f) => formData.append("files", f)); // match backend param name

    try {
      const res = await axios.post(`/upload/${fileType}/${userId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.results) {
        setMessages(res.data.results.map((r) => r.message || "Uploaded"));
      } else {
        setMessages(["Upload successful!"]);
      }

      // cleanup previews
      previews.forEach((p) => URL.revokeObjectURL(p.url));
      setFiles([]);
      setPreviews([]);
    } catch (err) {
      console.error(err);
      setMessages(["Upload failed. Try again."]);
    }
  };

  // Detect preview type
  const renderPreview = (file, url, idx) => {
    const mime = file.type;

    return (
      <div key={idx} className="relative group">
        {/* Remove button */}
        <button
          type="button"
          onClick={() => handleRemove(idx)}
          className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full shadow 
                     opacity-0 group-hover:opacity-100 transition"
        >
          <X size={16} />
        </button>

        {mime.startsWith("image/") && (
          <img
            src={url}
            alt="Preview"
            className="w-full h-40 object-cover rounded-lg shadow"
          />
        )}

        {mime.startsWith("audio/") && (
          <audio controls src={url} className="w-full rounded-lg shadow"></audio>
        )}

        {mime.startsWith("video/") && (
          <video
            controls
            src={url}
            className="w-full h-40 rounded-lg shadow"
          ></video>
        )}

        {!mime.startsWith("image/") &&
          !mime.startsWith("audio/") &&
          !mime.startsWith("video/") && (
            <p className="text-sm text-gray-600 p-2">{file.name}</p>
          )}
      </div>
    );
  };

  return (
    <div className="p-4 max-w-2xl mx-auto w-full">
      <h2 className="text-xl font-bold mb-4 text-center">Upload Files</h2>

      {/* File type selector */}
      <select
        value={fileType}
        onChange={(e) => setFileType(e.target.value)}
        className="w-full p-2 border rounded mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        <option value="avatar">Avatar</option>
        <option value="post">Post</option>
        <option value="gallery">Gallery</option>
        <option value="voice">Voice</option>
      </select>

      {/* Drag and drop zone */}
      <div
        className={`w-full p-6 border-2 border-dashed rounded-lg text-center cursor-pointer transition 
        ${dragActive ? "border-green-600 bg-green-50" : "border-gray-400 bg-gray-50"}
        hover:border-green-600`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current.click()}
      >
        <p className="text-gray-600">Drag & drop files here, or click to select</p>
        <input
          type="file"
          ref={inputRef}
          onChange={(e) => handleFileChange(e.target.files)}
          multiple
          className="hidden"
        />
      </div>

      {/* Previews in grid */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mt-3">
          {previews.map((p, idx) => renderPreview(p.file, p.url, idx))}
        </div>
      )}

      {/* Upload button */}
      <button
        onClick={handleUpload}
        className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 mt-3 rounded-lg shadow"
      >
        Upload
      </button>

      {/* Status messages */}
      {messages.length > 0 && (
        <div className="mt-3 space-y-2">
          {messages.map((msg, i) => (
            <p
              key={i}
              className="text-center text-sm text-gray-700 bg-gray-100 p-2 rounded"
            >
              {msg}
            </p>
          ))}
        </div>
      )}

      {/* Textarea example */}
      <textarea
        placeholder="Type something..."
        className="w-full mt-4 p-3 rounded-lg border resize-none min-h-[100px] 
                   bg-white text-black placeholder-gray-400
                   focus:outline-none focus:ring-2 focus:ring-green-500"
      ></textarea>
    </div>
  );
};

export default Upload;