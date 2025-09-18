import React from "react";
import JobCard from "./JobCard";

const AssignedJobs = ({
  jobs,
  onProviderAction,
  hasActiveJob,
  canAccept,
  actionInProgressId,
  loading,
}) => {
  if (loading) {
    return (
      <section>
        <h3>Assigned Jobs</h3>
        <p>Loading assigned jobs...</p>
      </section>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <section>
        <h3>Assigned Jobs</h3>
        <p>No assigned jobs</p>
      </section>
    );
  }

  return (
    <section>
      <h3>Assigned Jobs</h3>
      <div className="assigned-jobs-list">
        {jobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            mode="assigned"
            onProviderAction={onProviderAction}
            canAccept={canAccept}
            hasActiveJob={hasActiveJob}
            actionInProgressId={actionInProgressId}
          />
        ))}
      </div>
    </section>
  );
};

export default AssignedJobs;
