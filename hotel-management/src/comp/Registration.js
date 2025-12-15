// src/pages/Register.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import '../Componentcss/Registration.css'; // make sure path is correct

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

function isValidEmail(email) {
  return /\S+@\S+\.\S+/.test(email);
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
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
    setSuccess(null);
  }

  function validate() {
    if (!form.name.trim()) return "Name is required.";
    if (!form.email.trim()) return "Email is required.";
    if (!isValidEmail(form.email)) return "Invalid email address.";
    if (!form.phone.trim()) return "Phone is required.";
    if (!form.password) return "Password is required.";
    if (form.password.length < 6) return "Password must be at least 6 characters.";
    if (form.password !== form.confirmPassword) return "Passwords do not match.";
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
          phone: form.phone.trim(),
          password: form.password
        })
      });

      const text = await res.text(); // safe parsing (server might return HTML on error)
      let data = null;
      try { data = JSON.parse(text); } catch (err) { /* not JSON */ }

      if (!res.ok) {
        const msg = (data && (data.message || data.error)) || text || "Registration failed";
        throw new Error(msg);
      }

      // success
      const message = (data && (data.message || "Registration successful")) || "Registration successful";
      setSuccess(message);
      setForm({ name: "", email: "", phone: "", password: "", confirmPassword: "" });

      // optional: navigate to login after a short delay
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      console.error("Register error:", err);
      // if server returned HTML (text begins with "<"), show friendly message
      const msg = err.message || "Server error";
      setError(msg.startsWith("<") ? "Server returned an HTML page. Check backend." : msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="reg-page">
      <div className="reg-card" role="region" aria-labelledby="reg-heading">
        <h1 id="reg-heading" className="reg-title">Create an account</h1>

        {error && <div className="reg-alert reg-alert-error" role="alert">{error}</div>}
        {success && <div className="reg-alert reg-alert-success" role="status">{success}</div>}

        <form className="reg-form" onSubmit={handleSubmit} noValidate>
          <label className="reg-label">
            Full name
            <input name="name" value={form.name} onChange={handleChange} className="reg-input" placeholder="Your full name" />
          </label>

          <label className="reg-label">
            Email
            <input name="email" type="email" value={form.email} onChange={handleChange} className="reg-input" placeholder="name@example.com" />
          </label>

          <label className="reg-label">
            Phone
            <input name="phone" value={form.phone} onChange={handleChange} className="reg-input" placeholder="Enter Mobile Number" />
          </label>

          <label className="reg-label">
            Password
            <input name="password" type="password" value={form.password} onChange={handleChange} className="reg-input" placeholder="At least 6 characters" />
          </label>

          <label className="reg-label">
            Confirm password
            <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} className="reg-input" placeholder="Repeat password" />
          </label>

          <button type="submit" className="reg-btn" disabled={loading}>
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <div className="reg-footer">
          <span>Already have an account? <button className="link-btn" onClick={() => navigate("/login")}>Login</button></span>
         
        </div> 
      </div>
    </div>
  );
}
