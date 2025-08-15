// src/auth/PasswordReset.jsx
import React, { useState } from "react";
import axios from "../api";

const PasswordReset = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/auth/request-password-reset", { email });
      setSent(true);
    } catch (err) {
      alert("Error sending reset email");
    }
  };

  return (
    <div>
      <h2>Reset Password</h2>
      {sent ? (
        <p>Reset link sent to your email</p>
      ) : (
        <form onSubmit={handleSubmit}>
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
    </div>
  );
};

export default PasswordReset;