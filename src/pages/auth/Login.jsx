// src/pages/Auth/Login.jsx

import React, { useState, useEffect } from "react";
import axios from "@/api";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // ✅ Redirect to language selector if not chosen
  useEffect(() => {
    const lang = localStorage.getItem("i18nextLng");
    if (!lang) {
      navigate("/relationship/language");
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/login", { email, password });
      localStorage.setItem("user_id", res.data.user_id);
      navigate("/relationship/Feed");
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form
        onSubmit={handleLogin}
        className="bg-white shadow-md p-6 rounded-md w-full max-w-md"
      >
        <h2 className="text-xl font-bold mb-4">Login</h2>
        {error && <p className="text-red-500 mb-2">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 p-3 mb-3 rounded-lg bg-white shadow-sm transition-all duration-200 placeholder-gray-500 text-gray-800"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 p-3 mb-3 rounded-lg bg-white shadow-sm transition-all duration-200 placeholder-gray-500 text-gray-800"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Login
        </button>

        <p className="text-sm mt-4">
          Don’t have an account?{" "}
          <span
            className="text-blue-600 cursor-pointer"
            onClick={() => navigate("/relationship/register")}
          >
            Register
          </span>
        </p>
      </form>
    </div>
  );
};

export default Login;