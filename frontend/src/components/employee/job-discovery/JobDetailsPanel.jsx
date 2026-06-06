import React from "react";
import {
  MapPin,
  Briefcase,
  Clock,
  DollarSign,
  ChevronRight,
  X
} from "lucide-react";
import { useTranslation } from "../../../context/LanguageContext";

const JobDetailsPanel = ({
  job,
  onApply,
  onClose,
}) => {
  const { t } = useTranslation();

  if (!job) {
    return (
      <div className="jd-detail-panel h-full flex items-center justify-center bg-[var(--nm-surface-low)]">
        <div className="text-left p-8 border-4 border-[var(--nm-ink)] bg-[var(--nm-surface)] shadow-[8px_8px_0_var(--nm-ink)]">
          <Briefcase size={48} className="mb-4 text-[var(--nm-primary)]" />
          <h3 className="font-[var(--font-display)] font-black text-xl uppercase mb-2">{t("employeeJobs.jobDiscovery", {}, "Job Details")}</h3>
          <p className="text-[var(--nm-text-secondary)] font-[var(--font-body)] max-w-sm">
            {t("employeeJobs.selectJobToView", {}, "Select a job to view details and apply.")}
          </p>
        </div>
      </div>
    );
  }

  const salary = job.raw?.salary
    ? `$${job.raw.salary.toLocaleString()}`
    : "NOT_SPECIFIED";
  const sourceUrl = job.externalUrl || job.raw?.externalUrl || job.raw?.url || "";

  return (
    <div className="h-full flex flex-col bg-[var(--nm-surface)] border-4 border-[var(--nm-ink)] shadow-[4px_4px_0_var(--nm-ink)] overflow-hidden">
      {/* Header Section */}
      <div className="p-6 border-b-4 border-[var(--nm-ink)] bg-[var(--nm-surface-low)] relative">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
               <div className="w-2 h-2 bg-[var(--nm-primary)]" />
               <p className="font-mono text-[10px] uppercase tracking-[0.2em] font-bold text-[var(--nm-text-tertiary)]">{t("employeeJobs.jobDiscovery", {}, "Job Details")}</p>
            </div>
            <h2 className="font-[var(--font-display)] text-3xl font-black uppercase tracking-tighter text-[var(--nm-text-primary)] leading-none mb-4">
              {job.title}
            </h2>
            <div className="flex flex-col gap-1.5 mb-5">
              <div className="flex items-center gap-2 text-[var(--nm-text-secondary)] font-[var(--font-body)] font-bold text-sm">
                <Briefcase size={14} className="text-[var(--nm-primary)]" />
                <span className="uppercase">{job.company}</span>
              </div>
              <div className="flex items-center gap-2 text-[var(--nm-text-secondary)] font-[var(--font-body)] text-sm">
                <MapPin size={14} className="text-[var(--nm-primary)]" />
                <span>{job.location}</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="jd-badge jd-badge-primary">
                {job.type}
              </span>
              {job.raw?.salary && (
                <div className="flex items-center gap-2 px-3 py-1 border-2 border-[var(--nm-ink)] bg-[var(--nm-surface)] font-mono text-[10px] font-bold">
                  <DollarSign size={12} />
                  {salary}
                </div>
              )}
              {job.posted && (
                <div className="flex items-center gap-2 px-3 py-1 border-2 border-[var(--nm-ink)] bg-[var(--nm-surface)] font-mono text-[10px] font-bold">
                  <Clock size={12} />
                  {job.posted.toUpperCase()}
                </div>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-12 h-12 flex items-center justify-center border-4 border-[var(--nm-ink)] bg-[var(--nm-surface)] hover:bg-[var(--nm-error)] hover:text-white transition-all shadow-[4px_4px_0_var(--nm-ink)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_var(--nm-ink)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
            aria-label={t("employeeJobs.closeJob", {}, "Close job details")}
          >
            <X size={24} strokeWidth={3} />
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 pb-20 space-y-8 bg-[var(--nm-bg)] min-h-0" style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--nm-ink) transparent' }}>
        {job.raw?.description && (
          <div className="space-y-4">
            <h3 className="font-[var(--font-display)] font-black text-[10px] uppercase tracking-[0.2em] text-[var(--nm-text-tertiary)] px-1">
              {t("employeeJobs.aboutRole", {}, "About the role")}
            </h3>
            <div className="p-6 border-4 border-[var(--nm-ink)] bg-[var(--nm-surface)] shadow-[6px_6px_0_var(--nm-ink)]">
              <p className="text-sm text-[var(--nm-text-secondary)] leading-relaxed font-[var(--font-body)]">
                {job.raw.description}
              </p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="font-[var(--font-display)] font-black text-[10px] uppercase tracking-[0.2em] text-[var(--nm-text-tertiary)] px-1">
            {t("employeeJobs.requirements", {}, "Requirements")}
          </h3>

          <div className="grid grid-cols-1 gap-4">
            {job.raw?.yearsOfExperience !== undefined && (
              <div className="p-4 border-2 border-[var(--nm-ink)] bg-[var(--nm-surface-low)]">
                <p className="font-mono text-[9px] font-black text-[var(--nm-text-tertiary)] uppercase mb-1">{t("employeeJobs.experience", {}, "Experience")}</p>
                <p className="font-[var(--font-display)] font-bold text-base text-[var(--nm-text-primary)] uppercase">
                  {t("employeeJobs.yearsPlus", { years: job.raw.yearsOfExperience }, `${job.raw.yearsOfExperience}+ Years`)}
                </p>
              </div>
            )}

            {job.raw?.technicalSkills?.length > 0 && (
              <div className="p-4 border-2 border-[var(--nm-ink)] bg-[var(--nm-surface-low)]">
                <p className="font-mono text-[9px] font-black text-[var(--nm-text-tertiary)] uppercase mb-2">{t("employeeJobs.technicalSkills", {}, "Technical Skills")}</p>
                <div className="flex flex-wrap gap-2">
                  {job.raw.technicalSkills.map((skill, i) => (
                    <span key={i} className="px-2 py-1 bg-[var(--nm-ink)] text-white font-mono text-[10px] font-bold uppercase">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {job.raw?.softSkills?.length > 0 && (
              <div className="p-4 border-2 border-[var(--nm-ink)] bg-[var(--nm-surface-low)]">
                <p className="font-mono text-[9px] font-black text-[var(--nm-text-tertiary)] uppercase mb-2">{t("employeeJobs.softSkills", {}, "Soft Skills")}</p>
                <div className="flex flex-wrap gap-2">
                  {job.raw.softSkills.map((skill, i) => (
                    <span key={i} className="px-2 py-1 border border-[var(--nm-ink)] bg-white text-[var(--nm-ink)] font-mono text-[10px] font-bold uppercase">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-[var(--font-display)] font-black text-[10px] uppercase tracking-[0.2em] text-[var(--nm-text-tertiary)] px-1">
            {t("employeeJobs.additionalInfo", {}, "Additional Info")}
          </h3>
          <div className="p-6 border-4 border-[var(--nm-ink)] bg-[var(--nm-surface)] shadow-[6px_6px_0_var(--nm-ink)] space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 flex items-center justify-center bg-[var(--nm-surface-low)] border-2 border-[var(--nm-ink)]">
                <MapPin size={18} className="text-[var(--nm-primary)]" />
              </div>
              <div>
                <p className="font-mono text-[9px] font-black text-[var(--nm-text-tertiary)] uppercase">{t("employeeJobs.location", {}, "Location")}</p>
                <p className="font-[var(--font-display)] font-bold text-sm text-[var(--nm-text-primary)] uppercase">{job.raw?.workSite || job.location || "Remote"}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 flex items-center justify-center bg-[var(--nm-surface-low)] border-2 border-[var(--nm-ink)]">
                <Briefcase size={18} className="text-[var(--nm-primary)]" />
              </div>
              <div>
                <p className="font-mono text-[9px] font-black text-[var(--nm-text-tertiary)] uppercase">{t("employeeJobs.type", {}, "Type")}</p>
                <p className="font-[var(--font-display)] font-bold text-sm text-[var(--nm-text-primary)] uppercase">{job.raw?.workDuration || "Permanent"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-6 border-t-4 border-[var(--nm-ink)] bg-[var(--nm-surface)]">
        <button
          type="button"
          onClick={() => onApply(job)}
          className="jd-btn jd-btn-primary w-full py-6 text-base font-black shadow-[6px_6px_0_var(--nm-ink)] active:shadow-none active:translate-x-[6px] active:translate-y-[6px]"
        >
          {sourceUrl ? t("employeeJobs.openSite", {}, "OPEN SITE") : t("employeeJobs.applyNow", {}, "APPLY NOW")}
          <ChevronRight size={20} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
};

export default JobDetailsPanel;
