import React from "react";
import { Clock, MapPin, DollarSign, Briefcase } from "lucide-react";

const JobResultsList = ({ jobs, selectedJobId, onJobSelect, getJobTypeLabel, loading }) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="jd-card">
            <div className="jd-skeleton h-5 w-3/4 mb-2" />
            <div className="jd-skeleton h-4 w-1/2 mb-2" />
            <div className="jd-skeleton h-4 w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  if (!jobs || jobs.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {jobs.map((job, index) => {
        const isSelected = job.id === selectedJobId;
        const salary = job.raw?.salary
          ? `$${job.raw.salary.toLocaleString()}`
          : "Not specified";

        return (
          <button
            key={job.id || index}
            type="button"
            onClick={() => onJobSelect(job.id)}
            className={`jd-card w-full text-left ${isSelected ? "jd-card-selected" : ""}`}
            aria-pressed={isSelected}
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-[var(--jd-font-display)] text-lg font-bold uppercase tracking-tight text-[var(--jd-text-primary)] truncate">
                    {job.title}
                  </h3>
                  <p className="text-sm text-[var(--jd-text-secondary)] truncate">
                    {job.company}
                  </p>
                </div>
                {job.match !== undefined && job.match !== null && (
                  <div
                    className={`jd-badge shrink-0 ${job.match >= 80
                      ? "jd-badge-success"
                      : job.match >= 60
                        ? "jd-badge-warning"
                        : "jd-badge-danger"
                      }`}
                  >
                    {job.match}% Match
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--jd-text-secondary)]">
                <span className="flex items-center gap-1">
                  <MapPin size={14} />
                  {job.location}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase size={14} />
                  {getJobTypeLabel(job.type)}
                </span>
                {job.posted && (
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {job.posted}
                  </span>
                )}
              </div>

              {job.raw?.salary && (
                <div className="flex items-center gap-1 text-sm text-[var(--jd-text-secondary)]">
                  <DollarSign size={14} />
                  {salary}
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default JobResultsList;
