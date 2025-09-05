// src/pages/auth/PasswordReset.jsx
import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "@/api";

const PasswordReset = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token"); // check if token exists
  const navigate = useNavigate();

  // States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState(""); // "sent", "done", or ""

  // Step 1: Request reset link
  const handleRequest = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/auth/request-password-reset", { email });
      setStatus("sent");
    } catch (err) {
      alert("Error sending reset email");
    }
  };

  // Step 2: Reset password
  const handleReset = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/auth/reset-password", {
        token,
        new_password: password,
      });
      setStatus("done");
      setTimeout(() => navigate("/login"), 2000); // redirect after success
    } catch (err) {
      alert("Invalid or expired token");
    }
  };

  return (
    <div>
      {/* If token exists → show reset form */}
      {token ? (
        <>
          <h2>Set New Password</h2>
          {status === "done" ? (
            <p>Password reset successfully! Redirecting to login...</p>
          ) : (
            <form onSubmit={handleReset}>
              <input
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="submit">Reset Password</button>
            </form>
          )}
        </>
      ) : (
        <>
          <h2>Reset Password</h2>
          {status === "sent" ? (
            <p>Reset link sent to your email.</p>
          ) : (
            <form onSubmit={handleRequest}>
              <input
                type="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit">Send Reset Link</button>
            </form>
          )}
        </>
      )}
    </div>
  );
};

export default PasswordReset;
