import React, { useEffect, useState } from "react";
import "../styles/home.css";
import "../styles/myrequests.css";
import "../styles/providerpastjobs.css";
import "../styles/pageBackground.css";
import { FaMapMarkerAlt } from "react-icons/fa";

const STATUS_COLORS = {
  Pending: "badge-pending",
  Accepted: "badge-accepted",
  Completed: "badge-completed",
  Cancelled: "badge-cancelled",
};

function formatDate(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  return date.toLocaleString(undefined, {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

const backendURL = process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8000";

const ProviderPastJobs = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let timer;
    fetchRequests();
    timer = setInterval(fetchRequests, 15000);
    return () => clearInterval(timer);
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("access");
      if (!token) throw new Error("Not logged in");

      const res = await fetch(`${backendURL}/api/requests`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      });
      if (res.status === 401) throw new Error("Session expired. Please log in again.");
      const data = await res.json();

      const providerEmail = (localStorage.getItem("providerEmail") || "").toLowerCase();

      // Filter requests assigned to this provider and with status Completed or Cancelled
      const filtered = data.filter(
        (req) =>
          req.provider?.email?.toLowerCase() === providerEmail &&
          ["Completed", "Cancelled"].includes(req.status)
      );

      // Sort by created date descending (latest first)
      filtered.sort((a, b) => new Date(b.created) - new Date(a.created));

      setRequests(filtered);
    } catch (err) {
      setError(err.message || "Failed to load past jobs.");
    } finally {
      setLoading(false);
    }
  };
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="page-background">
      <div className="myrequests-container">
        <div className="myrequests-header">
          <h1>My Past Jobs</h1>
        </div>
        {loading ? (
          <div className="status-msg loading">Loading your past jobs...</div>
        ) : error ? (
          <div className="banner banner-error">{error}
            <button className="btn-save" onClick={handleLogout}>
              Go to Login
            </button>
          </div>
        ) : requests.length === 0 ? (
          <div className="status-msg empty">No past jobs found.</div>
        ) : (
          <div className="requests-grid">
            {requests.map((req) => (
              <div className="request-card" key={req.id}>
                <div className="request-top">
                  <span className={`badge ${STATUS_COLORS[req.status]}`}>{req.status}</span>
                  <span className="request-service">{req.service?.name || "Service"}</span>
                  <span className="request-date">{formatDate(req.created)}</span>
                </div>
                <div className="request-details">
                  <div>
                    <span className="label">User:  </span>
                    {req.user || "Unknown"}
                  </div>
                  <div>
                    <span className="label">User 's Location: </span>
                    <a
                      className="map-link"
                      href={`https://maps.google.com/?q=${req.lat},${req.lng}`}
                      target="_blank" rel="noopener noreferrer"
                      title="View on map"
                    >
                      <FaMapMarkerAlt /> {req.lat?.toFixed(4)}, {req.lng?.toFixed(4)}
                    </a>
                  </div>
                  <div>
                    <span className="label">Cost: </span>
                    <span className="cost">₹{req.estimated_cost}</span>
                  </div>
                  <div>
                    <span className="label">Notes: </span>
                    <span>{req.notes || <span className="muted">None</span>}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderPastJobs;
