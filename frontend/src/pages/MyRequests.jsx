import React, { useEffect, useState } from "react";
import backendURL from "../config";
import "../styles/home.css";
import "../styles/myrequests.css";
import "../styles/pageBackground.css";
import { FaPhoneAlt, FaMapMarkerAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

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


const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  const navigate = useNavigate();

  // Polling - auto refresh every 15s
  useEffect(() => {
    let timer;
    fetchRequests();
    timer = setInterval(fetchRequests, 15000);
    return () => clearInterval(timer);
    // eslint-disable-next-line
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      setSessionExpired(false);
      const token = localStorage.getItem("access");
      if (!token) throw new Error("Not logged in");

      const res = await fetch(`${backendURL}/api/myrequests`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      });
      if (res.status === 401) {
        setSessionExpired(true);
        throw new Error("Session expired. Please log in again.");
      }
      const data = await res.json();

      // Filter only Completed and Cancelled requests
      const filtered = (data || []).filter(req => req.status === "Completed" || req.status === "Cancelled");
      setRequests(filtered);
    } catch (err) {
      setError(err.message || "Failed to load requests.");
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
          <h1>My Past Requests</h1>
        </div>

        {loading ? (
          <div className="status-msg loading">Loading your requests...</div>
        ) : sessionExpired ? (
          <div className="banner banner-error">
            Session expired. Please log in again.
            <br />
            <button className="btn-save" onClick={handleLogout}>
            Go to Login
          </button>
          </div>
        ) : error ? (
          <div className="status-msg error">{error}</div>
        ) : requests.length === 0 ? (
          <div className="status-msg empty">No past requests found.</div>
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
                    <span className="label">Provider: </span>
                    {req.provider
                      ? <>
                          {typeof req.provider === "object" && req.provider.name ? req.provider.name : req.provider}
                          {req.provider.phone && (
                            <span className="provider-phone-details">
                              <a href={`tel:${req.provider.phone}`} className="phone-link" title={`Call ${req.provider.phone}`}>
                                <FaPhoneAlt style={{fontSize:"1em", marginRight: "4px", verticalAlign: "middle"}} />
                              </a>
                              <span style={{fontFamily: "monospace", fontSize: "1em"}}>{req.provider.phone}</span>
                            </span>
                          )}
                        </>
                      : <span className="unassigned">Awaiting assignment</span>}
                  </div>
                  <div>
                    <span className="label">Your Location: </span>
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
                    <span className="label">Estimated Cost: </span>
                    <span className="cost">₹{req.estimated_cost}</span>
                  </div>
                  <div>
                    <span className="label">Notes: </span>
                    <span>{req.notes || <span className="muted">None</span>}</span>
                  </div>
                </div>
                {/* No edit or cancel buttons */}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRequests;
