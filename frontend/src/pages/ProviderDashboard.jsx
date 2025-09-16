import React, { useEffect, useState } from "react";
import "../styles/pageBackground.css";
import "../styles/global.css";
import "../styles/providerdashboard.css";
import { FaSyncAlt, FaCheckCircle, FaTimesCircle, FaMapMarkerAlt, FaPhoneAlt } from "react-icons/fa";

const statusStyles = {
  Pending:   { color: "#FFD700", bg: "rgba(255,215,0,0.16)" },
  Accepted:  { color: "#2E86AB", bg: "rgba(46,134,171,0.14)" },
  Arrived:   { color: "#9C37C9", bg: "rgba(154,55,201,0.14)" },
  Completed: { color: "#19B87D", bg: "rgba(25,184,125,0.15)" },
  Cancelled: { color: "#B90429", bg: "rgba(217,4,41,0.13)" }
};

const backendURL = process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8000";

const ProviderDashboard = () => {
  const [assignedJobs, setAssignedJobs] = useState([]);
  const [availableJobs, setAvailableJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [acceptingJobId, setAcceptingJobId] = useState(null);

  const username = (localStorage.getItem("username") || "").toLowerCase();

  // Fetch & filter logic
  const fetchJobs = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("access");
      if (!token) {
        setError("Not logged in.");
        setLoading(false);
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };
      let res = await fetch(`${backendURL}/api/requests`, { headers });
      if (res.status === 401) {
        setError("Session expired. Please log in again.");
        setLoading(false);
        return;
      }
      const data = await res.json();

      let providerType = localStorage.getItem("providerType");
      const pRes = await fetch(`${backendURL}/api/providers`, { headers });
      if (pRes.status === 401) {
        setError("Session expired. Please log in again.");
        setLoading(false);
        return;
      }
      const pData = await pRes.json();
      let providersList = [];
      if (Array.isArray(pData)) {
        providersList = pData;
      } else if (pData?.results && Array.isArray(pData.results)) {
        providersList = pData.results;
      } else {
        setError("Cannot retrieve provider data.");
        setLoading(false);
        return;
      }
      const email = localStorage.getItem("email") || "";
      const providerInfo = providersList.find(
        (p) => p.email && p.email.toLowerCase() === email.toLowerCase()
      );
      if (providerInfo) {
        providerType = providerInfo.type.toLowerCase();
        localStorage.setItem("providerType", providerType);
        localStorage.setItem("providerName", providerInfo.name);
        localStorage.setItem("providerEmail", providerInfo.email);
      } else {
        providerType = "";
      }
      if (!providerInfo) {
        alert(`Provider profile not found for email: ${email}`);
      }

      // Filter assigned jobs
      const providerEmail = (localStorage.getItem("email") || "").toLowerCase();
      const assigned = data.filter(job =>
        job.provider &&
        job.provider.email &&
        job.provider.email.toLowerCase() === providerEmail &&
        ["Pending", "Accepted", "Arrived", "Completed", "Cancelled"].includes(job.status)
      );

      // Filter available jobs matching provider's type and unassigned
      const available = data.filter(
        job =>
          !job.provider &&
          job.status === "Pending" &&
          job.service &&
          job.service.name &&
          providerType &&
          job.service.name.toLowerCase() === providerType
      );
      setAssignedJobs(assigned.sort((a, b) => b.id - a.id));
      setAvailableJobs(available);
    } catch (e) {
      setError(e.message || "Failed to fetch jobs.");
    } finally {
      setLoading(false);
      setRefreshing(false);
      setAcceptingJobId(null);
    }
  };

  useEffect(() => {
    const fetchProviderInfo = async () => {
      const email = localStorage.getItem("email") || "";
      const res = await fetch(`${backendURL}/api/providers`);
      const providers = await res.json();
      const providerInfo = providers.find(
        p => p.email && p.email.toLowerCase() === email.toLowerCase()
      );
      if (providerInfo) {
        localStorage.setItem("providerName", providerInfo.name);
        localStorage.setItem("providerEmail", providerInfo.email);
      }
    };
    fetchProviderInfo();
    fetchJobs();
    const timer = setInterval(fetchJobs, 30000);
    return () => clearInterval(timer);
  }, []);

  // --- Split jobs ---
  const activeAssignedJobs = assignedJobs.filter(
    job => ["Accepted", "Arrived"].includes(job.status)
  );
  const pastAssignedJobs = assignedJobs.filter(
    job => ["Completed", "Cancelled"].includes(job.status)
  );

  const hasActiveJob = activeAssignedJobs.length > 0;

  // Status badge UI
  const statusBadge = (status) => {
    const { color, bg } = statusStyles[status] || statusStyles.Pending;
    return (
      <span
        style={{
          display: "inline-block",
          color,
          background: bg,
          borderRadius: 12,
          fontWeight: 700,
          fontSize: "0.95em",
          padding: "4px 14px",
          marginRight: 6,
          minWidth: 80,
          textAlign: "center",
        }}
      >
        {status}
        {status === "Completed" && (
          <FaCheckCircle style={{ marginLeft: 6, color }} />
        )}
        {status === "Cancelled" && (
          <FaTimesCircle style={{ marginLeft: 6, color }} />
        )}
      </span>
    );
  };

  // Provider actions: bulletproof
  const renderProviderActions = (job) => {
    if (["Cancelled", "Completed"].includes(job.status)) return null;
    // Mark as Arrived (only for accepted awaiting provider)
    if (job.status === "Accepted" && !job.arrived_by_provider) {
      return (
        <button onClick={() => sendProviderAction(job.id, "confirm-arrived")} className="provider-btn provider-btn-arrived">
          <FaMapMarkerAlt style={{marginRight:3}}/> Mark as Arrived
        </button>
      );
    }
    if (job.status === "Accepted" && job.arrived_by_provider && !job.arrived_by_user) {
      return <span className="provider-waiting" style={{color:"#FFD700"}}>Waiting for user to confirm arrival...</span>;
    }
    if (job.status === "Arrived" && !job.completed_by_provider) {
      return (
        <button onClick={() => sendProviderAction(job.id, "confirm-completed")} className="provider-btn provider-btn-complete">
          <FaCheckCircle style={{marginRight:3}}/> Mark as Completed
        </button>
      );
    }
    if (job.status === "Arrived" && job.completed_by_provider && !job.completed_by_user) {
      return <span className="provider-waiting" style={{color:"#19B87D"}}>Waiting for user to confirm completion...</span>;
    }
    if (job.status === "Completed") {
      return <span className="provider-complete" style={{color:"#19B87D"}}>Request fully completed!</span>;
    }
    return null;
  };

  // PATCH logic for arrived/complete confirmation (calls the two endpoints)
  const sendProviderAction = async (jobId, actionEndpoint) => {
    setAcceptingJobId(jobId);
    try {
      const token = localStorage.getItem("access");
      const endpoint = actionEndpoint === "confirm-arrived"
        ? `/api/requests/${jobId}/confirm-arrived`
        : `/api/requests/${jobId}/confirm-completed`;
      const res = await fetch(`${backendURL}${endpoint}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role: "provider" })
      });
      if (!res.ok) {
        throw new Error("Backend error: " + (await res.text()));
      }
      await fetchJobs();
    } catch (e) {
      alert("Could not update job: " + (e.message || e));
    } finally {
      setAcceptingJobId(null);
    }
  };

  // Accept logic (only if provider is not busy)
  const handleJobAction = async (jobId, newStatus) => {
    setAcceptingJobId(jobId);
    try {
      const token = localStorage.getItem("access");
      if (!token) {
        alert("Please login again.");
        setAcceptingJobId(null);
        return;
      }
      const providerId = localStorage.getItem("providerId");
      const providerEmail = localStorage.getItem("providerEmail");

      let payload = { status: newStatus };
      if (newStatus === "Accepted") {
        payload.provider = providerId || providerEmail;
      }

      const res = await fetch(`${backendURL}/api/requests/${jobId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        alert("Session expired. Please login again.");
        setAcceptingJobId(null);
        setError("Session expired. Please login again.");
        return;
      }
      if (!res.ok) {
        let errMsg = "Failed to update job.";
        try {
          const err = await res.json();
          errMsg = err.error || errMsg;
        } catch {
          errMsg = "Server error. Please check backend logs.";
        }
        throw new Error(errMsg);
      }
      await fetchJobs();
      setSelectedJob(null);
    } catch (e) {
      alert(e.message || "Error occurred.");
      setAcceptingJobId(null);
    }
  };

  return (
    <div className="page-background" style={{ minHeight: "100vh" }}>
      <div className="provider-dashboard-container">
        <div className="provider-bar">
          {error && (
            <div className="error-message" style={{ color: "red", margin: "10px 0" }}>
              {error}
            </div>
          )}
          <div>
            Welcome, <span className="provider-label">{localStorage.getItem("username")}</span>
            <button className="shortcut-btn logout"
              onClick={() => {
                localStorage.clear();
                window.location.href = "/login";
              }}
            >Logout</button>
          </div>
          <button
            onClick={() => {
              setRefreshing(true);
              fetchJobs();
            }}
            title="Refresh"
            disabled={refreshing}
            style={{
              background: "#3F37C9",
              color: "white",
              padding: "10px 26px",
              fontWeight: 700,
              borderRadius: 6,
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              boxShadow: "0 2px 7px rgba(63,55,201,0.5)",
            }}
          >
            <FaSyncAlt
              style={{
                marginRight: 8,
                animation: refreshing ? "spin 1s linear infinite" : "none",
              }}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div className="provider-stats-row">
          <StatCard title="Assigned" value={activeAssignedJobs.length} color="#2E86AB" />
          <StatCard title="Available" value={availableJobs.length} color="#FFD700" />
        </div>

        <section>
          <h3>My Assigned Jobs</h3>
          {loading && <p>Loading assigned jobs...</p>}
          {!loading && activeAssignedJobs.length === 0 && <p>No active assigned jobs found.</p>}
          <div className="jobs-list">
            {activeAssignedJobs.map((job) => (
              <div
                key={job.id}
                className="job-card"
                tabIndex={0}
                onClick={() => setSelectedJob(job)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setSelectedJob(job);
                }}
                aria-label={`Job details for ${job.service?.name || "Service"}`}
                style={{
                  border: `2px solid ${statusStyles[job.status]?.color || "#333"}`,
                }}
              >
                <div className="job-card-header">
                  {statusBadge(job.status)}
                  <span>{job.service?.name || "—"}</span>
                </div>
                <div>Requested by: <b>{job.user}</b></div>
                <div>Cost: ₹{job.estimated_cost || job.service?.price || "—"}</div>
                <div className="job-location">
                  <FaMapMarkerAlt style={{ color: "#3F7AFD", opacity: 0.9 }} />
                  <a
                    href={`https://maps.google.com/?q=${job.lat},${job.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {Number(job.lat).toFixed(3)}, {Number(job.lng).toFixed(3)}
                  </a>
                </div>
                <div className="job-actions" style={{marginTop:8}}>
                  {renderProviderActions(job)}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* JOB HISTORY SECTION */}
        <section style={{ marginTop: 30 }}>
          <h3>Job History</h3>
          {!loading && pastAssignedJobs.length === 0 && <p>No completed or cancelled jobs yet.</p>}
          <div className="jobs-list">
            {pastAssignedJobs.map((job) => (
              <div
                key={job.id}
                className="job-card"
                tabIndex={0}
                style={{
                  border: `2px solid ${statusStyles[job.status]?.color || "#333"}`,
                  opacity: 0.75
                }}
                aria-label={`Past job details for ${job.service?.name || "Service"}`}
              >
                <div className="job-card-header">
                  {statusBadge(job.status)}
                  <span>{job.service?.name || "—"}</span>
                </div>
                <div>Requested by: <b>{job.user}</b></div>
                <div>Cost: ₹{job.estimated_cost || job.service?.price || "—"}</div>
                <div className="job-location">
                  <FaMapMarkerAlt style={{ color: "#3F7AFD", opacity: 0.9 }} />
                  <a
                    href={`https://maps.google.com/?q=${job.lat},${job.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {Number(job.lat).toFixed(3)}, {Number(job.lng).toFixed(3)}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginTop: 20 }}>
          <h3>Available Jobs for Acceptance</h3>
          {loading && <p>Loading available jobs...</p>}
          {!loading && availableJobs.length === 0 && <p>No available jobs currently.</p>}

          <div className="jobs-list available-jobs">
            {availableJobs.map((job) => (
              <div
                key={job.id}
                className="job-card"
                tabIndex={0}
                onClick={() => setSelectedJob(job)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setSelectedJob(job);
                }}
                aria-label={`Job details for ${job.service?.name || "Service"}`}
              >
                <div className="job-card-header">
                  {statusBadge(job.status)}
                  <span>{job.service?.name || "—"}</span>
                </div>
                <div>Requested by: <b>{job.user}</b></div>
                <div>Cost: ₹{job.estimated_cost || job.service?.price || "—"}</div>
                <div className="job-location">
                  <FaMapMarkerAlt style={{ color: "#3F7AFD", opacity: 0.9 }} />
                  <a
                    href={`https://maps.google.com/?q=${job.lat},${job.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {Number(job.lat).toFixed(3)}, {Number(job.lng).toFixed(3)}
                  </a>
                </div>
                <button
                  disabled={activeAssignedJobs.length > 0}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleJobAction(job.id, "Accepted");
                  }}
                  title={activeAssignedJobs.length > 0 ? "Complete your current job before accepting new ones." : "Accept Job"}
                >
                  {acceptingJobId === job.id ? "Accepting..." : "Accept"}
                </button>
              </div>
            ))}
          </div>
        </section>

        {selectedJob && (
          <div
            className="modal-overlay"
            onClick={() => setSelectedJob(null)}
            role="dialog"
            aria-modal="true"
          >
            <div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
              tabIndex={-1}
              aria-label={`Details of job ${selectedJob.id}`}
            >
              <button className="modal-close-btn" onClick={() => setSelectedJob(null)} aria-label="Close details">&times;</button>
              <h3>{selectedJob.service?.name || "—"}</h3>
              <p>{selectedJob.service?.description || "No description available."}</p>
              <p>
                <b>User:</b> {selectedJob.user}
              </p>
              <p>
                <FaMapMarkerAlt />{" "}
                <a href={`https://maps.google.com/?q=${selectedJob.lat},${selectedJob.lng}`} target="_blank" rel="noopener noreferrer">
                  {Number(selectedJob.lat).toFixed(4)}, {Number(selectedJob.lng).toFixed(4)}
                </a>
              </p>
              <p>
                <b>Notes:</b> {selectedJob.notes || "No notes available."}
              </p>
              <p>{statusBadge(selectedJob.status)}</p>
              <p>
                <b>Contact:</b> {selectedJob.user}{" "}
                <a href={`tel:${selectedJob.userPhone || ""}`}>
                  <FaPhoneAlt />
                </a>
              </p>
              <div className="modal-actions">
                {(selectedJob.status === "Pending" && !hasActiveJob) && (
                  <button onClick={() => { handleJobAction(selectedJob.id, "Accepted"); setSelectedJob(null); }} className="accept-btn">
                    Accept
                  </button>
                )}
                <div style={{marginTop: "1em"}}>
                  {renderProviderActions(selectedJob)}
                </div>
              </div>
            </div>
          </div>
        )}

        <style>{`
          @keyframes spin { 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    </div>
  );
};


function StatCard({ title, value, color }) {
  return (
    <div className="stat-card" style={{ borderLeft: `5px solid ${color}` }}>
      <span style={{ fontSize: "0.95em", color: "#777", marginRight: 10 }}>{title}</span>
      <span style={{ fontSize: "1.3em", fontWeight: 600, color }}>{value}</span>
    </div>
  );
}

export default ProviderDashboard;
