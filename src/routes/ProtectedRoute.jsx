//src/routes/ProtectedRoute.jsx

import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-100 to-rose-200 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-pink-500 border-solid"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/relationship/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <Navigate
        to={
          user.role === "admin"
            ? "/relationship/admin/dashboard"
            : "/relationship/feed"
        }
        replace
      />
    );
  }

  return children;
};

export default ProtectedRoute;