import React from 'react';
import '../styles/about.css';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import '../styles/pageBackground.css';

// FAQs data
const faqs = [
  {
    question: "What services does QuickAssist offer?",
    answer: "QuickAssist provides roadside assistance like accident help, mechanical repair, battery jumpstart, and location tracking."
  },
  {
    question: "How quickly can you reach me?",
    answer: "Our real-time tracking ensures our team reaches you as fast as possible, usually within 30 minutes depending on your location."
  },
  {
    question: "Is QuickAssist available 24/7?",
    answer: "Absolutely! We’re here around the clock to support you anytime, anywhere."
  },
  {
    question: "How do I contact QuickAssist in an emergency?",
    answer: "You can use the Contact page or call our emergency hotline visible on our website anytime."
  }
];

const About = () => {
  return (
    <div className="page-background">
      <section className="about-section">
        <div className="about-container">

          {/* Header */}
          <header className="about-header">
            <h1>About QuickAssist</h1>
            <p>Your trusted partner for quick and reliable roadside assistance.</p>
          </header>

            {/* TechSpire */}
          <section className="about-techspire">
            <h2>Developed by Team TechSpire</h2>
          </section>

          {/* Mission */}
          <section className="about-mission">
            <h2>Our Mission</h2>
            <p>At QuickAssist, our mission is to provide fast, friendly, and efficient roadside help to drivers in need, making every journey safer and stress-free.</p>
          </section>

          {/* Core Values */}
          <section className="about-values">
            <h2>Our Core Values</h2>
            <ul>
              <li><strong>Reliability:</strong> We’re always ready when you need us.</li>
              <li><strong>Safety:</strong> Your safety is our top priority.</li>
              <li><strong>Transparency:</strong> Clear communication, no hidden fees.</li>
              <li><strong>Customer Care:</strong> Friendly support from real people.</li>
            </ul>
          </section>

          {/* FAQs */}
          <section className="about-faq">
            <h2>FAQs</h2>
            {faqs.map((faq, index) => (
              <div key={index} className="faq-item">
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </div>
            ))}
          </section>
          
         

          {/* Social Links */}
          <section className="about-social">
            <h2>Connect with Us</h2>
            <div className="social-icons">
              <a href="https://facebook.com/QuickAssist" target="_blank" rel="noopener noreferrer"><FaFacebookF /></a>
              <a href="https://twitter.com/QuickAssist" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
              <a href="https://instagram.com/QuickAssist" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
              <a href="https://linkedin.com/company/QuickAssist" target="_blank" rel="noopener noreferrer"><FaLinkedinIn /></a>
            </div>
          </section>

         

        </div>
      </section>
    </div>
  );
};

export default About;
