import React, { useEffect, useState } from 'react';
import '../styles/home.css';
import '../styles/pageBackground.css';
import { Link } from 'react-router-dom';

const Home = () => {
  const [backendStatus, setBackendStatus] = useState('Checking...');

  useEffect(() => {
    // Use environment variable for backend URL (default to local if not set)
    const backendURL = process.env.REACT_APP_BACKEND_URL || 'http://127.0.0.1:8000';

    // Fetch backend health status
    fetch(`${backendURL}/api/health`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status) {
          setBackendStatus(data.status);
        } else {
          setBackendStatus('Unexpected response');
        }
      })
      .catch(() => {
        setBackendStatus('Backend not reachable');
      });
  }, []);

  return (
    <div className="page-background">
      <section className="hero">
        <div className="hero-overlay">
          <div className="hero-content">
            <h1>24/7 Roadside Assistance</h1>
            <p>
              Stuck on the road? We’re just a click away.
              Quick help for breakdowns, flat tires, or emergencies.
            </p>
            <p className="backend-status">
              Backend Status: {backendStatus}
            </p>
            <Link to="/select-service" className="cta-btn">
              Get Help Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
