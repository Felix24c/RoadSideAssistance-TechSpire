import React from 'react';
import '../styles/contact.css';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import '../styles/pageBackground.css';

const Contact = () => {

  return (
    <div className="page-background">
      <div className="contact-container">
        <header className="contact-header">
          <h1>Contact QuickAssist</h1>
          <p>We’re here to help. Reach out anytime.</p>
        </header>

        <section className="contact-info">
          <h2>Contact Information</h2>
          <p><strong>Phone:</strong> +91 234 567 8901</p>
          <p><strong>Email:</strong> support@quickassist.com</p>
          <p><strong>Address:</strong> Panjim Goa</p>
        </section>

        <section className="contact-social">
          <h2>Follow Us</h2>
          <div className="social-icons">
            <a href="https://facebook.com/QuickAssist" target="_blank" rel="noopener noreferrer"><FaFacebookF /></a>
            <a href="https://twitter.com/QuickAssist" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
            <a href="https://instagram.com/QuickAssist" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
            <a href="https://linkedin.com/company/QuickAssist" target="_blank" rel="noopener noreferrer"><FaLinkedinIn /></a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Contact;
