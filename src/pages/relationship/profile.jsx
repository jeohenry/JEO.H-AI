import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "../api";
import PageWrapper from "../components/PageWrapper";
import ProfileCard from "../components/ProfileCard";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [newBio, setNewBio] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [translateEnabled, setTranslateEnabled] = useState(true);
  const [voiceId, setVoiceId] = useState("");
  const [voices, setVoices] = useState([]);
  const [language, setLanguage] = useState("en");

  const navigate = useNavigate();
  const userId = localStorage.getItem("user_id");

  /* ───────── Load User ───────── */
  useEffect(() => {
    if (!userId) return navigate("/relationship/login");

    axios.get(`/api/relationship/user/${userId}`).then((res) => {
      const userData = res.data;
      setUser(userData);
      setNewBio(userData.bio || "");
      setTranslateEnabled(userData.translate_enabled);
      setVoiceId(userData.voice_id || "");
      setLanguage(userData.language || "en");
    });
  }, [userId]);

  /* ───────── Load Voices ───────── */
  useEffect(() => {
    axios
      .get("/api/voices/")
      .then((res) => setVoices(res.data.voices || []))
      .catch((err) => console.error("Failed to fetch voices", err));
  }, []);

  const handleBioUpdate = () => {
    axios.put(`/api/relationship/user/${userId}/bio`, { bio: newBio }).then(() => {
      setUser({ ...user, bio: newBio });
      setIsEditing(false);
    });
  };

  const handleSettingsUpdate = () => {
    axios.put(`/auth/me/update`, {
      translate_enabled: translateEnabled,
      voice_id: voiceId,
      language: language,
    });
  };

  const toggleLockProfile = () => {
    axios.put(`/api/profile/lock/${userId}`).then((res) => {
      setUser({ ...user, is_private: res.data.private });
    });
  };

  const handleDisableAccount = () => {
    if (window.confirm("Are you sure you want to disable your account?")) {
      axios.put(`/api/disable-account/${userId}`).then(() => {
        localStorage.clear();
        navigate("/relationship/login");
      });
    }
  };

  if (!user) return <p className="p-4 text-gray-600">Loading profile...</p>;

  return (
    <PageWrapper>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-3xl mx-auto p-4"
      >
        <h1 className="text-3xl font-bold mb-4 text-center">Your Profile</h1>

        <ProfileCard user={user} />

        {/* ⚙️ Voice & Language Settings */}
        <div className="my-6">
          <h2 className="text-xl font-semibold mb-2">Voice & Language Preferences</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">Preferred Voice</label>
              <select
                value={voiceId}
                onChange={(e) => setVoiceId(e.target.value)}
                className="w-full border p-2 rounded"
              >
                <option value="">-- Select a Voice --</option>
                {voices.map((v) => (
                  <option key={v.voice_id} value={v.voice_id}>
                    {v.name} ({v.category})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1">Preferred Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full border p-2 rounded"
              >
                <option value="en">English</option>
                <option value="yo">Yoruba</option>
                <option value="ha">Hausa</option>
                <option value="ig">Igbo</option>
                <option value="fr">French</option>
                <option value="zh">Chinese</option>
              </select>
            </div>
          </div>
        </div>

        {/* 🌍 Translate Toggle */}
        <div className="mb-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={translateEnabled}
              onChange={() => setTranslateEnabled(!translateEnabled)}
            />
            Enable Auto-Translation in Chat
          </label>
          <button
            onClick={handleSettingsUpdate}
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Save Preferences
          </button>
        </div>

        {/* 📝 Bio Editor */}
        <div className="mb-6">
          <label className="block font-medium mb-1">Bio</label>
          {isEditing ? (
            <>
              <textarea
                value={newBio}
                onChange={(e) => setNewBio(e.target.value)}
                className="w-full border p-2 rounded"
              />
              <button
                onClick={handleBioUpdate}
                className="bg-blue-600 text-white px-3 py-1 mt-2 rounded"
              >
                Save Bio
              </button>
            </>
          ) : (
            <>
              <p className="bg-gray-100 p-2 rounded">{user.bio || "No bio set."}</p>
              <button
                onClick={() => setIsEditing(true)}
                className="text-blue-600 text-sm mt-1"
              >
                Edit Bio
              </button>
            </>
          )}
        </div>

        {/* 🎯 Interests */}
        <div className="mb-4">
          <h3 className="font-medium">Interests:</h3>
          <p>{user.interests || "None specified"}</p>
        </div>

        {/* 🖼️ Gallery */}
        <div className="mb-6">
          <h3 className="font-medium">Gallery</h3>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {user.gallery?.length > 0 ? (
              user.gallery.map((img, idx) => (
                <img
                  key={idx}
                  src={img.image_url}
                  alt={`Gallery ${idx}`}
                  className="rounded w-full h-28 object-cover"
                />
              ))
            ) : (
              <p className="text-gray-500 col-span-3">No pictures uploaded yet.</p>
            )}
          </div>
        </div>

        {/* ⚡ Actions */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate("/relationship/upload")}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Upload Picture
          </button>
          <button
            onClick={toggleLockProfile}
            className="bg-yellow-500 text-white px-4 py-2 rounded"
          >
            {user.is_private ? "Unlock Profile" : "Lock Profile"}
          </button>
          <button
            onClick={handleDisableAccount}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Disable Account
          </button>
        </div>
      </motion.div>
    </PageWrapper>
  );
}

















