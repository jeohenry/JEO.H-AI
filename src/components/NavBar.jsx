// src/components/NavBar.jsx
import React, { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  FaBars,
  FaTimes,
  FaHome,
  FaRobot,
  FaHeart,
  FaBrain,
  FaHeartbeat,
  FaMicrophone,
  FaMusic,
  FaPalette,
  FaChartLine,
  FaComments,
  FaUserCircle,
  FaSun,
  FaMoon,
} from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ScrollFadeIn from "@/components/ScrollFadeIn"; // 👈

const NavBar = () => {
  const { darkMode, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleMobileMenu = () => setMobileOpen(!mobileOpen);

  const navItems = [
    { name: "Home", path: "/", icon: <FaHome /> },
    { name: "Chat", path: "/chat", icon: <FaComments /> },
    { name: "Translate", path: "/translate", icon: <FaRobot /> },
    { name: "Predict", path: "/predict", icon: <FaBrain /> },
    { name: "Recommend", path: "/recommend", icon: <FaChartLine /> },
    { name: "Health", path: "/health", icon: <FaHeartbeat /> },
    { name: "Content", path: "/content", icon: <FaPalette /> },
    { name: "Advertising", path: "/advertising", icon: <FaChartLine /> },
    { name: "Music", path: "/music", icon: <FaMusic /> },
    { name: "Face Detect", path: "/face-detect", icon: <FaUserCircle /> },
    { name: "Image Classify", path: "/image-classify", icon: <FaUserCircle /> },
    { name: "Voice", path: "/voice-assistant", icon: <FaMicrophone /> },
    { name: "Progressive AI", path: "/progressive-ai", icon: <FaBrain /> },
    { name: "Relationship", path: "/relationship/feed", icon: <FaHeart /> },
  ];

  return (
    <header className="w-full bg-white dark:bg-gray-900 shadow-md fixed top-0 z-50">
      {/* Topbar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button className="md:hidden text-2xl" onClick={toggleMobileMenu}>
            {mobileOpen ? <FaTimes /> : <FaBars />}
          </button>
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-2xl font-bold text-rose-600 dark:text-pink-300 cursor-pointer"
          >
            <FaRobot /> JEO.H AI
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={toggleTheme} title="Toggle Theme">
            {darkMode ? (
              <FaSun className="text-yellow-400 text-xl" />
            ) : (
              <FaMoon className="text-xl" />
            )}
          </button>
          <LanguageSwitcher />
        </div>
      </div>

      {/* Desktop Nav with ScrollFadeIn + Stagger */}
      <ScrollFadeIn direction="down">
        <nav className="hidden md:flex justify-center gap-6 py-2 bg-rose-100 dark:bg-gray-800 text-sm font-medium">
          {navItems.map((item) => (
            <ScrollFadeIn key={item.path} direction="up">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-1 rounded transition-all ${
                    isActive
                      ? "bg-pink-600 text-white"
                      : "text-gray-700 dark:text-white hover:bg-pink-200 dark:hover:bg-pink-600"
                  }`
                }
              >
                {item.icon}
                {item.name}
              </NavLink>
            </ScrollFadeIn>
          ))}
        </nav>
      </ScrollFadeIn>

      {/* Mobile Nav with ScrollFadeIn + Stagger */}
      {mobileOpen && (
        <ScrollFadeIn direction="up">
          <nav className="md:hidden flex flex-col bg-rose-100 dark:bg-gray-800 px-4 py-3 space-y-2">
            {navItems.map((item) => (
              <ScrollFadeIn key={item.path} direction="right">
                <NavLink
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded transition-all ${
                      isActive
                        ? "bg-pink-600 text-white"
                        : "text-gray-800 dark:text-white hover:bg-pink-200 dark:hover:bg-pink-600"
                    }`
                  }
                >
                  {item.icon}
                  {item.name}
                </NavLink>
              </ScrollFadeIn>
            ))}
          </nav>
        </ScrollFadeIn>
      )}
    </header>
  );
};

export default NavBar;