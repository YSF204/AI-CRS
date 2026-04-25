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
      <div className="jd-detail-panel h-full flex items-center justify-center bg-[var(--nm-surface-low)]">
        <div className="text-left p-6 border-4 border-[var(--nm-ink)] bg-[var(--nm-surface)] shadow-[4px_4px_0_var(--nm-ink)] max-w-sm m-4">
          <Briefcase size={32} className="mb-4 text-[var(--nm-primary)]" />
          <h3 className="font-[var(--font-display)] font-black text-lg uppercase mb-2">Discovery Portal</h3>
          <p className="text-[var(--nm-text-secondary)] font-[var(--font-body)] text-sm">
            Select a job from the matrix to view details.
          </p>
        </div>
      </div>
    );
  }

  const salary = job.raw?.salary
    ? `$${job.raw.salary.toLocaleString()}`
    : "NOT SPECIFIED";
  const sourceUrl = job.externalUrl || job.raw?.externalUrl || job.raw?.url || "";

  return (
    <div className="jd-detail-panel h-full flex flex-col bg-[var(--nm-surface)] overflow-hidden border-l-4 border-[var(--nm-ink)]">
      {/* Header Section */}
      <div className="p-5 border-b-4 border-[var(--nm-ink)] bg-[var(--nm-bg)] relative">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="font-[var(--font-display)] text-2xl font-black uppercase tracking-tight text-[var(--nm-text-primary)] leading-none mb-3">
              {job.title}
            </h2>
            <div className="flex flex-col gap-1 mb-4">
              <div className="flex items-center gap-2 text-[var(--nm-text-primary)] font-[var(--font-body)] font-bold text-sm">
                <Briefcase size={14} className="text-[var(--nm-primary)]" />
                <span className="uppercase">{job.company}</span>
              </div>
              <div className="flex items-center gap-2 text-[var(--nm-text-secondary)] font-[var(--font-body)] text-sm">
                <MapPin size={14} className="text-[var(--nm-primary)]" />
                <span>{job.location}</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-1 bg-[var(--nm-primary)] text-white font-mono text-[10px] font-bold uppercase">
                {job.type}
              </span>
              {job.raw?.salary && (
                <span className="px-2 py-1 border-2 border-[var(--nm-ink)] bg-white font-mono text-[10px] font-bold">
                  {salary}
                </span>
              )}
              {job.posted && (
                <span className="px-2 py-1 border-2 border-[var(--nm-ink)] bg-white font-mono text-[10px] font-bold">
                  {job.posted.toUpperCase()}
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center border-4 border-[var(--nm-ink)] bg-white hover:bg-[var(--nm-error)] hover:text-white transition-all shadow-[4px_4px_0_var(--nm-ink)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_var(--nm-ink)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
            aria-label="Close job details"
          >
            <X size={20} strokeWidth={3} />
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-[var(--nm-bg)]" style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--nm-ink) transparent' }}>
        {job.raw?.description && (
          <div className="space-y-2">
            <h3 className="font-[var(--font-display)] font-black text-sm uppercase tracking-wider text-[var(--nm-text-primary)]">
              Overview
            </h3>
            <p className="text-sm text-[var(--nm-text-secondary)] leading-relaxed font-[var(--font-body)]">
              {job.raw.description}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <h3 className="font-[var(--font-display)] font-black text-sm uppercase tracking-wider text-[var(--nm-text-primary)]">
            Requirements
          </h3>
          <div className="space-y-4">
            {job.raw?.yearsOfExperience !== undefined && (
              <div>
                <p className="font-mono text-[10px] font-bold text-[var(--nm-text-tertiary)] uppercase mb-1">Experience</p>
                <p className="font-[var(--font-body)] font-bold text-sm text-[var(--nm-text-primary)] uppercase">
                  {job.raw.yearsOfExperience}+ Years
                </p>
              </div>
            )}
            {job.raw?.technicalSkills?.length > 0 && (
              <div>
                <p className="font-mono text-[10px] font-bold text-[var(--nm-text-tertiary)] uppercase mb-1">Technical Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {job.raw.technicalSkills.map((skill, i) => (
                    <span key={i} className="px-2 py-0.5 bg-[var(--nm-ink)] text-white font-mono text-[10px] font-bold uppercase">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {job.raw?.softSkills?.length > 0 && (
              <div>
                <p className="font-mono text-[10px] font-bold text-[var(--nm-text-tertiary)] uppercase mb-1">Soft Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {job.raw.softSkills.map((skill, i) => (
                    <span key={i} className="px-2 py-0.5 border-2 border-[var(--nm-ink)] bg-white text-[var(--nm-ink)] font-mono text-[10px] font-bold uppercase">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-[var(--font-display)] font-black text-sm uppercase tracking-wider text-[var(--nm-text-primary)]">
            Details
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm font-[var(--font-body)] border-b-2 border-dashed border-[var(--nm-ink)] pb-2">
              <span className="font-bold text-[var(--nm-text-tertiary)] uppercase">Location</span>
              <span className="font-bold text-[var(--nm-text-primary)] uppercase">{job.raw?.workSite || job.location || "REMOTE"}</span>
            </div>
            <div className="flex items-center justify-between text-sm font-[var(--font-body)] border-b-2 border-dashed border-[var(--nm-ink)] pb-2">
              <span className="font-bold text-[var(--nm-text-tertiary)] uppercase">Duration</span>
              <span className="font-bold text-[var(--nm-text-primary)] uppercase">{job.raw?.workDuration || "PERMANENT"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-5 border-t-4 border-[var(--nm-ink)] bg-[var(--nm-bg)]">
        <button
          type="button"
          onClick={() => onApply(job)}
          className="w-full flex items-center justify-center gap-2 py-4 bg-[var(--nm-primary)] text-white font-[var(--font-display)] text-sm font-black uppercase tracking-wider border-4 border-[var(--nm-ink)] shadow-[4px_4px_0_var(--nm-ink)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_var(--nm-ink)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all"
        >
          {sourceUrl ? "Open Source Link" : "Apply Now"}
          <ChevronRight size={18} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
};

export default JobDetailsPanel;
