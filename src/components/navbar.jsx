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
import LanguageSwitcher from "./LanguageSwitcher";


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
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo + Toggle */}
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

        {/* Theme Toggle */}
        <div className="flex items-center gap-4">
          <button onClick={toggleTheme} title="Toggle Theme">
            {darkMode ? <FaSun className="text-yellow-400 text-xl" /> : <FaMoon className="text-xl" />}
          </button>
        </div>
      </div>
<div className="flex items-center gap-4">
  <LanguageSwitcher />
  ...
</div>

      {/* Desktop Nav */}
      <nav className="hidden md:flex justify-center gap-6 py-2 bg-rose-100 dark:bg-gray-800 text-sm font-medium">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
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
        ))}
      </nav>

      {/* Mobile Nav */}
      {mobileOpen && (
        <nav className="md:hidden flex flex-col bg-rose-100 dark:bg-gray-800 px-4 py-3 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
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
          ))}
        </nav>
      )}
    </header>
  );
};

export default NavBar;





