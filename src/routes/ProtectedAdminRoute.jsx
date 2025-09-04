// src/routes/ProtectedAdminRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedAdminRoute = ({ children }) => {
  const role = localStorage.getItem("userRole");
  const token = localStorage.getItem("token");

  if (role !== "admin" || !token) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default ProtectedAdminRoute;