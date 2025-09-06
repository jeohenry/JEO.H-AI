// src/components/NavBar.jsx
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { routesConfig } from "@/config/routesConfig";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const renderNavItem = (item, isChild = false) => {
    if (item.children) {
      return (
        <div key={item.name} className="relative group">
          <button
            className="flex items-center space-x-2 px-4 py-2 w-full text-left hover:bg-gray-200 rounded-xl"
          >
            {item.icon}
            <span>{item.name}</span>
          </button>
          <div className="absolute left-0 mt-2 hidden group-hover:block bg-white shadow-lg rounded-xl">
            {item.children.map((child) => renderNavItem(child, true))}
          </div>
        </div>
      );
    }

    return (
      <NavLink
        key={item.path}
        to={item.path}
        className={({ isActive }) =>
          `flex items-center space-x-2 px-4 py-2 hover:bg-gray-200 rounded-xl ${
            isActive ? "bg-gray-300 font-semibold" : ""
          } ${isChild ? "pl-8" : ""}`
        }
        onClick={() => setIsOpen(false)}
      >
        {item.icon}
        <span>{item.name}</span>
      </NavLink>
    );
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <NavLink to="/" className="text-xl font-bold">
          JEO.H-AI
        </NavLink>

        {/* Desktop Nav */}
        <div className="hidden md:flex space-x-4">
          {routesConfig.map((item) => renderNavItem(item, false))}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden flex flex-col space-y-1"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="w-6 h-0.5 bg-black"></span>
          <span className="w-6 h-0.5 bg-black"></span>
          <span className="w-6 h-0.5 bg-black"></span>
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="md:hidden overflow-hidden bg-white shadow-md"
          >
            {routesConfig.map((item) => renderNavItem(item, false))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default NavBar;