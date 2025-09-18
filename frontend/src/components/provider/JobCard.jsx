import React, { useState } from "react";

const STATUS_STYLES = {
  Pending: { color: "#FFD700", bg: "rgba(255,215,0,0.16)" },
  Accepted: { color: "var(--color-blue)", bg: "rgba(63,55,201,0.15)" },
  Arrived: { color: "#9C37C9", bg: "rgba(154,55,201,0.15)" },
  Completed: { color: "#19B87D", bg: "rgba(25,184,125,0.15)" },
  Cancelled: { color: "var(--color-red)", bg: "rgba(217,4,41,0.13)" },
};

function renderStatusBadge(status) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.Pending;
  return (
    <span
      className="status-badge"
      style={{ color: style.color, backgroundColor: style.bg }}
    >
      {status}
    </span>
  );
}

const JobCard = ({
  job,
  mode,
  onAccept,
  onProviderAction,
  canAccept,
  hasActiveJob,
  acceptingJobId,
  actionInProgressId,
}) => {
  const [expanded, setExpanded] = useState(false);

  const isAccepting = acceptingJobId === job.id;
  const isActionInProgress = actionInProgressId === job.id;

  // Show Arrived button only if job is assigned and status is Accepted
  const showArrivedBtn = mode === "assigned" && job.status === "Accepted";

  // Show Completed button only if job is assigned and status is Arrived
  const showCompletedBtn = mode === "assigned" && job.status === "Arrived";

  return (
    <div className="job-card">
      <div className="job-summary" onClick={() => setExpanded(!expanded)}>
        {renderStatusBadge(job.status)}
        <div className="job-title">
          {job.service?.name || "Unknown Service"}
          <span className="expand-hint">{expanded ? "▲" : "▼"}</span>
        </div>
        <div className="job-request-user">
          Requested by <b>{job.user}</b>
        </div>
        <div className="job-cost">
          ₹{job.estimated_cost || job.service?.price || "—"}
        </div>
      </div>

      {expanded && (
        <div className="job-details">
          <p>
            <strong>Description:</strong>{" "}
            {job.service?.description || "No description available"}
          </p>
          <p>
            <strong>Notes:</strong> {job.notes || "No notes"}
          </p>

          {/* Accept button for available jobs */}
          {mode === "available" && onAccept && (
            <button
              className="provider-btn"
              disabled={!canAccept || isAccepting || hasActiveJob}
              onClick={(e) => {
                e.stopPropagation();
                onAccept(job.id);
              }}
            >
              {isAccepting ? "Accepting..." : "Accept"}
            </button>
          )}

          {/* Arrived and Completed buttons for assigned jobs */}
          {mode === "assigned" && onProviderAction && (
            <>
              {showArrivedBtn && (
                <button
                  className="provider-btn"
                  disabled={isActionInProgress}
                  onClick={(e) => {
                    e.stopPropagation();
                    onProviderAction(job.id, "arrived");
                  }}
                >
                  {isActionInProgress ? "Processing..." : "Arrived"}
                </button>
              )}
              {showCompletedBtn && (
                <button
                  className="provider-btn"
                  disabled={isActionInProgress}
                  onClick={(e) => {
                    e.stopPropagation();
                    onProviderAction(job.id, "completed");
                  }}
                >
                  {isActionInProgress ? "Processing..." : "Completed"}
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default JobCard;
