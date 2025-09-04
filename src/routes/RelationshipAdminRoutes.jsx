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

const RelationshipAdminRoutes = () => (
  <>
    {/* Public Admin Login */}
    <Route path="admin/login" element={<PageWrapper animation={scaleFade}><AdminLogin /></PageWrapper>} />

    {/* Protected Admin Routes */}
    <Route
      path="admin/dashboard"
      element={
        <ProtectedAdminRoute>
          <PageWrapper animation={slideUp}><AdminDashboard /></PageWrapper>
        </ProtectedAdminRoute>
      }
    />
    <Route
      path="admin/global-analytics"
      element={
        <ProtectedAdminRoute>
          <PageWrapper animation={scaleFade}><AdminGlobalAnalytics /></PageWrapper>
        </ProtectedAdminRoute>
      }
    />
    <Route
      path="admin/analytics"
      element={
        <ProtectedAdminRoute>
          <PageWrapper animation={scaleFade}><AdminAnalytics /></PageWrapper>
        </ProtectedAdminRoute>
      }
    />
    <Route
      path="admin/flags"
      element={
        <ProtectedAdminRoute>
          <PageWrapper animation={slideUp}><MergedFlaggedReports /></PageWrapper>
        </ProtectedAdminRoute>
      }
    />
  </>
);

export default RelationshipAdminRoutes;