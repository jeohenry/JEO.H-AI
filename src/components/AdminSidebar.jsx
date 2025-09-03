// src/components/Sidebar/AdminSidebar.jsx

import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTachometerAlt,
  faChartLine,
  faFlag,
  faMoon,
  faSignOutAlt,
  faBars,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { useTheme } from "@/context/ThemeContext";
import "./Sidebar.css";

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const [open, setOpen] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const adminName = localStorage.getItem("username") || "Admin";
  const role = localStorage.getItem("role") || "admin";

  useEffect(() => {
    const handleResize = () => {
      const isNowMobile = window.innerWidth <= 768;
      setIsMobile(isNowMobile);
      setOpen(!isNowMobile);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Collapse sidebar on route change (mobile)
  useEffect(() => {
    if (isMobile) setOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/relationship/Login");
  };

  const renderLink = (to, label, icon) => (
    <NavLink
      to={to}
      onClick={() => isMobile && setOpen(false)}
      title={label}
      className={({ isActive }) =>
        `flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${
          isActive
            ? "bg-pink-100 text-pink-600 font-semibold"
            : "text-gray-700 hover:bg-pink-600 hover:bg-pink-50"
        }`
      }
    >
      <FontAwesomeIcon icon={icon} />
      {open && <span className="text-sm">{label}</span>}
    </NavLink>
  );

  return (
    <aside className={`sidebar ${open ? "open" : "collapsed"} ${theme}`}>
      {/* Mobile Toggle Button */}
      {isMobile && (
        <div className="sidebar-toggle" onClick={() => setOpen(!open)}>
          <FontAwesomeIcon icon={open ? faTimes : faBars} size="lg" />
        </div>
      )}

      <div className="sidebar-content flex flex-col justify-between h-full">
        {/* Header */}
        <div className="space-y-4 pt-4 px-4">
          <div className="flex items-center gap-3">
            <img src="/avatar.png" alt="Admin Avatar" className="w-8 h-8 rounded-full" />
            {open && (
              <div>
                <p className="text-sm font-medium">{adminName}</p>
                <p className="text-xs text-gray-500 uppercase">{role}</p>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {renderLink("/relationship/admin-dashboard", "Dashboard", faTachometerAlt)}
            {renderLink("/relationship/admin/analytics", "Analytics", faChartLine)}
            {renderLink("/relationship/admin/flags", "Flagged Reports", faFlag)}
          </nav>
        </div>

        {/* Footer */}
        <div className="px-4 pb-4 space-y-2">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 text-sm hover:text-blue-600 w-full"
          >
            <FontAwesomeIcon icon={faMoon} />
            {open && `Theme (${theme})`}
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 w-full"
          >
            <FontAwesomeIcon icon={faSignOutAlt} />
            {open && "Logout"}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;






