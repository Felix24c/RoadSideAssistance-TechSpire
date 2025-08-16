// src/pages/SelectService.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/selectservice.css";

const SelectService = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const backendURL =
      process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8000";

    fetch(`${backendURL}/api/services`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setServices(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching services:", err);
        setError("Failed to load services. Please try again.");
        setLoading(false);
      });
  }, []);

// handleSelect function inside SelectService.jsx
const handleSelect = (service) => {
  navigate("/service-request", { state: { serviceId: service.id, serviceName: service.name } });
};

  return (
    <div className="select-service-container">
      <h1 className="page-title">Select a Service</h1>
      <p className="note">
        Choose the service you need. Payment will be collected in <b>cash</b>{" "}
        after the service is completed and you are satisfied.
      </p>

      {loading && <p>Loading services...</p>}
      {error && <p className="error">{error}</p>}

      <div className="services-grid">
        {services.map((service) => (
          <div className="service-card" key={service.id}>
            <h2>{service.name}</h2>
            <p>{service.description}</p>
            <p className="price">₹{service.price}</p>
            <button
              className="select-btn"
              onClick={() => handleSelect(service)}
            >
              Select
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SelectService;
