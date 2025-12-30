import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../Componentcss/Login.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.email || !form.password) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      // ✅ STORE AUTH DATA
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("user", JSON.stringify(data.user));

      // ✅ ROLE BASED REDIRECT
      if (data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-split-layout">

      {/* LEFT SIDE: FORM */}
      <div className="login-form-side">
        <div className="login-form-container">

          <div className="login-header">
            <h1 className="login-title">Welcome Back</h1>
            <p className="login-subtitle">
              Please enter your details to sign in.
            </p>
          </div>

          {error && (
            <div className="login-alert login-error">{error}</div>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-input-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="login-input"
                placeholder="name@example.com"
              />
            </div>

            <div className="login-input-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="login-input"
                placeholder="Enter password"
              />
            </div>

            <button className="login-btn" disabled={loading}>
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          <div className="login-footer">
            <p>
              Don't have an account?
              <Link to="/register" className="login-link"> Sign up</Link>
            </p>
          </div>

        </div>
      </div>

      {/* RIGHT SIDE: IMAGE */}
      <div className="login-image-side">
        <div className="login-overlay">
          <h2 className="login-brand-title">👑 RoyalPark</h2>
          <p className="login-brand-subtitle">
            Your luxury escape awaits. Log in to manage your bookings and preferences.
          </p>
        </div>
      </div>

    </div>
  );
}
