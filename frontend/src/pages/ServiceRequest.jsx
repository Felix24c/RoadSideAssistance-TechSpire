// src/pages/ServiceRequest.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/servicerequest.css";

const ServiceRequest = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { serviceId, serviceName } = location.state || {};

  const [formData, setFormData] = useState({ location: "", notes: "" });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [price, setPrice] = useState(null);

  useEffect(() => {
    const backendURL = process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8000";
    fetch(`${backendURL}/api/services/${serviceId}`)
      .then((res) => res.json())
      .then((data) => setPrice(data.price))
      .catch((err) => console.error("Failed to fetch price:", err));
  }, [serviceId]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData((prev) => ({
            ...prev,
            location: `Lat: ${latitude.toFixed(5)}, Lon: ${longitude.toFixed(5)}`
          }));
          setLoadingLocation(false);
        },
        (err) => {
          console.error(err);
          setError("Could not get your location automatically. Please enter manually.");
          setLoadingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
      setLoadingLocation(false);
    }
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    const backendURL = process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8000";

    fetch(`${backendURL}/api/requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service: serviceId,
        location: formData.location,
        notes: formData.notes
      })
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then(() => {
        setSuccess("Request submitted successfully! Payment will be collected on service delivery.");
        setTimeout(() => navigate("/"), 2500);
      })
      .catch((err) => {
        setError("Failed to submit request. Please try again.");
        console.error(err);
      });
  };

  return (
    <div className="service-request-container">
      <h1>Service Request</h1>
      <p className="note"><b>Service:</b> {serviceName || "Unknown Service"}</p>
      {price && (
        <p className="note price-info">
          Estimated Price: ₹{price} <span className="price-note">(Pay after service delivery)</span>
        </p>
      )}
      {loadingLocation && <p className="note loading">Fetching your location...</p>}
      {error && <p className="note error">{error}</p>}
      {success && <p className="note success">{success}</p>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Location:</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Enter your location"
            required
          />
        </div>
        <div className="form-group">
          <label>Notes (Optional):</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Any specific instructions?"
          ></textarea>
        </div>
        <div className="form-actions">
          <button type="button" className="go-back-btn" onClick={() => navigate(-1)}>Go Back</button>
          <button type="submit" className="submit-btn">Submit Request</button>
        </div>
      </form>
    </div>
  );
};

export default ServiceRequest;
