import React from "react";
import JobCard from "./JobCard";
import backendURL from "./config";

const PastJobs = ({ jobs, onProviderAction, hasActiveJob }) => (
  <section>
    <h3>Past Jobs (Completed / Cancelled)</h3>
    <div className="provider-jobs-list">
      {jobs.length === 0 ? (
        <div>No completed or cancelled jobs yet.</div>
      ) : (
        jobs.map(job => (
          <JobCard
            key={job.id}
            job={job}
            past
            onProviderAction={onProviderAction}
            hasActiveJob={hasActiveJob}
          />
        ))
      )}
    </div>
  </section>
);

export default PastJobs;
