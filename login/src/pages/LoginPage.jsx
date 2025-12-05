import React, { useState } from "react";
import "./LoginPage.css";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Logging in:", { username, password });
  };

  return (
    <div className="ds-container">
      <div className="ds-box">
        <h1 className="ds-title">Welcome Back</h1>
        <p className="ds-subtitle">Log in to continue</p>

        <form onSubmit={handleLogin} className="ds-form">
          <div className="ds-input-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="ds-input-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="ds-login-btn">
            Login
          </button>
        </form>

        <p className="ds-footer">
          Don't have an account?{" "}
          <span
            className="ds-link"
            onClick={() => alert("Go to create account")}
          >
            Create account
          </span>
        </p>
      </div>
    </div>
  );
}
