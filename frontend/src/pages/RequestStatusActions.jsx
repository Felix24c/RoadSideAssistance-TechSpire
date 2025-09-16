import React from "react";
const backendURL = process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8000";

const RequestStatusActions = ({ request, userRole, onStatusChange }) => {
  if (!request) return null;
  const token = localStorage.getItem("access");

  // Helper: are we in two-sided "arrived" handshake?
  const isArrivedHandshake =
    request.status === "Accepted" &&
    ((request.arrived_by_provider && !request.arrived_by_user) ||
      (!request.arrived_by_provider && request.arrived_by_user));

  // Provider sees "Mark as Arrived" ONLY if not confirmed yet
  const showArrivedButton =
    !request.arrived_by_provider &&
    userRole === "provider" &&
    request.status === "Accepted";

  // User sees "Confirm Arrival" ONLY if provider arrived but user hasn't
  const showUserArrivedButton =
    request.arrived_by_provider &&
    !request.arrived_by_user &&
    userRole === "user" &&
    request.status === "Accepted";
    
  // If provider confirmed and waiting for user
  const waitingUserConfirm =
    request.arrived_by_provider &&
    !request.arrived_by_user &&
    userRole === "provider" &&
    request.status === "Accepted";

  // If user confirmed and waiting for provider (rare)
  const waitingProviderConfirm =
    !request.arrived_by_provider &&
    request.arrived_by_user &&
    userRole === "user" &&
    request.status === "Accepted";

  // Completed stage (not your ask, but still here for clarity)
  const showCompletedButton =
    request.status === "Arrived" &&
    !request.completed_by_provider &&
    userRole === "provider";

  const showUserCompletedButton =
    request.status === "Arrived" &&
    request.completed_by_provider &&
    !request.completed_by_user &&
    userRole === "user";

  const sendPatch = async (url, body) => {
    await fetch(`${backendURL}${url}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    if (onStatusChange) onStatusChange(); // reload or refetch
  };

  return (
    <div className="request-status-actions">
      {showArrivedButton && (
        <button
          className="primary-btn"
          onClick={() =>
            sendPatch(`/api/requests/${request.id}/confirm-arrived`, { role: "provider" })
          }
        >
          Mark as Arrived
        </button>
      )}
      {waitingUserConfirm && (
        <span className="info-hint">Waiting for user to confirm arrival...</span>
      )}
      {showUserArrivedButton && (
        <button
          className="primary-btn"
          onClick={() =>
            sendPatch(`/api/requests/${request.id}/confirm-arrived`, { role: "user" })
          }
        >
          Provider Arrived - Confirm Arrival
        </button>
      )}
      {waitingProviderConfirm && (
        <span className="info-hint">Waiting for provider to confirm arrival...</span>
      )}

      {showCompletedButton && (
        <button
          className="primary-btn"
          onClick={() =>
            sendPatch(`/api/requests/${request.id}/confirm-completed`, { role: "provider" })
          }
        >
          Mark as Completed
        </button>
      )}
      {showUserCompletedButton && (
        <button
          className="primary-btn"
          onClick={() =>
            sendPatch(`/api/requests/${request.id}/confirm-completed`, { role: "user" })
          }
        >
          Provider Marked Completed - Confirm Job Done
        </button>
      )}
    </div>
  );
};

export default RequestStatusActions;
