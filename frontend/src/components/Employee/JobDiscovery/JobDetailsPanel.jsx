import React from "react";
import {
  MapPin,
  Briefcase,
  Clock,
  DollarSign,
  ChevronRight,
  X
} from "lucide-react";

const JobDetailsPanel = ({
  job,
  onApply,
  onClose,
}) => {
  if (!job) {
    return (
      <div className="jd-detail-panel h-full flex items-center justify-center">
        <div className="text-left">
          <Briefcase size={48} className="mb-4 text-[var(--jd-primary)]" />
          <p className="text-[var(--jd-text-secondary)] font-[var(--jd-font-body)] max-w-sm">
            Select a job to view details and apply
          </p>
        </div>
      </div>
    );
  }

  const salary = job.raw?.salary
    ? `$${job.raw.salary.toLocaleString()}`
    : "Not specified";
  const sourceUrl = job.externalUrl || job.raw?.externalUrl || job.raw?.url || "";

  return (
    <div className="jd-detail-panel h-full flex flex-col">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex-1 min-w-0">
          <p className="jd-section-title mb-2">Selected Job</p>
          <h2 className="font-[var(--jd-font-display)] text-2xl font-bold uppercase tracking-tight text-[var(--jd-text-primary)] mb-2">
            {job.title}
          </h2>
          <p className="text-sm text-[var(--jd-text-secondary)] mb-3 font-[var(--jd-font-body)]">
            {job.company} • {job.location}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="jd-badge jd-badge-primary">
              {job.type}
            </span>
            {job.raw?.salary && (
              <span className="flex items-center gap-1 text-sm text-[var(--jd-text-secondary)]">
                <DollarSign size={14} />
                {salary}
              </span>
            )}
            {job.posted && (
              <span className="flex items-center gap-1 text-sm text-[var(--jd-text-secondary)]">
                <Clock size={14} />
                {job.posted}
              </span>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="jd-btn jd-btn-ghost"
          aria-label="Close job details"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6">
        {job.raw?.description && (
          <div className="jd-card">
            <h3 className="jd-section-title mb-2">
              Job Description
            </h3>
            <p className="text-sm text-[var(--jd-text-secondary)] leading-relaxed font-[var(--jd-font-body)]">
              {job.raw.description}
            </p>
          </div>
        )}

        <div className="jd-card">
          <h3 className="jd-section-title mb-3">
            Requirements
          </h3>

          <div className="space-y-3">
            {job.raw?.yearsOfExperience !== undefined && (
              <div>
                <p className="text-xs font-semibold text-[var(--jd-text-tertiary)] mb-1">
                  Years of Experience
                </p>
                <p className="text-sm text-[var(--jd-text-primary)]">
                  {job.raw.yearsOfExperience}+ years
                </p>
              </div>
            )}

            {job.raw?.technicalSkills?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-[var(--jd-text-tertiary)] mb-1">
                  Technical Skills
                </p>
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  {job.raw.technicalSkills.map((skill, i) => (
                    <span
                      key={i}
                      className="text-sm font-medium font-[var(--jd-font-display)] text-[var(--jd-text-primary)]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {job.raw?.softSkills?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-[var(--jd-text-tertiary)] mb-1">
                  Soft Skills
                </p>
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  {job.raw.softSkills.map((skill, i) => (
                    <span
                      key={i}
                      className="text-sm font-medium font-[var(--jd-font-display)] text-[var(--jd-text-primary)]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {job.raw?.language?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-[var(--jd-text-tertiary)] mb-1">
                  Languages
                </p>
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  {job.raw.language.map((lang, i) => (
                    <span
                      key={i}
                      className="text-sm font-medium font-[var(--jd-font-display)] text-[var(--jd-text-primary)]"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="jd-card">
          <h3 className="jd-section-title mb-2">
            Details
          </h3>
          <div className="space-y-2 text-sm text-[var(--jd-text-secondary)]">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-[var(--jd-text-tertiary)]" />
              <span className="text-[var(--jd-text-primary)]">Work Site:</span>
              <span>{job.raw?.workSite || job.location || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase size={16} className="text-[var(--jd-text-tertiary)]" />
              <span className="text-[var(--jd-text-primary)]">Duration:</span>
              <span>{job.raw?.workDuration || "N/A"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <button
          type="button"
          onClick={() => onApply(job)}
          className="jd-btn jd-btn-primary w-full"
        >
          {sourceUrl ? "Open Source" : "Apply Now"}
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default JobDetailsPanel;
