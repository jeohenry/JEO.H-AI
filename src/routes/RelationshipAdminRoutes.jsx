import React from "react";
import { Route } from "react-router-dom";
import PageWrapper from "@/components/PageWrapper";
import { slideUp, scaleFade } from "@/config/animations";

import AdminDashboard from "@/pages/Admin/AdminDashboard";
import AdminGlobalAnalytics from "@/pages/Admin/AdminGlobalAnalytics";
import AdminAnalytics from "@/pages/Admin/AdminAnalytics";
import MergedFlaggedReports from "@/pages/Admin/MergedFlaggedReports";

const AdminRoutes = () => (
  <>
    <Route path="admin-dashboard" element={<PageWrapper animation={slideUp}><AdminDashboard /></PageWrapper>} />
    <Route path="admin/jeoh-analytics" element={<PageWrapper animation={scaleFade}><AdminGlobalAnalytics /></PageWrapper>} />
    <Route path="admin/analytics" element={<PageWrapper animation={scaleFade}><AdminAnalytics /></PageWrapper>} />
    <Route path="admin/flags" element={<PageWrapper animation={slideUp}><MergedFlaggedReports /></PageWrapper>} />
  </>
);

export default AdminRoutes;
