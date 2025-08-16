import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Services from './pages/Services';
import About from './pages/About';
import Contact from './pages/Contact';
import SelectService from './pages/SelectService';
import ServiceRequest from "./pages/ServiceRequest";
import './styles/global.css';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/select-service" element={<SelectService />} /> {/* ✅ New route */}
        <Route path="/service-request" element={<ServiceRequest />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
