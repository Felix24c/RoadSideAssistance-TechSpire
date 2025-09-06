import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import SelectService from './pages/SelectService';
import ServiceRequest from "./pages/ServiceRequest";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import MyRequests from "./pages/MyRequests";
import ProviderDashboard from "./pages/ProviderDashboard"; // <-- Add this import
import './styles/global.css';

// ✅ Protected route wrapper for users (must be logged in)
const PrivateRoute = ({ children }) => {
  const isLoggedIn = !!localStorage.getItem("userId");
  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

// ✅ Protected route wrapper for providers (must be logged in + provider role)
const PrivateProviderRoute = ({ children }) => {
  const isLoggedIn = !!localStorage.getItem("userId");
  const role = localStorage.getItem("role");
  return (isLoggedIn && role === "provider") ? children : <Navigate to="/login" replace />;
};

// Layout wrapper to hide/show Navbar/Footer on certain routes
function Layout({ children }) {
  const location = useLocation();
  const hideNavFooter = ["/login", "/signup"].includes(location.pathname);
  return (
    <>
      {!hideNavFooter && <Navbar />}
      {children}
      {!hideNavFooter && <Footer />}
    </>
  );
}

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Provider Dashboard (ROLE protected!) */}
          <Route
            path="/provider-dashboard"
            element={
              <PrivateProviderRoute>
                <ProviderDashboard />
              </PrivateProviderRoute>
            }
          />

          {/* User/General Protected routes */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />
          <Route
            path="/about"
            element={
              <PrivateRoute>
                <About />
              </PrivateRoute>
            }
          />
          <Route
            path="/contact"
            element={
              <PrivateRoute>
                <Contact />
              </PrivateRoute>
            }
          />
          <Route
            path="/select-service"
            element={
              <PrivateRoute>
                <SelectService />
              </PrivateRoute>
            }
          />
          <Route
            path="/service-request"
            element={
              <PrivateRoute>
                <ServiceRequest />
              </PrivateRoute>
            }
          />
          <Route
            path="/myrequests"
            element={
              <PrivateRoute>
                <MyRequests />
              </PrivateRoute>
            }
          />

          {/* Catch-all: redirect unknown routes to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
