// src/pages/Auth/Login.jsx
import React, { useState, useEffect } from "react";
import API from "@/api"; // ✅ import the preconfigured Axios instance
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const lang = localStorage.getItem("i18nextLng");
    if (!lang) navigate("/relationship/language");
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/login", form); // ✅ use API instead of axios
      localStorage.setItem("user_id", res.data.user_id);
      navigate("/relationship/Feed");
    } catch (err) {
      console.error(err);
      setError("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form
        onSubmit={handleLogin}
        className="bg-white shadow-md p-6 rounded-xl w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>

        {error && <p className="text-red-500 text-center mb-3">{error}</p>}

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full border-2 border-gray-300 focus:border-blue-500 focus:ring-2 
                     focus:ring-blue-200 p-3 mb-4 rounded-lg 
                     bg-white text-black placeholder-gray-500 
                     shadow-sm transition-all duration-200"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full border-2 border-gray-300 focus:border-blue-500 focus:ring-2 
                     focus:ring-blue-200 p-3 mb-4 rounded-lg 
                     bg-white text-black placeholder-gray-500 
                     shadow-sm transition-all duration-200"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-medium py-3 rounded-lg 
                     hover:bg-blue-700 transition-colors duration-200 shadow-md"
        >
          Login
        </button>

        <p className="text-sm text-center mt-5">
          Don’t have an account?{" "}
          <span
            className="text-blue-600 font-medium cursor-pointer hover:underline"
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