//src/context/AuthContext.jsx

import React, { createContext, useEffect, useState } from "react";
import axios from "@/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
      setUser(null);
      setLoading(false);
      return;
    }

    axios
      .get(`/relationship/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
        skipLoading: true, // Prevent loading indicator for this auth check
      })
      .then((res) => {
        setUser({ ...res.data, token }); // store role + token
      })
      .catch((err) => {
        console.log("🔐 Auth check failed:", err.message);
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};