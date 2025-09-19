import React, { useState } from "react";
import { FaPhoneAlt, FaMapMarkerAlt, FaTimes, FaEdit } from "react-icons/fa";

const STATUS_COLORS = {
  Pending: "badge-pending",
  Accepted: "badge-accepted",
  Arrived: "badge-accepted", // same as Accepted
  Completed: "badge-completed",
  Cancelled: "badge-cancelled",
};

function formatDate(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  return date.toLocaleString(undefined, {
    year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
  });
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
  const [editing, setEditing] = useState(false);
  const [editNote, setEditNote] = useState(job.notes || "");

  const isAccepting = acceptingJobId === job.id;
  const isActionInProgress = actionInProgressId === job.id;

  // Show Arrived button only if job is assigned and status is Accepted
  const showArrivedBtn = mode === "assigned" && job.status === "Accepted";

  // Show Completed button only if job is assigned and status is Arrived
  const showCompletedBtn = mode === "assigned" && job.status === "Arrived";

  const handleSaveNote = () => {
    // You can add a callback prop to save notes if needed
    setEditing(false);
  };

  return (
    <div className="request-card" style={{ marginBottom: "15px" }}>
      <div className="request-top" onClick={() => setEditing(!editing)}>
        <span className={`badge ${STATUS_COLORS[job.status] || "badge-pending"}`}>
          {job.status}
        </span>
        <span className="request-service">{job.service?.name || "Unknown Service"}</span>
        <span className="request-date">{formatDate(job.created)}</span>
      </div>

      <div className="request-details">
        <div>
          <span className="label">Requested by: </span>
          <b>{job.user || "Unknown User"}</b>
          {job.user_phone && (
            <a
              className="phone-link"
              href={`tel:${job.user_phone}`}
              title={`Call ${job.user_phone}`}
              style={{ marginLeft: "8px" }}
            >
              <FaPhoneAlt /> Call the User
            </a>
          )}
        </div>
        <div>
          <span className="label">Provider: </span>
          {job.provider?.name || <em>Unassigned</em>}
          {/* No call button here for provider */}
        </div>
        <div>
          <span className="label">User's Location: </span>
          <a
            className="map-link"
            href={`https://maps.google.com/?q=${job.lat},${job.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            title="View on map"
          >
            <FaMapMarkerAlt />
            {` ${job.lat?.toFixed(4)}, ${job.lng?.toFixed(4)}`} View on G-Maps
          </a>
        </div>
        <div>
          <span className="label">Estimated Cost: </span>
          ₹{job.estimated_cost || job.service?.price || "—"}
        </div>
        <div>
          <span className="label">Notes: </span>
          {editing ? (
            <textarea
              className="edit-notes"
              value={editNote}
              onChange={(e) => setEditNote(e.target.value)}
              rows={3}
              maxLength={400}
            />
          ) : (
            job.notes || <em>None</em>
          )}
        </div>
      </div>

      <div className="request-actions">
        {editing ? (
          <>
            <button className="btn btn-save" onClick={handleSaveNote}>
              Save
            </button>
            <button className="btn btn-cancel" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </>
        ) : (
          <>
            {mode === "available" && onAccept && (
              <button
                className="primary-btn"
                disabled={!canAccept || isAccepting || hasActiveJob}
                onClick={() => onAccept(job.id)}
              >
                {isAccepting ? "Accepting..." : "Accept"}
              </button>
            )}

            {mode === "assigned" && onProviderAction && (
              <>
                {showArrivedBtn && (
                  <button
                    className="primary-btn"
                    disabled={isActionInProgress}
                    onClick={() => onProviderAction(job.id, "arrived")}
                  >
                    {isActionInProgress ? "Processing..." : "Arrived"}
                  </button>
                )}
                {showCompletedBtn && (
                  <button
                    className="primary-btn"
                    disabled={isActionInProgress}
                    onClick={() => onProviderAction(job.id, "completed")}
                  >
                    {isActionInProgress ? "Processing..." : "Completed"}
                  </button>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default JobCard;
