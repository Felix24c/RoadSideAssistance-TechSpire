import React from 'react';
import '../styles/footer.css';
import backendURL from "./config";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <p className="footer-text">
          © {new Date().getFullYear()} QuickAssist by Team TechSpire.
        </p>
        <ul className="footer-links">
          <li><a href="/about">About</a></li> | 
          <li><a href="/contact">Contact</a></li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;
