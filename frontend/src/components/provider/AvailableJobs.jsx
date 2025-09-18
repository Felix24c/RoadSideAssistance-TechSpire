import React from "react";
import JobCard from "./JobCard";

const AvailableJobs = ({ jobs, onAccept, canAccept, acceptingJobId }) => {
  if (!jobs || jobs.length === 0) {
    return (
      <section>
        <h3>Available Jobs for Acceptance</h3>
        <p>No available jobs</p>
      </section>
    );
  }

  return (
    <section>
      <h3>Available Jobs for Acceptance</h3>
      <div className="available-jobs-list">
        {jobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            onAccept={onAccept}
            canAccept={canAccept}
            acceptingJobId={acceptingJobId}
            mode="available"
          />
        ))}
      </div>
    </section>
  );
};

export default AvailableJobs;
