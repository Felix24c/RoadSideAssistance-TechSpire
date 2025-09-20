import React, { useEffect, useState } from "react";
import backendURL from "../config";
import "../styles/pageBackground.css";
import "../styles/global.css";
import "../styles/providerdashboard.css";
import { FaSyncAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import ProviderStats from "../components/provider/ProviderStats";
import AssignedJobs from "../components/provider/AssignedJobs";
import AvailableJobs from "../components/provider/AvailableJobs";

const ProviderDashboard = () => {
  const [assignedJobs, setAssignedJobs] = useState([]);
  const [availableJobs, setAvailableJobs] = useState([]);
  const [pastJobs, setPastJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [acceptingJobId, setAcceptingJobId] = useState(null);
  const [actionInProgressId, setActionInProgressId] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  const navigate = useNavigate();

  
  const hasActiveJob = assignedJobs.some((j) => ["Accepted", "Arrived"].includes(j.status));
  const canAccept = !hasActiveJob;
  const clearMessages = () => {
    setActionMessage(null);
    setActionError(null);
  };

  // Fetch provider profile on mount
  useEffect(() => {
    async function fetchProviderProfile() {
      try {
        const token = localStorage.getItem("access");
        if (!token) throw new Error("Not logged in");
        const email = localStorage.getItem("email");
        const res = await fetch(`${backendURL}/api/providers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch providers");
        const providers = await res.json();
        const provider = providers.find(
          (p) => p.email.toLowerCase() === email.toLowerCase()
        );
        if (!provider) {
          alert("Provider profile not found");
          throw new Error("Provider profile not found");
        }
        localStorage.setItem("providerId", provider.id);
        localStorage.setItem("providerEmail", provider.email);
        localStorage.setItem("providerName", provider.name);
        localStorage.setItem("providerType", provider.type.toLowerCase());
      } catch (e) {
        setError(e.message);
      }
    }
    fetchProviderProfile();
  }, []);

  // Fetch jobs initially and every 15 seconds
  useEffect(() => {
    if (sessionExpired) return; // skip fetching if session expired
    fetchJobs();
    const timer = setInterval(fetchJobs, 15000);
    return () => clearInterval(timer);
  }, []);

  async function fetchJobs() {
  setError(null);
  setRefreshing(true);
  const fetchStartTime = Date.now();

  try {
    setLoading(true);
    const token = localStorage.getItem("access");
    if (!token) {
      setError("Not logged in");
      setSessionExpired(true);
      setLoading(false);
      setRefreshing(false);
      return;
    }
    const headers = { Authorization: `Bearer ${token}` };
    const res = await fetch(`${backendURL}/api/requests`, { headers });

    if (res.status === 401) {
      setSessionExpired(true);
      setLoading(false);
      setRefreshing(false);
      return;
    }
    if (!res.ok) throw new Error("Failed to load jobs");

    const jobs = await res.json();
    const providerEmail = (localStorage.getItem("providerEmail") || "").toLowerCase();
    const providerType = (localStorage.getItem("providerType") || "").toLowerCase();

    const assigned = jobs.filter(
      (job) =>
        job.provider?.email?.toLowerCase() === providerEmail &&
        ["Accepted", "Arrived", "Completed", "Cancelled"].includes(job.status)
    );
    const available = jobs.filter(
      (job) =>
        job.provider &&
        job.status === "Pending" &&
        job.service?.name?.toLowerCase() === providerType
    );
    const past = assigned.filter((job) => ["Completed", "Cancelled"].includes(job.status));
    const active = assigned.filter((job) => !["Completed", "Cancelled"].includes(job.status));

    setAssignedJobs(active.sort((a, b) => b.id - a.id));
    setPastJobs(past.sort((a, b) => b.id - a.id));
    setAvailableJobs(available.sort((a, b) => b.id - a.id));

  } catch (e) {
    setError(e.message || "Failed to load jobs");
  } finally {
    const elapsed = Date.now() - fetchStartTime;
    const minLoadingTime = 3000; // 3 seconds
    const remaining = minLoadingTime - elapsed;

    if (remaining > 0) {
      setTimeout(() => {
        setLoading(false);
        setRefreshing(false);
        setAcceptingJobId(null);
        setActionInProgressId(null);
      }, remaining);
    } else {
      setLoading(false);
      setRefreshing(false);
      setAcceptingJobId(null);
      setActionInProgressId(null);
    }
  }
}


  // Accept a job
  async function handleAcceptJob(jobId) {
    setAcceptingJobId(jobId);
    clearMessages();
    setActionMessage("Accepting the job...");

    try {
      const token = localStorage.getItem("access");
      if (!token) throw new Error("Not logged in");

      const providerEmail = localStorage.getItem("providerEmail");
      if (!providerEmail) throw new Error("Provider email missing");

      // Optimistic UI update
      setAvailableJobs((prev) => prev.filter((job) => job.id !== jobId));
      setAssignedJobs((prev) => [
        { id: jobId, provider: { email: providerEmail }, status: "Accepted" },
        ...prev,
      ]);

      const payload = { status: "Accepted", provider: providerEmail };
      const res = await fetch(`${backendURL}/api/requests/${jobId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to accept job");
      }

      setActionMessage("Job accepted! Please proceed to the user's location.");
      await fetchJobs();
    } catch (e) {
      console.error("Accept job error:", e);
      setActionError(e.message);
    } finally {
      setAcceptingJobId(null);
      setTimeout(clearMessages, 4000);
    }
  }

  // Handle provider status changes (arrived, completed)
  async function handleProviderChangeStatus(jobId, action) {
    setActionInProgressId(jobId);
    clearMessages();

    let inProgressMessage = "";
    let successMessage = "";

    if (action === "arrived") {
      inProgressMessage = "Sending arrival confirmation...";
      successMessage = "Arrival confirmed! Customer has been notified.";
    } else if (action === "completed") {
      inProgressMessage = "Finalizing the service...";
      successMessage = "Service completed! Customer has been notified.";
    }

    setActionMessage(inProgressMessage);

    try {
      const token = localStorage.getItem("access");
      if (!token) throw new Error("Not logged in");

      const endpoint = action === "arrived" ? "/confirm-arrived" : "/confirm-completed";
      const res = await fetch(`${backendURL}/api/requests/${jobId}${endpoint}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role: "provider" }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to update status");
      }

      setActionMessage(successMessage);
      await fetchJobs();
    } catch (e) {
      setActionError(e.message);
    } finally {
      setActionInProgressId(null);
      setTimeout(clearMessages, 4000);
    }
  }

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

if (sessionExpired) {
  return (
    <div className="page-background">
      <div className="myrequests-container">
        <div className="banner banner-error">Session expired. Please login again.
        <button
          className="btn btn-save"
          onClick={() => {handleLogout()}}
        >
          Go to Login
        </button>
        </div>
      </div>
    </div>
  );
}

else {
  return (
    <div className="page-background">
      {/* Global banners */}
      {actionMessage && <div className="banner banner-success">{actionMessage}</div>}
      {actionError && <div className="banner banner-error">{actionError}</div>}

      <div className="provider-dashboard-container">
        {/* Header */}
        <header className="provider-header">
          <h1>Welcome, {localStorage.getItem("providerName") || "Provider"}!</h1>
          <button className="shortcut-btn logout" onClick={handleLogout}>
            Logout
          </button>
        </header>
{/* Errors */}
        {error && <div className="banner banner-error">{error}</div>}

        {loading && (
  <div className="status-msg loading" style={{ marginTop: 20 }}>
    <span className="spinner" style={{ marginRight: 8 }}></span>
    Refreshing current job...
  </div>
)}
 {refreshing && (
  <div className="banner banner-info" style={{ marginBottom: 15 }}>
    <span className="spinner" style={{ marginRight: 8 }}></span>
    Checking for available jobs...
  </div>
)}

        {/* Stats */}
        <ProviderStats assignedCount={assignedJobs.length} availableCount={availableJobs.length} />
 {/* Refresh */}
       <button className="refresh-btn" onClick={fetchJobs} disabled={loading || refreshing}>
  <FaSyncAlt style={{ marginRight: 6 }} /> Refresh
</button>

        {/* Job Sections */}
        <AssignedJobs
          jobs={assignedJobs}
          onProviderAction={handleProviderChangeStatus}
          hasActiveJob={hasActiveJob}
          canAccept={canAccept}
          actionInProgressId={actionInProgressId}
          loading={loading}
        />
        <br />
        <AvailableJobs
          jobs={availableJobs}
          onAccept={handleAcceptJob}
          canAccept={canAccept}
          acceptingJobId={acceptingJobId}
        />
        <br />
        <button onClick={() => navigate("/provider-past-jobs")} className="shortcut-btn">
  View Past Jobs
</button>

       
      </div>
    </div>
  );
};
}
export default ProviderDashboard;
