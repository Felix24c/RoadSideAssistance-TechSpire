import React, { useEffect, useState } from "react";
import "../styles/home.css";
import "../styles/pageBackground.css";
import '../styles/global.css';
import { Link, useNavigate } from "react-router-dom";
import { FaCarCrash, FaHistory, FaSignOutAlt } from "react-icons/fa";

const heroFeatures = [
  {
    icon: <FaCarCrash />,
    title: "24/7 Roadside",
    desc: "Breakdowns, flats, batteries, or fuel delivery—relief is always a click away."
  },
  {
    icon: <FaHistory />,
    title: "Your Requests",
    desc: "All past and active service calls are tracked in your dashboard."
  },
  {
    icon: <FaSignOutAlt />,
    title: "1-Tap Logout",
    desc: "Securely log out instantly from everywhere."
  }
];

const Home = () => {
  const [backendStatus, setBackendStatus] = useState("Checking...");
  const navigate = useNavigate();

  // Example: get username (if you set it on login/signup)
  const username = localStorage.getItem("userName") || "";

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    const backendURL = process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8000";
    fetch(`${backendURL}/api/health`)
      .then((res) => res.json())
      .then((data) => setBackendStatus(data.status === "OK" ? "✅ Online" : String(data.status)))
      .catch(() => setBackendStatus("❌ Backend not reachable"));
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="page-background">
      <div className="home-container">
        {/* Left column: Hero section */}
        <div className="home-hero">
          <h1>{username ? `Welcome, ${username}!` : "Welcome to QuickAssist"}</h1>
          <p>
            Stuck on the road? We’re just a click away.<br />
            Fast, friendly help for breakdowns, flat tires, or emergencies.
          </p>
          <div className="backend-status">
            Backend Status: <span>{backendStatus}</span>
          </div>
          <button className="cta-btn" onClick={() => navigate("/select-service")}>
            Get Help Now
          </button>
          <div className="shortcut-links">
            <Link to="/myrequests" className="shortcut-btn">
              <FaHistory /> My Requests
            </Link>
            <Link to="/about" className="shortcut-btn">
              About Us
            </Link>
            <button className="shortcut-btn logout" onClick={handleLogout}>
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>
        </div>
        
        {/* Right column: Feature highlights */}
        <div className="home-container">
        <div className="home-features">
          {heroFeatures.map((item, i) => (
            <div className="feature-card compact" key={i}>
              <span className="feature-icon">{item.icon}</span>
              <div className="feature-title">{item.title}</div>
              <div className="feature-desc">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
