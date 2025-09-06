import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "../styles/signup.css";
import "../styles/pageBackground.css";

const Signup = () => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);

    // Email validation
    if (e.target.name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (form.email && !emailRegex.test(form.email)) setError("Invalid email format");
      else setError(null);
    }

    // Phone validation
    if (e.target.name === "phone") {
      const phoneRegex = /^\d{0,10}$/;
      if (!phoneRegex.test(e.target.value)) setError("Phone number must be digits only (max 10)");
      else if (e.target.value.length > 0 && e.target.value.length < 10) setError("Phone number must be 10 digits");
      else setError(null);
    }

    // Password validation
    if (e.target.name === "password") {
      const valid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(e.target.value);
      setPasswordValid(valid);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!passwordValid) {
      setError("Password must be at least 8 characters and include uppercase, lowercase, and a number.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    const backendURL = process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8000";
    try {
      const res = await fetch(`${backendURL}/api/users/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.email,
          email: form.email,
          password: form.password,
          phone: form.phone,
          role: "user",
          first_name: form.name.split(" ")[0] || "",
          last_name: form.name.split(" ").slice(1).join(" ") || ""
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.error || "Signup failed");
      } else {
        setSuccess("Signup successful! Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
      setError("Signup failed. Please try again.");
    }
  };

  return (
    <div className="page-background">
      <div className="signup-container">
        <div className="signup-header">
          <h1>Create Your Account</h1>
          <p>Sign up to get roadside help anytime!</p>
        </div>

        {error && <div className="signup-toast error">{error}</div>}
        {success && <div className="signup-toast success">{success}</div>}

        <form onSubmit={handleSubmit} className="signup-form">
          <input
            type="text"
            name="name"
            placeholder="Full Name *"
            value={form.name}
            onChange={handleChange}
            required
            className="signup-input"
            autoComplete="name"
          />
          <input
            type="email"
            name="email"
            placeholder="Email *"
            value={form.email}
            onChange={handleChange}
            required
            className="signup-input"
            autoComplete="email"
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone Number *"
            value={form.phone}
            onChange={handleChange}
            required
            className="signup-input"
            maxLength={10}
            autoComplete="tel"
          />

          <div className="signup-password-field">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password *"
              value={form.password}
              onChange={handleChange}
              required
              className="signup-input"
              autoComplete="new-password"
            />
            <span
              className="toggle-password"
              tabIndex={0}
              role="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((v) => !v)}
              onKeyUp={e => (e.key === "Enter" || e.key === " ") && setShowPassword(v => !v)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          {form.password && !passwordValid && (
            <div className="input-hint error">
              Password must be at least 8 characters and include uppercase, lowercase, and a number.
            </div>
          )}

          <div className="signup-password-field">
            <input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password *"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              className="signup-input"
              autoComplete="new-password"
            />
            {form.confirmPassword && (
              <span className="password-match">
                {form.password === form.confirmPassword ? "✅" : "❌"}
              </span>
            )}
          </div>

          <button type="submit" className="signup-btn" disabled={loading}>
            {loading ? "Signing up..." : "Signup"}
          </button>

          {loading && (
            <div className="signup-loading-bar">
              <div className="signup-loading-progress" />
            </div>
          )}
        </form>

        <div className="signup-footer">
          <span>Already have an account?</span>
          <span
            className="signup-link"
            tabIndex={0}
            onClick={() => navigate("/login")}
          >
            Login here
          </span>
        </div>
      </div>
    </div>
  );
};

export default Signup;
