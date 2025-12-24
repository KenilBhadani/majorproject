// src/pages/Register.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../Componentcss/Registration.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

function isValidEmail(email) {
  return /\S+@\S+\.\S+/.test(email);
}

// 📱 Indian mobile validation
function isValidPhone(phone) {
  return /^[6-9]\d{9}$/.test(phone);
}

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  function handleChange(e) {
    let { name, value } = e.target;

    // 📱 Allow only numbers in phone
    if (name === "phone") {
      value = value.replace(/\D/g, "").slice(0, 10);
    }

    setForm(prev => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(null);
  }

  function validate() {
    if (!form.name.trim()) return "Name is required.";
    if (!form.email.trim()) return "Email is required.";
    if (!isValidEmail(form.email)) return "Invalid email address.";

    if (!form.phone) return "Mobile number is required.";
    if (!isValidPhone(form.phone))
      return "Enter valid 10-digit mobile number (starts with 6–9).";

    if (!form.password) return "Password is required.";
    if (form.password.length < 6)
      return "Password must be at least 6 characters.";

    if (form.password !== form.confirmPassword)
      return "Passwords do not match.";

    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone,
          password: form.password
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      setSuccess("Registration successful! Redirecting...");
      setForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: ""
      });

      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.message || "Server error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="reg-split-layout">
      {/* LEFT SIDE */}
      <div className="reg-image-side">
        <div className="reg-overlay">
          <h2 className="reg-brand-title">👑 RoyalPark</h2>
          <p className="reg-brand-subtitle">
            Join our exclusive community and experience luxury like never before.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="reg-form-side">
        <div className="reg-form-container">
          <div className="reg-header">
            <h1 className="reg-title">Create Account</h1>
            <p className="reg-subtitle">Sign up to book your dream stay.</p>
          </div>

          {error && <div className="reg-alert reg-error">{error}</div>}
          {success && <div className="reg-alert reg-success">{success}</div>}

          <form className="reg-form" onSubmit={handleSubmit} noValidate>
            <div className="reg-input-group">
              <label>Full Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="reg-input"
                placeholder="John Doe"
              />
            </div>

            <div className="reg-input-group">
              <label>Email Address</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="reg-input"
                placeholder="name@example.com"
              />
            </div>

            <div className="reg-input-group">
              <label>Phone Number</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="reg-input"
                placeholder="9876543210"
                maxLength="10"
              />
            </div>

            <div className="reg-row">
              <div className="reg-input-group">
                <label>Password</label>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  className="reg-input"
                  placeholder="******"
                />
              </div>

              <div className="reg-input-group">
                <label>Confirm</label>
                <input
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="reg-input"
                  placeholder="******"
                />
              </div>
            </div>

            <button type="submit" className="reg-btn" disabled={loading}>
              {loading ? "Creating..." : "Sign Up"}
            </button>
          </form>

          <div className="reg-footer">
            <p>
              Already have an account?{" "}
              <Link to="/login" className="reg-link">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
