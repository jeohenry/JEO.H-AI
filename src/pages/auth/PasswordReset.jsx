// src/pages/auth/PasswordReset.jsx

import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import API from "@/api"; // ✅ Import the preconfigured Axios instance

const PasswordReset = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  // States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState(""); // "sent", "done", or ""

  // ✅ Step 1: Request password reset link
  const handleRequest = async (e) => {
    e.preventDefault();
    try {
      await API.post("/relationship/password-reset", { email });
      setStatus("sent");
    } catch (err) {
      alert(err.response?.data?.detail || "Error sending reset email");
    }
  };

  // ✅ Step 2: Confirm and set new password
  const handleReset = async (e) => {
    e.preventDefault();
    try {
      await API.post("/relationship/password-reset/confirm", {
        email,
        new_password: password,
      });
      setStatus("done");
      setTimeout(() => navigate("/relationship/login"), 2000);
    } catch (err) {
      alert(err.response?.data?.detail || "Invalid or expired reset attempt");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 shadow-lg p-6 rounded-2xl w-full max-w-md">
        {!token ? (
          <>
            <h2 className="text-xl font-semibold mb-6 text-center text-gray-800 dark:text-gray-100">
              Reset Password
            </h2>

            {status === "sent" ? (
              <p className="text-green-600 text-center">
                Reset link sent to your email.
              </p>
            ) : (
              <form onSubmit={handleRequest}>
                <input
                  type="email"
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border-2 border-gray-300 dark:border-gray-600 
                             focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
                             p-3 mb-4 rounded-lg shadow-sm
                             bg-white dark:bg-gray-700 
                             text-gray-900 dark:text-white
                             placeholder-gray-400 dark:placeholder-gray-500"
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg shadow-md transition-all"
                >
                  Send Reset Link
                </button>
              </form>
            )}
          </>
        ) : (
          <>
            <h2 className="text-xl font-semibold mb-6 text-center text-gray-800 dark:text-gray-100">
              Set New Password
            </h2>

            {status === "done" ? (
              <p className="text-green-600 text-center">
                Password reset successfully! Redirecting...
              </p>
            ) : (
              <form onSubmit={handleReset}>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border-2 border-gray-300 dark:border-gray-600 
                             focus:border-green-500 focus:ring-2 focus:ring-green-200 
                             p-3 mb-4 rounded-lg shadow-sm
                             bg-white dark:bg-gray-700 
                             text-gray-900 dark:text-white
                             placeholder-gray-400 dark:placeholder-gray-500"
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg shadow-md transition-all"
                >
                  Reset Password
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PasswordReset;