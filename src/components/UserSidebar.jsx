// src/components/Sidebar/UserSidebar.jsx

import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  FaHome,
  FaUser,
  FaComments,
  FaHeart,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { Languages } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

const UserSidebar = () => {
  const [isOpen, setIsOpen] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [openCategories, setOpenCategories] = useState({ tools: true, live: true });
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const handleResize = () => {
    const mobile = window.innerWidth <= 768;
    setIsMobile(mobile);
    setIsOpen(!mobile);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/relationship/Login";
  };

  const user = {
    name: localStorage.getItem("username") || "User",
    avatar: localStorage.getItem("avatar") || "/default-avatar.png",
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const coreLinks = [
    { to: "/relationship/Home", label: "Home", icon: <FaHome /> },
    { to: "/relationship/Profile", label: "Profile", icon: <FaUser /> },
    { to: "/relationship/Feed", label: "Feed", icon: <FaHeart /> },
    { to: "/relationship/Chatroom", label: "Chat", icon: <FaComments /> },
  ];

  const toolLinks = [
    { to: "/relationship/Matchmaker", label: "Matchmaker", icon: <FaHeart /> },
    { to: "/relationship/Advice", label: "Advice", icon: <FaComments /> },
    { to: "/relationship/Translate", label: "Translate", icon: <Languages size={18} /> },
  ];

  const liveLinks = [
    { to: "/relationship/Group-Video-Call", label: "Group Call", icon: <FaComments /> },
    { to: "/relationship/Live-Video-Chat", label: "Live Chat", icon: <FaComments /> },
    { to: "/relationship/Notifications", label: "Notifications", icon: <FaComments /> },
  ];

  const toggleCategory = (category) => {
    setOpenCategories((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  const renderNavItem = ({ to, label, icon }) => (
    <NavLink
      key={to}
      to={to}
      title={label}
      className={({ isActive }) =>
        `flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${
          isActive
            ? "bg-pink-100 text-pink-600 font-semibold"
            : "text-gray-700 hover:text-pink-600 hover:bg-pink-50"
        }`
      }
    >
      <span className="text-lg">{icon}</span>
      {isOpen && <span className="text-sm">{label}</span>}
    </NavLink>
  );

  return (
    <aside className={`sidebar ${isOpen ? "open" : "collapsed"} ${theme}`}>
      {isMobile && (
        <div className="sidebar-toggle" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </div>
      )}

      <div className="sidebar-content flex flex-col justify-between h-full">
        {/* Header */}
        <div className="space-y-4">
          <div className="sidebar-header flex items-center justify-between px-4 pt-4">
            <div className="flex items-center gap-3">
              <img src={user.avatar} alt="avatar" className="w-8 h-8 rounded-full" />
              {isOpen && <span className="font-medium text-sm">{user.name}</span>}
            </div>
            <button onClick={toggleTheme} title="Toggle Theme" className="text-xl">
              {theme === "dark" ? "🌙" : "☀️"}
            </button>
          </div>

          {/* Core Links */}
          <div className="px-2 space-y-1">{coreLinks.map(renderNavItem)}</div>

          {/* Tools Accordion */}
          <div className="px-2">
            <div
              className="flex items-center justify-between cursor-pointer px-2 py-2"
              onClick={() => toggleCategory("tools")}
            >
              {isOpen && <span className="text-xs uppercase tracking-wide">Dating Tools</span>}
              <span className="text-sm">
                {openCategories.tools ? <FaChevronUp /> : <FaChevronDown />}
              </span>
            </div>
            {openCategories.tools && <div className="space-y-1">{toolLinks.map(renderNavItem)}</div>}
          </div>

          {/* Live Accordion */}
          <div className="px-2">
            <div
              className="flex items-center justify-between cursor-pointer px-2 py-2"
              onClick={() => toggleCategory("live")}
            >
              {isOpen && <span className="text-xs uppercase tracking-wide">Live Features</span>}
              <span className="text-sm">
                {openCategories.live ? <FaChevronUp /> : <FaChevronDown />}
              </span>
            </div>
            {openCategories.live && <div className="space-y-1">{liveLinks.map(renderNavItem)}</div>}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 pb-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-500 hover:bg-red-100 px-3 py-2 rounded-md w-full text-sm"
          >
            <FaSignOutAlt />
            {isOpen && "Logout"}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default UserSidebar;






