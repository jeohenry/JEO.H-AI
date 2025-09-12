// src/hooks/useAdminAuth.js
import { useNavigate } from "react-router-dom";
import API from "../api";

export function useAdminAuth() {
  const navigate = useNavigate();

  const login = async (username, password, setError) => {
    try {
      const res = await API.post("/admin/login", { username, password });

      // Backend returns: access_token, role, username
      const { access_token, role, username: adminUsername } = res.data;

      // Store in localStorage
      localStorage.setItem("userRole", role);
      localStorage.setItem("token", access_token);
      localStorage.setItem("adminUsername", adminUsername);

      navigate("/admin/dashboard", { replace: true });
      return true; // success flag
    } catch (err) {
      setError("Invalid admin credentials");
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("token");
    localStorage.removeItem("adminUsername");
    navigate("/admin/login", { replace: true });
  };

  return { login, logout };
}