// src/pages/Auth/Register.jsx
import React, { useState, useEffect } from "react";
import axios from "@/api";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    username: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // ✅ Redirect if no language chosen
  useEffect(() => {
    const lang = localStorage.getItem("i18nextLng");
    if (!lang) {
      navigate("/relationship/language");
    }
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/relationship/register", form); // ✅ unified backend path
      alert("Registration successful. Please check your email.");
      navigate("/relationship/login");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to register. Try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-900">
      <form
        onSubmit={handleRegister}
        className="bg-white dark:bg-gray-800 shadow-lg p-6 rounded-2xl w-full max-w-md transition-all duration-300"
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100 text-center">
          Create an Account
        </h2>

        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}

        {/* Input Field Reusable Style */}
        {[
          { name: "name", type: "text", placeholder: "Full Name" },
          { name: "username", type: "text", placeholder: "Username" },
          { name: "email", type: "email", placeholder: "Email" },
          { name: "password", type: "password", placeholder: "Password" },
        ].map((field) => (
          <input
            key={field.name}
            type={field.type}
            name={field.name}
            placeholder={field.placeholder}
            value={form[field.name]}
            onChange={handleChange}
            className="w-full border-2 border-gray-300 dark:border-gray-600 
                       focus:border-green-500 focus:ring-2 focus:ring-green-300 
                       p-3 mb-4 rounded-lg shadow-sm transition-all duration-200
                       placeholder-gray-400 dark:placeholder-gray-500
                       bg-white dark:bg-gray-700
                       text-gray-900 dark:text-white"
            required
          />
        ))}

        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg shadow-md transition-all"
        >
          Register
        </button>

        <p className="text-sm mt-6 text-center text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <span
            className="text-blue-600 dark:text-blue-400 cursor-pointer hover:underline"
            onClick={() => navigate("/relationship/login")}
          >
            Login
          </span>
        </p>
      </form>
    </div>
  );
};

export default Register;