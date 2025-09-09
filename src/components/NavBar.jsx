// src/components/NavBar.jsx
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { routesConfig } from "@/config/routesConfig";
import ThemeSwitcher from "./ThemeSwitcher"; // ✅ import

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const renderNavItem = (item, isChild = false) => {
    if (item.children) {
      const isDropdownOpen = activeDropdown === item.name;
      return (
        <div key={item.name} className="relative">
          <button 
            className="flex items-center space-x-2 px-4 py-2 w-full text-left 
                       hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition"
            onClick={(e) => {
              e.preventDefault();
              setActiveDropdown(isDropdownOpen ? null : item.name);
            }}
          >
            {item.icon}
            <span>{item.name}</span>
            <svg 
              className={`ml-auto w-4 h-4 transition-transform duration-200 ${
                isDropdownOpen ? 'rotate-180' : ''
              }`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute left-0 mt-2 w-full min-w-[200px] 
                          bg-white dark:bg-gray-900 shadow-lg rounded-xl 
                          border border-gray-200 dark:border-gray-700 z-50
                          overflow-hidden"
              >
                {item.children.map((child) => renderNavItem(child, true))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    return (
      <NavLink
        key={item.path}
        to={item.path}
        className={({ isActive }) =>
          `flex items-center space-x-2 px-4 py-2 rounded-xl transition 
           hover:bg-gray-200 dark:hover:bg-gray-700 
           ${isActive ? "bg-gray-300 dark:bg-gray-800 font-semibold" : ""} 
           ${isChild ? "pl-8" : ""}`
        }
        onClick={() => {
          setIsOpen(false);
          setActiveDropdown(null);
        }}
      >
        {item.icon}
        <span>{item.name}</span>
      </NavLink>
    );
  };

  return (
    <nav className="bg-white dark:bg-black text-black dark:text-white 
                    shadow-md sticky top-0 z-50 transition-colors duration-300">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <NavLink to="/" className="text-xl font-bold dark:text-white">
          JEO.H-AI
        </NavLink>

        {/* Desktop Nav */}
        <div className="hidden md:flex space-x-4 items-center">
          {routesConfig.map((item) => renderNavItem(item, false))}
          <ThemeSwitcher /> {/* ✅ toggle on desktop */}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden flex flex-col space-y-1"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="w-6 h-0.5 bg-black dark:bg-white"></span>
          <span className="w-6 h-0.5 bg-black dark:bg-white"></span>
          <span className="w-6 h-0.5 bg-black dark:bg-white"></span>
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="md:hidden overflow-hidden 
                       bg-white dark:bg-black text-black dark:text-white 
                       shadow-md transition-colors duration-300"
          >
            {routesConfig.map((item) => renderNavItem(item, false))}
            <div className="px-4 py-2">
              <ThemeSwitcher /> {/* ✅ toggle on mobile */}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default NavBar;