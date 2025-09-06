import React, { useEffect, useState } from "react";
import "../styles/myrequests.css";
import "../styles/pageBackground.css";
import { FaEdit, FaTimes, FaPhoneAlt, FaMapMarkerAlt } from "react-icons/fa";

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

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // id of request being edited
  const [editNote, setEditNote] = useState("");
  const [editLocation, setEditLocation] = useState({ lat: "", lng: "" });
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState(null);

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
      const token = localStorage.getItem("access");
      if (!token) throw new Error("Not logged in");

      const res = await fetch(`${backendURL}/api/myrequests`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      });
      if (res.status === 401) throw new Error("Session expired. Please log in again.");
      const data = await res.json();
      setRequests(data || []);
    } catch (err) {
      setError(err.message || "Failed to load requests.");
    } finally {
      setLoading(false);
    }
  };

  // EDIT HANDLERS
  const startEdit = (req) => {
    setEditing(req.id);
    setEditNote(req.notes || "");
    setEditLocation({ lat: req.lat, lng: req.lng });
  };
  const cancelEdit = () => setEditing(null);

  const saveEdit = async (id) => {
    setError(null);
    try {
      const token = localStorage.getItem("access");
      if (!token) throw new Error("Not logged in");
      const res = await fetch(`${backendURL}/api/myrequests/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          notes: editNote,
          lat: editLocation.lat,
          lng: editLocation.lng,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Update failed");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1200);
      setEditing(null);
      fetchRequests();
    } catch (err) {
      setError(err.message || "Edit failed");
    }
  };

  // CANCEL HANDLER
  const cancelRequest = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this request?")) return;
    setError(null);
    try {
      const token = localStorage.getItem("access");
      if (!token) throw new Error("Not logged in");
      const res = await fetch(`${backendURL}/api/myrequests/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "Cancelled" }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Cancel failed");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1200);
      fetchRequests();
    } catch (err) {
      setError(err.message || "Cancel failed");
    }
  };

  return (
    <div className="page-background">
      <div className="myrequests-container">
        <div className="myrequests-header">
          <h1>My Service Requests</h1>
        </div>
        {loading ? (
          <div className="status-msg loading">Loading your requests...</div>
        ) : error ? (
          <div className="status-msg error">{error}</div>
        ) : requests.length === 0 ? (
          <div className="status-msg empty">No requests found.</div>
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
                    {editing === req.id ? (
                      <textarea
                        className="edit-notes"
                        value={editNote}
                        onChange={e => setEditNote(e.target.value)}
                        placeholder="Add notes..."
                        maxLength={400}
                      />
                    ) : (
                      <span>{req.notes || <span className="muted">None</span>}</span>
                    )}
                  </div>
                </div>
                {editing === req.id ? (
                  <div className="request-actions">
                    <input
                      type="number"
                      className="edit-coord"
                      value={editLocation.lat}
                      onChange={e => setEditLocation({ ...editLocation, lat: e.target.value })}
                      placeholder="Latitude"
                    />
                    <input
                      type="number"
                      className="edit-coord"
                      value={editLocation.lng}
                      onChange={e => setEditLocation({ ...editLocation, lng: e.target.value })}
                      placeholder="Longitude"
                    />
                    <button className="btn btn-save" onClick={() => saveEdit(req.id)}>
                      Save
                    </button>
                    <button className="btn btn-cancel" onClick={cancelEdit}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="request-actions">
                    {(req.status === "Pending") && (
                      <>
                        <button className="btn btn-edit" onClick={() => startEdit(req)}>
                          <FaEdit /> Edit
                        </button>
                        <button className="btn btn-cancel" onClick={() => cancelRequest(req.id)}>
                          <FaTimes /> Cancel
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {showSuccess && <div className="success-toast">✔️ Updated!</div>}
      </div>
    </div>
  );
};

export default MyRequests;
