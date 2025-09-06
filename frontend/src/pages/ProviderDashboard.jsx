import React, { useEffect, useState } from "react";
import "../styles/pageBackground.css";
import "../styles/global.css";
import "../styles/providerdashboard.css";
import { FaSyncAlt, FaCheckCircle, FaTimesCircle, FaMapMarkerAlt, FaPhoneAlt } from "react-icons/fa";

const statusStyles = {
  Pending: { color: "#FFD700", bg: "rgba(255,215,0,0.16)" },
  Accepted: { color: "#2E86AB", bg: "rgba(46,134,171,0.14)" },
  Arrived: { color: "#9A37C9", bg: "rgba(154,55,201,0.14)" },
  Completed: { color: "#19B87D", bg: "rgba(25,184,125,0.15)" },
  Cancelled: { color: "#B90429", bg: "rgba(217,4,41,0.13)" }
};
const backendURL = process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8000";

const ProviderDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Modal close on escape
  useEffect(() => {
    const esc = (e) => (e.key === "Escape" ? setSelectedJob(null) : null);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("access");
      if (!token) throw new Error("Not logged in");
      const res = await fetch(`${backendURL}/api/requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      const username = localStorage.getItem("username");
      let filtered = (data || []).filter(
        (j) => j.provider && j.provider.toLowerCase() === username?.toLowerCase()
      );
      setJobs(filtered.sort((a, b) => b.id - a.id));
    } catch (e) {
      setError(e.message || "Failed to load jobs");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    const timer = setInterval(fetchJobs, 30000);
    return () => clearInterval(timer);
    // eslint-disable-next-line
  }, []);

  const statusBadge = (status) => {
    const { color, bg } = statusStyles[status] || statusStyles["Pending"];
    return (
      <span
        style={{
          display: "inline-block",
          color,
          background: bg,
          borderRadius: 12,
          fontSize: "0.96em",
          padding: "3.5px 14px",
          fontWeight: 700,
          marginRight: 4,
          minWidth: 80,
          textAlign: "center"
        }}
      >
        {status}
        {status === "Completed" && <FaCheckCircle style={{ marginLeft: 6, color }} />}
        {status === "Cancelled" && <FaTimesCircle style={{ marginLeft: 6, color }} />}
      </span>
    );
  };

  // Accept or Cancel Actions
  const handleJobStatusChange = async (jobId, newStatus) => {
    try {
      const token = localStorage.getItem("access");
      if (!token) throw new Error("Not logged in");
      const res = await fetch(`${backendURL}/api/requests/${jobId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error("Failed to update job status");
      fetchJobs();
      setSelectedJob(null);
    } catch (e) {
      alert(e.message || "Action failed");
    }
  };

  // Stats
  const pending = jobs.filter((j) => j.status === "Pending").length;
  const accepted = jobs.filter((j) => j.status === "Accepted").length;
  const arrived = jobs.filter((j) => j.status === "Arrived").length;
  const completed = jobs.filter((j) => j.status === "Completed").length;

  return (
    <div className="page-background" style={{ minHeight: "100vh" }}>
      <div className="provider-dashboard-container">
        <div className="provider-bar">
          <div>
            <span>Welcome, </span>
            <span className="provider-label">{localStorage.getItem("username")}</span>
          </div>
          <button
            onClick={() => {
              setRefreshing(true);
              fetchJobs();
            }}
            style={{
              background: "#3F37C9", color: "#fff", border: "none", borderRadius: 6,
              fontSize: "1.03rem", fontWeight: "700", padding: "10px 26px", cursor: "pointer",
              boxShadow: "0 1.5px 8px #2d203212", display: "flex", alignItems: "center"
            }}
            title="Refresh"
            disabled={refreshing}
          >
            <FaSyncAlt style={{ marginRight: 7, opacity: refreshing ? 0.74 : 1, animation: refreshing ? "spin 1s linear infinite" : "" }} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
        {/* Stat cards */}
        <div className="provider-stats-row">
          <StatCard title="Pending" value={pending} color="#FFD700" />
          <StatCard title="Accepted" value={accepted} color="#2E86AB" />
          <StatCard title="Arrived" value={arrived} color="#9A37C9" />
          <StatCard title="Completed" value={completed} color="#19B87D" />
        </div>
        <div style={{
          background: "rgba(31,37,54, 0.96)", borderRadius: 10, padding: "18px 8px 12px 8px",
          boxShadow: "0 2px 12px #20263a25", marginBottom: 10
        }}>
          <h2 style={{
            color: "#F5F5F5", fontWeight: "700", marginLeft: 12,
            fontSize: "1.15rem", marginBottom: 13, letterSpacing: ".5px"
          }}>
            My Assigned Service Jobs
          </h2>
          {loading ? (
            <div style={{ color: "#3F37C9", marginLeft: 16, fontWeight: 700, opacity: 0.86 }}>Loading jobs...</div>
          ) : error ? (
            <div style={{ color: "#B90429", marginLeft: 15, fontWeight: 600 }}>{error}</div>
          ) : jobs.length === 0 ? (
            <div style={{ color: "#aaa", marginLeft: 15 }}>No jobs assigned to you yet.</div>
          ) : (
            <div className="provider-jobs-list">
              {jobs.map(job => (
                <div
                  className="job-card"
                  key={job.id}
                  tabIndex={0}
                  onClick={() => setSelectedJob(job)}
                  onKeyDown={e => (e.key === "Enter" || e.key === " ") && setSelectedJob(job)}
                  aria-label={`View job for ${job.service?.name || "Service"}`}
                  style={{
                    border: "2px solid " + (statusStyles[job.status]?.color || "#333"),
                  }}
                >
                  <div>{statusBadge(job.status)}</div>
                  <div className="job-title">{job.service?.name || "—"}</div>
                  <div className="job-request-user">Requested by: <b>{job.user}</b></div>
                  <div className="job-cost">₹ {job.estimated_cost || job.service?.price || "–"}</div>
                  <div className="job-location">
                    <FaMapMarkerAlt style={{ color: "#3F37C9", opacity: .96 }} />
                    <a href={`https://maps.google.com/?q=${Number(job.lat)},${Number(job.lng)}`} target="_blank" rel="noopener noreferrer">
                      {Number(job.lat).toFixed(3)}, {Number(job.lng).toFixed(3)}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Job Modal */}
      {selectedJob && (
        <div className="modal-overlay" onClick={() => setSelectedJob(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" aria-label="Close details" onClick={() => setSelectedJob(null)}>&times;</button>
            <h3 style={{ color: "#3F37C9", fontWeight: 800, fontSize: "1.25em" }}>
              {selectedJob.service?.name || "Service"}
            </h3>
            <div style={{ margin: "7px 0 18px 2px", color: "#ccc" }}>{selectedJob.service?.description}</div>
            <div style={{ marginBottom: 11 }}>
              <span style={{ fontWeight: 600, color: "#F5F5F5" }}>User:</span> {selectedJob.user}
            </div>
            <div>
              <FaMapMarkerAlt style={{ marginRight: 5 }} />
              <span><b>Location: </b>{Number(selectedJob.lat).toFixed(4)}, {Number(selectedJob.lng).toFixed(4)}</span>
            </div>
            <div style={{ marginTop: 8 }}>
              <b>Notes:</b> {selectedJob.notes ? <span style={{ color: "#F5F5F5" }}>{selectedJob.notes}</span> : "—"}
            </div>
            <div style={{ marginTop: 8, marginBottom: 7, fontSize: "1.06em" }}>
              <span style={{ color: statusStyles[selectedJob.status]?.color || "#FFD700" }}>
                Status: {selectedJob.status}
              </span>
            </div>
            <div>
              <FaPhoneAlt style={{ marginRight: 6, color: "#19B87D" }} />
              <span>Contact: <b>{selectedJob.user}</b></span>
            </div>
            <div className="provider-actions">
              {selectedJob.status === "Pending" && (
                <button
                  className="accept-btn"
                  style={{ background: "#2E86AB", color: "#fff", marginRight: 8, borderRadius: 6, fontWeight: 600, fontSize: "1rem", padding: "8px 22px" }}
                  onClick={() => handleJobStatusChange(selectedJob.id, "Accepted")}
                >
                  Accept
                </button>
              )}
              {(selectedJob.status === "Pending" || selectedJob.status === "Accepted") && (
                <button
                  className="cancel-btn"
                  onClick={() => handleJobStatusChange(selectedJob.id, "Cancelled")}
                >
                  Cancel
                </button>
              )}
              {selectedJob.status === "Accepted" && (
                <div style={{ color: "#FFD700", marginTop: 12, fontWeight: 600 }}>
                  Waiting for user to confirm provider arrival…
                </div>
              )}
              {selectedJob.status === "Arrived" && (
                <div style={{ color: "#9A37C9", marginTop: 12, fontWeight: 600 }}>
                  Provider arrival confirmed by user. Waiting for job completion confirmation…
                </div>
              )}
              {selectedJob.status === "Completed" && (
                <div style={{ color: "#19B87D", marginTop: 12, fontWeight: 600 }}>
                  Service marked completed by user.
                </div>
              )}
              {selectedJob.status === "Cancelled" && (
                <div style={{ color: "#B90429", marginTop: 12, fontWeight: 600 }}>
                  This request was cancelled.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Spinner keyframes */}
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg) } }
      `}</style>
    </div>
  );
};

function StatCard({ title, value, color }) {
  return (
    <div className="stat-card" style={{ borderLeft: `5px solid ${color}` }}>
      <span style={{ fontSize: ".98em", fontWeight: 400, color: "#aaa", marginRight: 12 }}>{title}</span>
      <span style={{ fontSize: "1.19em", color }}>{value}</span>
    </div>
  );
}

export default ProviderDashboard;
