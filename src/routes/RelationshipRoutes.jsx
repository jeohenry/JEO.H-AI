//src/routes/RelationshipRoutes.jsx

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import RelationshipLayout from "@/layouts/RelationshipLayout";

import PublicRoutes from "@/routes/RelationshipPublicRoutes";
import UserRoutes from "@/routes/RelationshipUserRoutes";
import AdminRoutes from "@/routes/RelationshipAdminRoutes";

const getRole = () => localStorage.getItem("role");
const isAuthenticated = () => !!localStorage.getItem("token");

const RelationshipRoutes = () => {
  const role = getRole();

  return (
    <Routes>
      <PublicRoutes />

      {isAuthenticated() && (
        <Route element={<RelationshipLayout />}>
          {role === "user" && <UserRoutes />}
          {role === "admin" && <AdminRoutes />}
        </Route>
      )}

      {/* Redirect fallback */}
      <Route
        path="*"
        element={
          <Navigate
            to={
              isAuthenticated()
                ? role === "admin"
                  ? "/relationship/admin-dashboard"
                  : "/relationship/feed"
                : "/relationship/login"
            }
          />
        }
      />
    </Routes>
  );
};

export default RelationshipRoutes;