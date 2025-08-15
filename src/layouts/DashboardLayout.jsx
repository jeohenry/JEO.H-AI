// src/layouts/DashboardLayout.jsx
import React, { useState } from "react";
import { Outlet, useLocation, Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Bell,
  Sun,
  Moon,
  UserCircle2,
  LogOut,
  Settings,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/context/themecontext";
import PageWrapper from "@/components/PageWrapper";

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { toggleTheme, theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        initial={{ width: collapsed ? 80 : 240 }}
        animate={{ width: collapsed ? 80 : 240 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-gray-900 border-r shadow-md flex-shrink-0"
      >
        <div className="p-4 flex justify-between items-center">
          <h1 className="text-lg font-bold text-pink-600 dark:text-pink-300">
            {collapsed ? "JH" : "JEO.H AI"}
          </h1>
          <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)}>
            <Menu className="w-5 h-5" />
          </Button>
        </div>

        <nav className="space-y-2 mt-6 px-2">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-4 py-2 hover:bg-muted rounded text-sm"
          >
            <LayoutDashboard className="w-5 h-5" />
            {!collapsed && "Dashboard"}
          </Link>
          {/* Add more nav items here */}
        </nav>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <div className="flex items-center justify-between px-4 py-2 border-b bg-white dark:bg-gray-800 shadow-sm">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={toggleTheme}>
              {theme === "dark" ? <Sun /> : <Moon />}
            </Button>
            <div className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                3
              </span>
            </div>
          </div>

          <div className="relative">
            <Button variant="ghost" onClick={() => setDropdownOpen(!dropdownOpen)}>
              <UserCircle2 className="w-7 h-7 text-pink-600" />
            </Button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  key="dropdown"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 border rounded shadow-md z-50"
                >
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 px-4 py-2"
                  >
                    <Settings className="w-4 h-4" /> Settings
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full justify-start gap-2 px-4 py-2 text-red-500"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Animated Page Content */}
        <main className="flex-1 overflow-y-auto">
          <PageWrapper animation="pageFade" key={location.pathname}>
            <Outlet />
          </PageWrapper>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;








