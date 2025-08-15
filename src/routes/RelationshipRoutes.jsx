import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import RelationshipLayout from "@/layouts/RelationshipLayout";

import PublicRoutes from "./relationship.public.routes";
import UserRoutes from "./relationship.user.routes";
import AdminRoutes from "./relationship.admin.routes";

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