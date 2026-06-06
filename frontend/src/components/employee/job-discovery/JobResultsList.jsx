import React from "react";
import { Clock, MapPin, DollarSign, Briefcase } from "lucide-react";
import { SkCard, SkBox } from "../../ui/Skeleton";
import { useTranslation } from "../../../context/LanguageContext";

const JobResultsList = ({ jobs, selectedJobId, onJobSelect, getJobTypeLabel, loading }) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <SkCard key={i} style={{ padding: "var(--spacing-4)" }}>
            <SkBox w="75%" h={24} />
            <SkBox w="50%" h={16} />
            <div style={{ display: "flex", gap: "var(--spacing-3)" }}>
              <SkBox w={80} h={16} />
              <SkBox w={80} h={16} />
            </div>
          </SkCard>
        ))}
      </div>
    );
  }

  if (!jobs || jobs.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6 pb-12">
      {jobs.map((job, index) => {
        if (job.isSeparator) {
          return (
            <div key={`sep-${index}`} className="py-8 flex items-center gap-6">
              <div className="h-1 flex-1 bg-[var(--nm-ink)] opacity-10" />
              <div className="px-6 py-2 border-4 border-[var(--nm-ink)] bg-[var(--nm-surface-low)] shadow-[4px_4px_0_var(--nm-ink)]">
                <span className="font-black text-xs uppercase tracking-[0.2em] text-[var(--nm-text-tertiary)]">
                  {t("employeeJobs.externalFits", {}, "External Fits")}
                </span>
              </div>
              <div className="h-1 flex-1 bg-[var(--nm-ink)] opacity-10" />
            </div>
          );
        }

        const isSelected = job.id === selectedJobId;
        const salary = job.raw?.salary
          ? `$${job.raw.salary.toLocaleString()}`
          : t("employeeJobs.notSpecified", {}, "Not Specified");

        return (
          <button
            key={job.id || index}
            type="button"
            onClick={() => onJobSelect(job.id)}
            className={`w-full text-left transition-all relative group
              ${isSelected 
                ? "translate-x-[4px] translate-y-[4px]" 
                : "hover:translate-x-[2px] hover:translate-y-[2px]"
              }`}
            aria-pressed={isSelected}
          >
            <div className={`p-6 border-4 border-[var(--nm-ink)] bg-[var(--nm-surface)] transition-all
              ${isSelected 
                ? "shadow-none border-[var(--nm-primary)] bg-[var(--nm-surface-low)]" 
                : "shadow-[6px_6px_0_var(--nm-ink)] group-hover:shadow-[4px_4px_0_var(--nm-ink)]"
              }`}
            >
              <div className="flex flex-col gap-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-[var(--font-display)] text-xl font-black uppercase tracking-tight text-[var(--nm-text-primary)] leading-none mb-1 group-hover:text-[var(--nm-primary)] transition-colors">
                      {job.title}
                    </h3>
                    <p className="text-sm font-[var(--font-body)] font-bold text-[var(--nm-text-secondary)] uppercase">
                      {job.company}
                    </p>
                  </div>
                  {job.match !== undefined && job.match !== null && !job.isExternal && (
                    <div
                      className={`px-3 py-1 border-4 border-[var(--nm-ink)] font-black text-xs uppercase tracking-tighter
                        ${job.match >= 80
                          ? "bg-[var(--nm-success)] text-white"
                          : job.match >= 60
                            ? "bg-[var(--nm-warning)] text-white"
                            : "bg-[var(--nm-error)] text-white"
                        }`}
                    >
                      {t("employeeJobs.matchPercent", { percent: job.match }, `${job.match}% MATCH`)}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-2 text-[var(--nm-text-secondary)]">
                    <MapPin size={14} strokeWidth={2.5} className="text-[var(--nm-primary)]" />
                    <span className="text-[10px] font-black uppercase tracking-wider">{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[var(--nm-text-secondary)]">
                    <Briefcase size={14} strokeWidth={2.5} className="text-[var(--nm-primary)]" />
                    <span className="text-[10px] font-black uppercase tracking-wider">{getJobTypeLabel(job.type)}</span>
                  </div>
                  {job.posted && (
                    <div className="flex items-center gap-2 text-[var(--nm-text-secondary)]">
                      <Clock size={14} strokeWidth={2.5} className="text-[var(--nm-primary)]" />
                      <span className="text-[10px] font-black uppercase tracking-wider">{job.posted.toUpperCase()}</span>
                    </div>
                  )}
                  {job.raw?.salary && (
                    <div className="flex items-center gap-2 text-[var(--nm-text-secondary)]">
                      <DollarSign size={14} strokeWidth={2.5} className="text-[var(--nm-primary)]" />
                      <span className="text-[11px] font-black uppercase tracking-wider">{salary}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default JobResultsList;
