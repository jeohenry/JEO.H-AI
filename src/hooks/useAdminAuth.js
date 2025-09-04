// src/hooks/useAdminAuth.js
import { useNavigate } from "react-router-dom";
import API from "../api";

export function useAdminAuth() {
  const navigate = useNavigate();

  const login = async (username, password, setError) => {
    try {
      const res = await API.post("/admin/login", { username, password });
      localStorage.setItem("userRole", "admin");
      localStorage.setItem("token", res.data.token);

      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      setError("Invalid admin credentials");
    }
  };

  const logout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("token");
    navigate("/admin/login", { replace: true });
  };

  return { login, logout };
}