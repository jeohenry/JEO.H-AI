//src/routes/RelationshipRoutes.jsx

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import RelationshipLayout from "@/layouts/RelationshipLayout";

import RelationshipPublicRoutes from "@/routes/RelationshipPublicRoutes";
import RelationshipUserRoutes from "@/routes/RelationshipUserRoutes";
import RelationshipAdminRoutes from "@/routes/RelationshipAdminRoutes";
import ProtectedRoute from "@/routes/ProtectedRoute";

const getRole = () => localStorage.getItem("role");
const isAuthenticated = () => !!localStorage.getItem("token");

const RelationshipRoutes = () => {
  const role = getRole();
  const authRedirect = isAuthenticated()
    ? role === "admin"
      ? "/relationship/admin/dashboard"
      : "/relationship/feed"
    : "/relationship/login";

  return (
    <Routes>
      {/* Public Routes */}
      <RelationshipPublicRoutes />

      {/* User Routes */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["user"]}>
            <RelationshipLayout />
          </ProtectedRoute>
        }
      >
        <RelationshipUserRoutes />
      </Route>

      {/* Admin Routes */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <RelationshipLayout />
          </ProtectedRoute>
        }
      >
        <RelationshipAdminRoutes />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to={authRedirect} replace />} />
    </Routes>
  );
};

export default RelationshipRoutes;