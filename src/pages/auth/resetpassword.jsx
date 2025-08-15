// src/auth/ResetPassword.jsx
import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "../api";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/auth/reset-password", {
        token,
        new_password: password,
      });
      setDone(true);
    } catch (err) {
      alert("Invalid or expired token");
    }
  };

  return (
    <div>
      <h2>Set New Password</h2>
      {done ? (
        <p>Password reset successfully. You can now log in.</p>
      ) : (
        <form onSubmit={handleSubmit}>
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
    </div>
  );
};

export default ResetPassword;