// src/layouts/MainLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import NavBar from "../components/NavBar";

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white">
      <NavBar />
      <main className="pt-20 px-4 md:px-8 lg:px-16">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;