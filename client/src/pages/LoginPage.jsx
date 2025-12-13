import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import "./LoginPage.css";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { setIsLoggedIn } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    // TODO: replace with real authentication
    console.log("Logging in:", { username, password });

    // store login state
    setIsLoggedIn(true);

    // redirect
    navigate("/home");
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
      </div>
    </div>
  );
}
