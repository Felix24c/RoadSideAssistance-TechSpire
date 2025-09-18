import React, { useEffect, useState } from "react";
import "../styles/pageBackground.css";
import "../styles/global.css";
import "../styles/providerdashboard.css";
import { FaSyncAlt } from "react-icons/fa";

import ProviderStats from "../components/provider/ProviderStats";
import AssignedJobs from "../components/provider/AssignedJobs";
import AvailableJobs from "../components/provider/AvailableJobs";
import PastJobs from "../components/provider/PastJobs";

// Removed ProviderJobModal import as per new design

const STATUS_STYLES = {
  Pending: { color: "#FFD700", bg: "rgba(255,215,0,0.16)" },
  Accepted: { color: "var(--color-blue)", bg: "rgba(63,55,201,0.15)" },
  Arrived: { color: "#9C37C9", bg: "rgba(154,55,201,0.15)" },
  Completed: { color: "#19B87D", bg: "rgba(25,184,125,0.15)" },
  Cancelled: { color: "var(--color-red)", bg: "rgba(217,4,41,0.13)" },
};

const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8000";

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
        const res = await fetch(`${backendUrl}/api/providers`, {
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

  // Fetch jobs initially and every 30 seconds
  useEffect(() => {
    fetchJobs();
    const timer = setInterval(fetchJobs, 30000);
    return () => clearInterval(timer);
  }, []);

  async function fetchJobs() {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("access");
      if (!token) {
        setError("Not logged in");
        setLoading(false);
        return;
      }
      const headers = { Authorization: `Bearer ${token}` };
      const res = await fetch(`${backendUrl}/api/requests`, { headers });
      if (res.status === 401) throw new Error("Session expired. Please log in again");
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
      console.log("Assigned jobs:", assignedJobs);
console.log("Has active job:", hasActiveJob);
console.log("Can accept:", canAccept);
assignedJobs.forEach(job => console.log(`Job ${job.id} status: "${job.status}"`));
    } catch (e) {
      setError(e.message || "Failed to load jobs");
    } finally {
      setLoading(false);
      setRefreshing(false);
      setAcceptingJobId(null);
      setActionInProgressId(null);
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
      const res = await fetch(`${backendUrl}/api/requests/${jobId}`, {
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
      const res = await fetch(`${backendUrl}/api/requests/${jobId}${endpoint}`, {
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

        {/* Loading */}
        {(loading || refreshing) && <div className="banner banner-info">Loading jobs...</div>}
        {/* Stats */}
        <ProviderStats assignedCount={assignedJobs.length} availableCount={availableJobs.length} />
 {/* Refresh */}
        <button className="refresh-btn" onClick={fetchJobs} disabled={loading}>
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

        <AvailableJobs
          jobs={availableJobs}
          onAccept={handleAcceptJob}
          canAccept={canAccept}
          acceptingJobId={acceptingJobId}
        />

        <PastJobs
          jobs={pastJobs}
          onProviderAction={handleProviderChangeStatus}
          hasActiveJob={hasActiveJob}
        />

        

       
      </div>
    </div>
  );
};

export default ProviderDashboard;
