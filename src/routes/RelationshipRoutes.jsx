//src/routes/RelationshipRoutes.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "@/routes/ProtectedRoute";
import PageWrapper from "@/components/PageWrapper";

// Import public route components directly
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import PasswordReset from "@/pages/auth/PasswordReset";
import LanguageSelector from "@/pages/auth/LanguageSelector";

// Import relationship layout and pages
import RelationshipLayout from "@/layouts/RelationshipLayout";
import Profile from "@/pages/relationship/Profile";
import Feed from "@/pages/relationship/Feed";
import ChatRoom from "@/pages/relationship/ChatRoom";
import MatchMaker from "@/pages/relationship/MatchMaker";
import Advice from "@/pages/relationship/Advice";
import GroupVideoCall from "@/pages/relationship/GroupVideoCall";
import LiveVideoChat from "@/pages/relationship/LiveVideoChat";
import Notifications from "@/pages/relationship/Notifications";
import UploadPicture from "@/pages/relationship/Upload";
import LiveTranslatorTabs from "@/modules/LiveTranslatorTabs";
import TranslatedFeed from "@/pages/relationship/TranslatedFeed";
import RelationshipTools from "@/pages/relationship/RelationshipTools";
import TranslatedPost from "@/pages/post/TranslatedPost";

// Import admin components
import AdminLayout from "@/layouts/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminGlobalAnalytics from "@/pages/admin/AdminGlobalAnalytics";
import AdminAnalytics from "@/pages/admin/AdminAnalytics";
import MergedFlaggedReports from "@/pages/admin/MergedFlaggedReports";
import AdminLogin from "@/pages/admin/AdminLogin";

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
      <Route path="language" element={<LanguageSelector />} />
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
      <Route path="password-reset" element={<PasswordReset />} />

      {/* Admin Login (Public) */}
      <Route path="admin/login" element={<AdminLogin />} />

      {/* Protected User Routes */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute allowedRoles={["user"]}>
            <RelationshipLayout />
          </ProtectedRoute>
        }
      >
        <Route path="profile" element={<Profile />} />
        <Route path="feed" element={<Feed />} />
        <Route path="translated-feed" element={<TranslatedFeed />} />
        <Route path="post/:id/translated" element={<TranslatedPost />} />
        <Route path="chatroom" element={<ChatRoom />} />
        <Route path="matchmaker" element={<MatchMaker />} />
        <Route path="advice" element={<Advice />} />
        <Route path="tools" element={<RelationshipTools />} />
        <Route path="group-video-call" element={<GroupVideoCall />} />
        <Route path="live-video-chat" element={<LiveVideoChat />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="upload" element={<UploadPicture />} />
        <Route path="translate" element={<LiveTranslatorTabs />} />
      </Route>

      {/* Protected Admin Routes */}
      <Route 
        path="admin/*" 
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="global-analytics" element={<AdminGlobalAnalytics />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="flags" element={<MergedFlaggedReports />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to={authRedirect} replace />} />
    </Routes>
  );
};

export default RelationshipRoutes