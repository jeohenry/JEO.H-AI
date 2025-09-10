//src/pages/relationship/Profile.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "@/api";
import PageWrapper from "@/components/PageWrapper";
import ProfileCard from "@/components/ProfileCard";

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

    axios.get(`/relationship/user/${userId}`).then((res) => {
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
      .get("/voices")
      .then((res) => setVoices(res.data.voices || []))
      .catch((err) => console.error("Failed to fetch voices", err));
  }, []);

  const handleBioUpdate = () => {
    axios.put(`/relationship/user/${userId}/bio`, { bio: newBio }).then(() => {
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
    axios.put(`/profile/lock/${userId}`).then((res) => {
      setUser({ ...user, is_private: res.data.private });
    });
  };

  const handleDisableAccount = () => {
    if (window.confirm("Are you sure you want to disable your account?")) {
      axios.put(`/disable-account/${userId}`).then(() => {
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
        className="max-w-6xl mx-auto p-4 space-y-6"
      >
        {/* 🎯 Dashboard Header */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold mb-2">🎯 User Dashboard</h1>
          <p className="text-pink-100">Manage your profile, settings, and preferences</p>
        </div>

        {/* 📊 Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Profile & Bio */}
          <div className="space-y-6">
            <div className="bg-white shadow-lg rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">👤 Profile Information</h2>
              <ProfileCard user={user} />
            </div>
            
            {/* 📝 Edit Bio */}
            <div className="bg-white shadow-lg rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">📝 Biography</h2>
              <div className="space-y-4">
                {isEditing ? (
                  <>
                    <textarea
                      rows={4}
                      value={newBio}
                      onChange={(e) => setNewBio(e.target.value)}
                      className="w-full border-2 border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 p-3 rounded-lg bg-white shadow-sm transition-all duration-200 placeholder-gray-500 text-gray-800"
                      placeholder="Tell us about yourself..."
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleBioUpdate}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Save Bio
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-4 bg-gray-50 rounded-lg border">
                      <p className="text-gray-700">{user.bio || "No bio yet. Click edit to add one!"}</p>
                    </div>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Edit Bio
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Settings Dashboard */}
          <div className="space-y-6">
            <div className="bg-white shadow-lg rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
                ⚙️ User Settings & Preferences
              </h2>

              {/* Voice & Language Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-700 mb-3">🎤 Voice & Language</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Preferred Voice</label>
                    <select
                      value={voiceId}
                      onChange={(e) => setVoiceId(e.target.value)}
                      className="w-full border-2 border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 p-3 rounded-lg bg-white shadow-sm transition-all duration-200 text-gray-800"
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
                    <label className="block text-sm font-medium text-gray-600 mb-2">Preferred Language</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full border-2 border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 p-3 rounded-lg bg-white shadow-sm transition-all duration-200 text-gray-800"
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

              {/* Translation Settings */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-medium text-gray-700 mb-3">🌍 Translation</h3>
                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={translateEnabled}
                    onChange={() => setTranslateEnabled(!translateEnabled)}
                    className="w-5 h-5 text-purple-600 border-2 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="text-gray-700">Enable Auto-Translation in Chat</span>
                </label>
              </div>

              {/* Save Settings Button */}
              <div className="pt-4">
                <button
                  onClick={handleSettingsUpdate}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
                >
                  💾 Save All Settings
                </button>
              </div>
            </div>
            
            {/* 🛠️ Account Actions */}
            <div className="bg-white shadow-lg rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
                🛠️ Account Actions
              </h2>
              <div className="grid grid-cols-1 gap-4">
                <button
                  onClick={() => navigate("/relationship/upload")}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  📸 Upload Picture
                </button>
                <button
                  onClick={toggleLockProfile}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {user.is_private ? "🔓 Unlock Profile" : "🔒 Lock Profile"}
                </button>
                <button
                  onClick={handleDisableAccount}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  🚫 Disable Account
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 🖼️ Gallery Section */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">🖼️ Photo Gallery</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {user.gallery?.length > 0 ? (
              user.gallery.map((img, idx) => (
                <img
                  key={idx}
                  src={img.image_url}
                  alt={`Gallery ${idx}`}
                  className="rounded-lg w-full h-32 object-cover shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                />
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">No pictures uploaded yet.</p>
                <button
                  onClick={() => navigate("/relationship/upload")}
                  className="mt-2 text-blue-600 hover:text-blue-700 underline"
                >
                  Upload your first photo
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </PageWrapper>
  );
}
