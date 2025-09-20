import React, { useState, useEffect, useRef } from "react";
import backendURL from "../config";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/servicerequest.css";
import "../styles/pageBackground.css";

const ServiceRequest = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const locationInputRef = useRef(null);
  const { serviceId, serviceName } = location.state || {};

  const [formData, setFormData] = useState({ location: "", notes: "" });
  const [serviceError, setServiceError] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [price, setPrice] = useState(null);
  const [description, setDescription] = useState(null);
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get logged-in user
  const userId = localStorage.getItem("userId");

  // Autofocus location field
  useEffect(() => {
    if (locationInputRef.current) locationInputRef.current.focus();
  }, []);

  // Redirect if not logged in
  useEffect(() => {
    if (!userId) navigate("/login");
  }, [userId, navigate]);

  // Fetch service details
  useEffect(() => {
    fetch(`${backendURL}/api/services`)
      .then((res) => res.json())
      .then((data) => {
        const service = data.find((s) => s.id === serviceId);
        if (service) {
          setPrice(service.price);
          setDescription(service.description);
        } else setServiceError("Service not found");
      })
      .catch(() => setServiceError("Failed to fetch service details."));
  }, [serviceId]);

  // Fetch providers list and filter eligible
  useEffect(() => {
    fetch(`${backendURL}/api/providers`)
      .then((res) => res.json())
      .then((data) => {
        // Only allow providers matching the selected service type
        const eligible = (data || []).filter(
          (p) =>
            p.type &&
            serviceName &&
            p.type.trim().toLowerCase() === serviceName.trim().toLowerCase()
        );
        setProviders(eligible);
        if (eligible.length > 0) setSelectedProvider(eligible[0].id);
        else setSelectedProvider("");
      })
      .catch(() => setServiceError("Failed to load providers."));
  }, [serviceName]);

  // Get user location
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      setLoadingLocation(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData((prev) => ({
          ...prev,
          location: `${latitude.toFixed(5)},${longitude.toFixed(5)}`
        }));
        setLoadingLocation(false);
      },
      () => {
        setLocationError("Could not get your location automatically. Please enter manually.");
        setLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleProviderChange = (e) => setSelectedProvider(e.target.value);

  function parseLatLng(text) {
    try {
      const [lat, lng] = text.split(",").map((x) => parseFloat(x));
      if (isNaN(lat) || isNaN(lng)) return null;
      return { lat, lng };
    } catch {
      return null;
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setServiceError(null);
    setLocationError(null);
    setSuccess(null);

    if (!userId) return setServiceError("You must be logged in to submit a request.");
    const coords = parseLatLng(formData.location);

    if (!coords) {
      setLocationError("Invalid location format. Use: latitude,longitude");
      return;
    }
    if (!selectedProvider) {
      setServiceError("No provider selected or available.");
      return;
    }
    setIsSubmitting(true);

    fetch(`${backendURL}/api/requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user: userId,
        service: serviceId,
        provider: selectedProvider,
        lat: coords.lat,
        lng: coords.lng,
        notes: formData.notes
      })
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then(() => {
        setSuccess("Request submitted successfully! Payment will be collected on service delivery.");
        setTimeout(() => navigate("/"), 2200);
      })
      .catch((err) => {
        setServiceError("Failed to submit request. Please try again.");
        console.error(err);
      })
      .finally(() => setIsSubmitting(false));
  };

  return (
    <div className="page-background">
      <div className="service-request-container">
        <h1>Service Request</h1>
        <p className="note">
          <b>Service:</b> {serviceName || "Unknown Service"}
        </p>
        {description && <p className="note"><b>Description:</b> {description}</p>}
        {price !== null && (
          <p className="note-price-info">
            Estimated Price: ₹{price} <span className="price-note">(Pay after service delivery)</span>
          </p>
        )}

        {/* Banner feedback */}
        {loadingLocation && <div className="banner banner-info">Fetching your location...</div>}
        {serviceError && <div className="banner banner-error" tabIndex={0}>{serviceError}</div>}
        {locationError && <div className="banner banner-error" tabIndex={0}>{locationError}</div>}
        {success && <div className="banner banner-success" tabIndex={0}>{success}</div>}

        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="form-group">
            <label htmlFor="location">
              <span role="img" aria-label="location">📍</span> Location:
              <span aria-hidden="true" style={{ color: 'var(--color-red)' }}> *</span>
            </label>
            <input
              id="location"
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Ex: 22.57474,88.36393"
              ref={locationInputRef}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="provider">
              <span role="img" aria-label="provider">👤</span> Provider:
            </label>
            {providers.length === 0 ? (
              <span className="provider-none" tabIndex={0}>
                <span role="img" aria-label="unavailable">❌</span> No provider available for this service.
              </span>
            ) : providers.length === 1 ? (
              <span className="provider-auto">
                <span className="provider-pill">{providers[0].name}</span>
                <span className="provider-type-pill">{providers[0].type}</span>
                <span className="provider-prompt">(Auto-selected)</span>
              </span>
            ) : (
              <select
                id="provider"
                value={selectedProvider}
                onChange={handleProviderChange}
                required
              >
                {providers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.type})
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="notes">
              <span role="img" aria-label="notes">💬</span> Notes (Optional):
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any specific instructions?"
              rows={2}
              autoComplete="off"
            />
          </div>
          <div className="form-actions">
            <button
              type="button"
              className="go-back-btn"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
            >
              ← Go Back
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={providers.length === 0 || isSubmitting || !!loadingLocation}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? (
                <span className="spinner" aria-label="submitting"></span>
              ) : (
                "Submit Request"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceRequest;
