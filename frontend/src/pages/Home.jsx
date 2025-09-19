import { useEffect, useState } from "react";
import "../styles/home.css";
import "../styles/myrequests.css"; // use MyRequests style for cards
import "../styles/pageBackground.css";
import "../styles/global.css";
import RequestStatusActions from "./RequestStatusActions";
import { Link, useNavigate } from "react-router-dom";
import { FaPhoneAlt, FaMapMarkerAlt, FaTimes, FaEdit, FaSignInAlt, FaSignOutAlt, FaCarCrash, FaHistory, FaSyncAlt} from "react-icons/fa";

const STATUS_COLORS = {
  Pending: "badge-pending",
  Accepted: "badge-accepted",
  Arrived: "badge-accepted", // same as Accepted for style
  Completed: "badge-completed",
  Cancelled: "badge-cancelled",
};
const heroFeatures = [
  {
    icon: <FaCarCrash />,
    title: "24/7 Roadside",
    desc: "Breakdowns, flats, batteries, or fuel delivery—relief is always a click away."
  },
  {
    icon: <FaHistory />,
    title: "Your Requests",
    desc: "All past and active service calls are tracked in your dashboard."
  },
  {
    icon: <FaSignOutAlt />,
    title: "1-Tap Logout",
    desc: "Securely log out instantly from everywhere."
  }
];

function formatDate(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  return date.toLocaleString(undefined, {
    year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
  });
}

const backendURL = process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8000";

const Home = () => {
  const [backendStatus, setBackendStatus] = useState("Checking...");
  const [activeRequest, setActiveRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editNote, setEditNote] = useState("");
  const [editLocation, setEditLocation] = useState({ lat: "", lng: "" });
  const [successMessage, setSuccessMessage] = useState("");
  const [cancelMessage, setCancelMessage] = useState("");
  const [refreshing, setRefreshing] = useState(false);

const MIN_LOADING_TIME = 3000;
  const navigate = useNavigate();


  const token = localStorage.getItem("access");
  const username = localStorage.getItem("userName") || "";

  useEffect(() => {
    fetch(`${backendURL}/api/health`)
      .then((res) => res.json())
      .then((data) => setBackendStatus(data.status === "OK" ? "✅ Online" : String(data.status)))
      .catch(() => setBackendStatus("❌ Server Backend not reachable"));
  }, []);

  useEffect(() => {
    if (!token) {
      setSessionExpired(true);
      setLoading(false);
      return;
    }
    fetchActiveRequest();
    const timer = setInterval(() => {
      fetchActiveRequest();
    }, 15000); // poll every 15s
    return () => clearInterval(timer);
  }, [token]);

  const fetchActiveRequest = async () => {
    setError(null);
    setSessionExpired(false);
    setRefreshing(true); // indicate refresh

const fetchStartTime = Date.now();
    try {
      setLoading(true);
      const startTime = Date.now();
      const res = await fetch(`${backendURL}/api/myrequests?status=active`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
      });

      if (res.status === 401) {
        setSessionExpired(true);
        setActiveRequest(null);
        setLoading(false);
         setRefreshing(false);
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch active request");

      const data = await res.json();
      setActiveRequest(data?.[0] || null);

      const elapsed = Date.now() - startTime;
    const minDuration = 3000;  // 3 seconds
    const remaining = minDuration - elapsed;

    // Ensure refreshing spinner lasts at least 3 seconds
    if (remaining > 0) {
      await new Promise(resolve => setTimeout(resolve, remaining));
    }

    } catch (err) {
      setError(err.message || "Failed to load request");
      setActiveRequest(null);
    } finally {
      const elapsed = Date.now() - fetchStartTime;
  const remaining = MIN_LOADING_TIME - elapsed;
  setTimeout(() => {
    setLoading(false);
  }, remaining > 0 ? remaining : 0);
      setRefreshing(false); // End refresh
    }
  };

  const startEditing = (req) => {
    setEditingId(req.id);
    setEditNote(req.notes || "");
    setEditLocation({ lat: req.lat, lng: req.lng });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditNote("");
    setEditLocation({ lat: "", lng: "" });
  };

  const saveEdit = async (id) => {
    setError(null);
    try {
      const res = await fetch(`${backendURL}/api/myrequests/${id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ notes: editNote, lat: editLocation.lat, lng: editLocation.lng })
      });
      if (!res.ok) {
        const errRes = await res.json();
        throw new Error(errRes.error || "Update failed");
      }
       setSuccessMessage("Request updated successfully.");
    setTimeout(() => setSuccessMessage(""), 2200); // 2.2 seconds
      setEditingId(null);
      fetchActiveRequest();
    } catch (err) {
      setError(err.message || "Update failed");
    }
  };

  const cancelRequest = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this request?")) return;
    setError(null);
    try {
      const res = await fetch(`${backendURL}/api/myrequests/${id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Cancelled" })
      });
      if (!res.ok) {
        const errRes = await res.json();
        throw new Error(errRes.error || "Cancel failed");
      }
      setCancelMessage("Request cancelled successfully.");
    setTimeout(() => setCancelMessage(""), 2200); // 2.2 seconds
      fetchActiveRequest();
    } catch (err) {
      setError(err.message || "Cancel failed");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (sessionExpired) {
    return (
      <div className="page-background">
        <div className="myrequests-container">
          <div className="banner banner-error">Session expired. Please login again.</div>
          <button className="btn-save" onClick={handleLogout} style={{ marginLeft: "10px", marginTop: "10px" }}>
                <FaSignInAlt />  Go to Login
              </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-background">
      <div className="myrequests-container">
        <div className="myrequests-header">
          <h1>{username ? `Welcome, ${username}!` : "Welcome to QuickAssist"}</h1>
          <p>Stuck on the road? We’re here to help 24/7.</p>
          <div className="backend-status">
  Backend: {backendStatus}
  {refreshing && (
    <span className="loader-inline" style={{ marginLeft: "8px", verticalAlign: "middle" }}>
      <span className="spinner" style={{
        display: "inline-block", width: "18px", height: "18px", border: "2.5px solid #ddd",
        borderTop: "2.5px solid var(--color-blue)", borderRadius: "50%", animation: "spin 0.77s linear infinite"
      }} />
      <span style={{ marginLeft: "5px", fontSize: "0.97em", color: "var(--color-blue)" }}>Refreshing…</span>
    </span>
  )}
</div>

          {loading ? (
            <div className="status-msg loading">
  <span className="spinner" style={{marginRight: 8}}></span>
  Loading your active request...
</div>
          ) : error ? (
            <div className="status-msg error">{error}</div>
          ) : activeRequest ? (
            <div className="request-card">
              <div className="request-top">
                <span className={`badge ${STATUS_COLORS[activeRequest.status]}`}>{activeRequest.status}</span>
                <span className="request-service">{activeRequest.service?.name || "Service"}</span>
                <span className="request-date">{formatDate(activeRequest.created)}</span>
              </div>

              <div className="request-details">
                <div>
                  <span className="label">Provider: </span>{activeRequest.provider?.name || <em>Awaiting Assignment</em>}
                  {activeRequest.provider?.phone && (
                    <a className="phone-link" href={`tel:${activeRequest.provider.phone}`} title={`Call ${activeRequest.provider.phone}`}>
                      <FaPhoneAlt /> Place a Call
                    </a>
                  )}
                </div>
                <div>
                  <span className="label">Your Location: </span>
                  <a className="map-link"
                     href={`https://maps.google.com/?q=${activeRequest.lat},${activeRequest.lng}`}
                     target="_blank" rel="noopener noreferrer"
                     title="View on map">
                    <FaMapMarkerAlt />
                    {`${activeRequest.lat.toFixed(4)}, ${activeRequest.lng.toFixed(4)}`}
                  </a>
                </div>
                <div>
                  <span className="label">Estimated Cost: </span>
                  <span className="cost">₹{activeRequest.estimated_cost}</span>
                </div>
                <div>
                  <span className="label">Notes: </span>
                  {editingId === activeRequest.id ? (
                    <textarea className="edit-notes"
                              value={editNote}
                              onChange={e => setEditNote(e.target.value)}
                              placeholder="Add notes..."
                              maxLength={400} />
                  ) : (
                    activeRequest.notes || <em>None</em>
                  )}
                </div>
              </div>

              <div className="request-actions">
                {editingId === activeRequest.id ? (
                  <>
                    <input type="number" className="edit-coord" placeholder="Latitude"
                           value={editLocation.lat}
                           onChange={e => setEditLocation({ ...editLocation, lat: e.target.value })} />
                    <input type="number" className="edit-coord" placeholder="Longitude"
                           value={editLocation.lng}
                           onChange={e => setEditLocation({ ...editLocation, lng: e.target.value })} />
                    <button className="btn btn-save" onClick={() => saveEdit(activeRequest.id)}>Save Details</button>
                    <button className="btn btn-cancel" onClick={cancelEditing}>Dont Save</button>
                  </>
                ) : (
                  <>
                    {(activeRequest.status === "Pending" || activeRequest.status === "Accepted" || activeRequest.status === "Arrived") && (
                      <>
                        <button className="btn btn-edit" onClick={() => startEditing(activeRequest)}><FaEdit /> Edit Details</button>
                        <button className="btn btn-cancel" onClick={() => cancelRequest(activeRequest.id)}><FaTimes /> Cancel Request</button>
                      </>
                    )}
                  </>
                )}
              </div>
              <RequestStatusActions
  request={activeRequest}
  userRole={localStorage.getItem("role") || "user"}
  onStatusChange={fetchActiveRequest}
/>
<button 
  className="refresh-btn" 
  style={{background: 'var(--color-blue)', height: '38px', alignSelf: 'flex-start'}}
  onClick={fetchActiveRequest}>
  <FaSyncAlt style={{marginRight: 6}}/> Refresh Status
</button>

            </div>
          ) : (
            <button className="cta-btn" onClick={() => navigate("/select-service")}>Get Help Now</button>
          )}
          
          <div className="shortcut-links" style={{ marginTop: "20px" }}>
            <Link to="/myrequests" className="shortcut-btn"><FaPhoneAlt /> My Requests</Link>
            <Link to="/about" className="shortcut-btn">About Us</Link>
            <button className="shortcut-btn logout" onClick={handleLogout}><FaSignOutAlt /> Logout</button>
          </div>

          {successMessage && (
  <div className="card-status-msg success">
    {successMessage}
  </div>
)}
{cancelMessage && (
  <div className="card-status-msg cancelled">
    {cancelMessage}
  </div>
)}
        </div>
      </div>

      <div className="myrequests-container" style={{ marginTop: "30px" }}>
        <h2>Features</h2>
        <div className="home-features" style={{ margin: "18px 0 7px 0", display: "flex", justifyContent: "center", gap: "26px" }}>
  {heroFeatures.map(f => (
    <div key={f.title} className="feature-card compact" style={{ background: "rgba(41, 45, 66, 0.83)", borderRadius: "11px", padding: "20px", minWidth: "175px", boxShadow: "0 2px 9px #3733460c" }}>
      <div className="feature-icon" style={{ fontSize: "2.1rem", color: "var(--color-blue)" }}>{f.icon}</div>
      <div className="feature-title" style={{ color: "var(--color-blue)", fontWeight: "700", fontSize: "1.08rem", margin: "5px 0" }}>{f.title}</div>
      <div className="feature-desc" style={{ color: "var(--color-light-grey)", fontSize: "0.97rem", opacity: "0.96" }}>{f.desc}</div>
    </div>
  ))}
</div>
        <div className="myrequests-header">
          <h4>Roadside Assistance is just a click away!</h4>
          { /* Your features UI or content here as per your preference */ }
        </div>
      </div>
    </div>
  );
};

export default Home;