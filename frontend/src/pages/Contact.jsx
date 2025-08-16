import React, { useState } from 'react';
import '../styles/contact.css';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import '../styles/pageBackground.css';

const faqs = [
  {
    question: "How do I request roadside assistance?",
    answer: "Use our Services page or contact us directly via phone or the contact form below."
  },
  {
    question: "Is there a charge for emergency calls?",
    answer: "Emergency calls are free; service charges apply depending on the assistance required."
  },
  {
    question: "What information do I need to provide?",
    answer: "Your location, vehicle details, and a description of the problem help us assist you better."
  },
  {
    question: "Can I track the assistance team?",
    answer: "Yes, our location tracking service lets you see the team’s arrival in real-time."
  }
];

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState({});

  // Basic validation function
  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Name is required.";
    if (!formData.email.trim()) {
      errors.email = "Email is required.";
    } else {
      // simple email regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = "Invalid email format.";
      }
    }
    if (!formData.message.trim()) errors.message = "Message is required.";
    return errors;
  };

  const handleChange = e => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = e => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      alert(`Thank you, ${formData.name}! Your message has been sent.`);
      setFormData({ name: '', email: '', message: '' });
      setErrors({});
    }
  };

  return (
    <div className="page-background">
    <div className="contact-container">
      <header className="contact-header">
        <h1>Contact QuickAssist</h1>
        <p>We’re here to help. Reach out anytime.</p>
      </header>

      <section className="contact-info">
        <h2>Contact Information</h2>
        <p><strong>Phone:</strong> +1 234 567 8901</p>
        <p><strong>Email:</strong> support@quickassist.com</p>
        <p><strong>Address:</strong> 123 Roadside St, Helpville, USA</p>
      </section>

      <section className="contact-form-section">
        <h2>Send Us a Message</h2>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="name">Name*</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? 'input-error' : ''}
            />
            {errors.name && <span className="error-msg">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email*</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'input-error' : ''}
            />
            {errors.email && <span className="error-msg">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="message">Message*</label>
            <textarea
              id="message"
              name="message"
              rows="5"
              value={formData.message}
              onChange={handleChange}
              className={errors.message ? 'input-error' : ''}
            ></textarea>
            {errors.message && <span className="error-msg">{errors.message}</span>}
          </div>

          <button type="submit" className="submit-btn">Send Message</button>
        </form>
      </section>

      <section className="contact-faq">
        <h2>FAQs</h2>
        {faqs.map((faq, idx) => (
          <div key={idx} className="faq-item">
            <h3>{faq.question}</h3>
            <p>{faq.answer}</p>
          </div>
        ))}
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
