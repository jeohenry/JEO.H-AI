// src/layouts/RelationshipLayout.jsx

import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  FaBars,
  FaSun,
  FaMoon,
  FaBell,
  FaUserCircle,
  FaSignOutAlt,
  FaHeart,
  FaRobot,
} from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useTheme } from "@/context/ThemeContext";
import axios from "@/api";
import { defaultPageTransition } from "@/config/animations";

const RelationshipLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode, toggleTheme } = useTheme();

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [user, setUser] = useState({ username: "Dear", avatar: "" });
  const [aiMessage, setAiMessage] = useState(null);

  useEffect(() => {
    if (!userId || !token) return navigate("/relationship/login");

    axios
      .get(`/relationship/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUser({
          username: res.data.username || "Dear",
          avatar: res.data.avatar || "",
        });
      })
      .catch(() => navigate("/relationship/login"));
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    const baseUrl = import.meta.env.VITE_BASE_URL;
    const wsUrl = baseUrl.replace(/^http/, "ws"); 
    // http://localhost:8000 -> ws://localhost:8000
    // https://example.com -> wss://example.com

    const ws = new WebSocket(`${wsUrl}/ws/notify/${userId}`);

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.message_type === "alert") {
        toast(`💌 ${data.message}`);
      } else {
        setAiMessage(data.message);
        setTimeout(() => setAiMessage(null), 10000);
      }
      setNotificationCount((prev) => prev + 1);
    };

    return () => ws.close();
  }, [userId]);

  const logout = () => {
    localStorage.clear();
    navigate("/relationship/login");
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-pink-100 to-rose-100 dark:from-gray-900 dark:to-gray-800 text-gray-800 dark:text-white">
      {/* Sidebar */}
      <aside
        className={`fixed md:static z-40 h-full w-64 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform bg-gradient-to-b from-rose-600 to-pink-500 dark:from-gray-800 dark:to-gray-700`}
      >
        <div className="p-5 flex items-center justify-between text-white">
          <div className="flex items-center gap-2 text-2xl font-bold">
            <FaHeart className="animate-pulse text-pink-300" /> JEO.H Love
          </div>
        </div>
        <div className="flex flex-col items-center text-white mt-4">
          <div className="w-20 h-20 rounded-full overflow-hidden shadow border-4 border-rose-300">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <FaUserCircle className="text-6xl text-white" />
            )}
          </div>
          <p className="mt-3 text-lg font-semibold">Hi, {user.username}!</p>
        </div>
        <nav className="mt-6 px-6 flex flex-col gap-3 text-white font-medium">
          {[
            ["Feed", "/relationship/feed"],
            ["Translated Feed", "/relationship/translated-feed"],
            ["Profile", "/relationship/profile"],
            ["Chat Room", "/relationship/chatroom"],
            ["Matchmaker", "/relationship/matchmaker"],
            ["Advice", "/relationship/advice"],
            ["Tools", "/relationship/tools"],
            ["Group Video", "/relationship/group-video-call"],
            ["Live Chat", "/relationship/live-video-chat"],
          ].map(([label, path]) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="text-left py-2 px-4 rounded hover:bg-rose-400 dark:hover:bg-pink-500 transition"
            >
              {label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        <header className="flex justify-between items-center px-5 py-3 bg-white dark:bg-gray-900 shadow sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden text-xl"
            >
              <FaBars />
            </button>
            <h1 className="text-xl font-semibold text-rose-700 dark:text-pink-300">
              Relationship AI
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} title="Toggle Theme">
              {darkMode ? (
                <FaSun className="text-yellow-400 text-xl" />
              ) : (
                <FaMoon className="text-xl" />
              )}
            </button>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1 text-sm px-2 py-1 border rounded-full border-pink-400 bg-pink-100 dark:bg-gray-700 dark:border-pink-300 transition"
            >
              {darkMode ? "☀️ Light" : "🌙 Romantic Dark"}
            </button>
            <button
              onClick={() => navigate("/relationship/notifications")}
              className="relative"
            >
              <FaBell className="text-xl" />
              {notificationCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-bounce">
                  {notificationCount}
                </span>
              )}
            </button>
            <div className="relative group">
              <button className="flex items-center gap-2">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt="User"
                    className="w-8 h-8 rounded-full object-cover border-2 border-rose-300"
                  />
                ) : (
                  <FaUserCircle className="text-2xl" />
                )}
                <span className="hidden md:inline">{user.username}</span>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md shadow-md hidden group-hover:block">
                <button
                  onClick={() => navigate("/relationship/profile")}
                  className="block w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => navigate("/relationship/upload")}
                  className="block w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Upload Picture
                </button>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 text-red-600 dark:text-red-400 w-full px-4 py-2 hover:bg-red-100 dark:hover:bg-red-800"
                >
                  <FaSignOutAlt /> Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* AI Message Bubble */}
        {aiMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 right-4 max-w-xs bg-pink-100 dark:bg-pink-900 text-pink-900 dark:text-white px-4 py-3 rounded-lg shadow-md z-50"
          >
            <div className="flex items-center gap-2">
              <FaRobot className="text-xl animate-bounce" />
              <span className="italic">{aiMessage}</span>
            </div>
          </motion.div>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={defaultPageTransition.initial}
              animate={defaultPageTransition.animate}
              exit={defaultPageTransition.exit}
              transition={defaultPageTransition.transition}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="text-center py-4 text-sm bg-white dark:bg-gray-800 text-rose-700 dark:text-pink-300 border-t dark:border-gray-700">
          ❤️ Powered by JEO.H AI — Building Connections That Matter.
        </footer>
      </div>

      <ToastContainer position="top-right" autoClose={5000} hideProgressBar />
    </div>
  );
};

export default RelationshipLayout;