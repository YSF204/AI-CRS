import React, { useState } from "react";
import moment from "moment"; // Assume moment.js is installed for relative time

const JobList = () => {
  const [selectedJob, setSelectedJob] = useState(null);

  const handleJobClick = (job) => {
    setSelectedJob(job);
  };

  return (
    <div>
      {/* Existing job list */}
      {jobs.map((job) => (
        <div className="job-item" onClick={() => handleJobClick(job)}>
          <h3>{job.title}</h3>
          <p>Posted {moment(job.createdAt).fromNow()}</p> // e.g., "5 weeks ago"
        </div>
      ))}
      {/* Two-column layout */}
      {selectedJob && (
        <div className="two-column-layout">
          <div className="job-list-column">{/* Existing job list */}</div>
          <div className="job-details-column">
            <h2>{selectedJob.title}</h2>
            <p>{selectedJob.description}</p>
            <button onClick={() => navigate("/apply/" + selectedJob.id)}>
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobList;
