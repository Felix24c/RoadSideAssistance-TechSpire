import React, { useState } from "react";
import { Link } from "react-router-dom";
import backendURL from "./config";
import "../styles/navbar.css";

const Navbar = () => {
  const role = localStorage.getItem("role"); // "user", "provider", or null
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  // If no role, render minimal navbar
  if (!role) {
    return (
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">QuickAssist</div>

          {/* Hamburger button */}
          <button className="nav-toggle" onClick={toggleMenu} aria-label="Toggle menu">
            <span className="hamburger"></span>
          </button>

          <ul className={`nav-links ${menuOpen ? "nav-active" : ""}`}>
            <li>
              <Link to="/login" className="nav-link" onClick={() => setMenuOpen(false)}>
                Login
              </Link>
            </li>
            <li>
              <Link to="/about" className="nav-link" onClick={() => setMenuOpen(false)}>
                About
              </Link>
            </li>
            <li>
              <Link to="/contact" className="nav-link" onClick={() => setMenuOpen(false)}>
                Contact
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    );
  }

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-logo">QuickAssist</div>

        {/* Hamburger button */}
        <button className="nav-toggle" onClick={toggleMenu} aria-label="Toggle menu">
          <span className="hamburger"></span>
        </button>

        <ul className={`nav-links ${menuOpen ? "nav-active" : ""}`}>
          {/* Role-specific links */}
          {role === "user" && (
            <>
              <li>
                <Link to="/" className="nav-link user-link nav-home" onClick={() => setMenuOpen(false)}>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/myrequests" className="nav-link user-link" onClick={() => setMenuOpen(false)}>
                  My Past Requests
                </Link>
              </li>
            </>
          )}

          {role === "provider" && (
            <>
              <li>
                <Link to="/provider-dashboard" className="nav-link provider-link nav-home" onClick={() => setMenuOpen(false)}>
                  Provider Dashboard
                </Link>
              </li>
              <li>
                <Link to="/provider-past-jobs" className="nav-link provider-link" onClick={() => setMenuOpen(false)}>
                  Provider Past Jobs
                </Link>
              </li>
            </>
          )}

          {/* Common links */}
          <li>
            <Link to="/about" className="nav-link" onClick={() => setMenuOpen(false)}>
              About
            </Link>
          </li>
          <li>
            <Link to="/contact" className="nav-link" onClick={() => setMenuOpen(false)}>
              Contact
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
