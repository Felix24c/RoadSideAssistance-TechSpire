import React from "react";

const ProviderStatusActions = ({ job, onProviderAction, hasActiveJob }) => {
  if (["Cancelled", "Completed"].includes(job.status)) return null;

  if (job.status === "Accepted" && !job.arrived_by_provider) {
    return (
      <button
        onClick={() => onProviderAction(job.id, "arrived")}
        className="btn-arrived"
      >
        Mark Arrived at Location
      </button>
    );
  }

  if (job.status === "Accepted" && job.arrived_by_provider && !job.arrived_by_user) {
    return <div className="banner banner-info">Waiting for customer to confirm your arrival...</div>;
  }

  if (job.status === "Arrived" && !job.completed_by_provider) {
    return (
      <button
        onClick={() => onProviderAction(job.id, "completed")}
        className="btn-complete"
      >
        Mark Service Completed
      </button>
    );
  }

  if (job.status === "Arrived" && job.completed_by_provider && !job.completed_by_user) {
    return <div className="banner banner-info">Waiting for customer to confirm service completion...</div>;
  }

  if (job.status === "Completed") {
    return <div className="banner banner-success">Job fully completed. Great job!</div>;
  }

  return null;
};

export default ProviderStatusActions;
