//src/components/SidebarWrapper.jsx

import React from "react";
import AdminSidebar from "@/components/AdminSidebar";
import UserSidebar from "@/components/UserSidebar";

const SidebarWrapper = () => {
  const role = localStorage.getItem("role");

  if (role === "admin") {
    return <AdminSidebar />;
  } else if (role === "user") {
    return <UserSidebar />;
  } else {
    return null; // Not logged in or no role
  }
};

export default SidebarWrapper;
