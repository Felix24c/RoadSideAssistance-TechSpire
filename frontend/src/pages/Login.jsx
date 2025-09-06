import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";
import "../styles/pageBackground.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
    if (e.target.name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (form.email && !emailRegex.test(form.email)) setError("Invalid email format");
      else setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setSuccess(false);

    const backendURL = process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8000";
    try {
      const res = await fetch(`${backendURL}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });
      const data = await res.json();
      setLoading(false);

      if (!res.ok || data.error) {
        setError(data.error || "Invalid credentials");
      } else {
        // store JWT token and user info
        localStorage.setItem("access", data.access || "");
localStorage.setItem("userId", data.user_id);
localStorage.setItem("username", data.username);
localStorage.setItem("email", data.email);
localStorage.setItem("role", data.role);


        setSuccess(true);
        setTimeout(() => {
          if (data.role === "provider") {
  navigate("/provider-dashboard");
} else {
  navigate("/");
}

        }, 1400);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
      setError("Login failed. Try again.");
    }
  };

  return (
    <div className="page-background">
      <div className="login-viewport">
      <div className="login-container">
        <div className="login-header">
          <h1>Sign in to QuickAssist</h1>
          <p>Welcome back, please log in to continue</p>
        </div>
        {error && <div className="login-toast error">{error}</div>}
        {success && <div className="login-toast success">Login successful! Redirecting…</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={form.email}
            onChange={handleChange}
            autoComplete="username"
            required
            className="login-input"
          />

          <div className="login-password-field">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
              className="login-input"
            />
            <span
  className="toggle-password"
  tabIndex={0}
  role="button"
  aria-label={showPassword ? "Hide password" : "Show password"}
  onClick={() => setShowPassword((v) => !v)}
  onKeyUp={e => (e.key === "Enter" || e.key === " ") && setShowPassword((v) => !v)}
>
  {showPassword ? <FaEyeSlash /> : <FaEye />}
</span>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Logging in…" : "Login"}
          </button>

          {loading && (
            <div className="loading-bar">
              <div className="loading-progress" />
            </div>
          )}
        </form>

        <div className="login-footer">
          <span>Don't have an account?</span>
          <span
            className="login-link"
            tabIndex={0}
            onClick={() => navigate("/signup")}
          >
            Sign up here
          </span>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Login;
