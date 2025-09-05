// src/routes/RelationshipAdminRoutes.jsx
import React from "react";
import { Route } from "react-router-dom";
import PageWrapper from "@/components/PageWrapper";
import { slideUp, scaleFade } from "@/config/animations";

import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminGlobalAnalytics from "@/pages/admin/AdminGlobalAnalytics";
import AdminAnalytics from "@/pages/admin/AdminAnalytics";
import MergedFlaggedReports from "@/pages/admin/MergedFlaggedReports";
import AdminLogin from "@/pages/admin/AdminLogin";
import ProtectedAdminRoute from "@/routes/ProtectedAdminRoute";
import AdminLayout from "@/layouts/AdminLayout";

const RelationshipAdminRoutes = () => (
  <>
    {/* Public Admin Login */}
    <Route
      path="admin/login"
      element={
        <PageWrapper animation={scaleFade}>
          <AdminLogin />
        </PageWrapper>
      }
    />

    {/* Protected Admin Routes with Layout */}
    <Route
      path="admin"
      element={
        <ProtectedAdminRoute>
          <AdminLayout />
        </ProtectedAdminRoute>
      }
    >
      <Route
        path="dashboard"
        element={
          <PageWrapper animation={slideUp}>
            <AdminDashboard />
          </PageWrapper>
        }
      />
      <Route
        path="global-analytics"
        element={
          <PageWrapper animation={scaleFade}>
            <AdminGlobalAnalytics />
          </PageWrapper>
        }
      />
      <Route
        path="analytics"
        element={
          <PageWrapper animation={scaleFade}>
            <AdminAnalytics />
          </PageWrapper>
        }
      />
      <Route
        path="flags"
        element={
          <PageWrapper animation={slideUp}>
            <MergedFlaggedReports />
          </PageWrapper>
        }
      />
    </Route>
  </>
);

export default RelationshipAdminRoutes;