import React from "react";
import {
  Edit3,
  Loader,
  Trash2,
  ArrowRight,
  Building2,
  Calendar,
  MapPin,
  Target,
} from "lucide-react";
import { useTranslation } from "../../../../context/LanguageContext";

export default function ApplicationDetails({
  selectedApp,
  onEdit,
  onDelete,
  deletingId,
  onBack,
}) {
  const { t } = useTranslation();
  if (selectedApp) {
    return (
      <div className="jd-panel bg-[var(--nm-surface)] overflow-hidden shadow-[8px_8px_0_var(--nm-ink)] border-4 border-[var(--nm-ink)]">
        <div className="h-2 bg-[var(--nm-primary)] w-full" />
        <div className="p-4 sm:p-6">
          {onBack && (
            <button
              onClick={onBack}
              className="lg:hidden mb-5 w-full flex items-center justify-center gap-2 px-5 py-3.5 border-4 border-[var(--nm-ink)] bg-[var(--nm-primary)] text-white shadow-[4px_4px_0_var(--nm-ink)] hover:bg-[var(--nm-ink)] hover:text-white hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all text-sm font-black uppercase tracking-widest"
            >
              {t("applications.backToList")}
            </button>
          )}

          <div className="mb-4 sm:mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="px-3 py-1 bg-[var(--nm-ink)] text-white text-[10px] font-black uppercase tracking-[0.2em]">
                {t("applications.applicationDetails")}
              </div>
              <div className="h-[2px] flex-1 bg-[var(--nm-ink)]/10" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tighter leading-tight mb-2 text-[var(--nm-text-primary)]">
              {selectedApp.jobId?.position || t("applications.untitledPosition")}
            </h2>
            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-[var(--nm-text-secondary)] font-bold text-xs">
              <span className="flex items-center gap-1.5">
                <Building2 size={14} />
                {selectedApp.employerId?.company?.name || t("employer.company", {}, "Company")}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin size={14} />
                {selectedApp.jobId?.workSite ? (
                  selectedApp.jobId.workSite === "REMOTE" ? t("common.remote") :
                  selectedApp.jobId.workSite === "HYBRID" ? t("common.hybrid") :
                  selectedApp.jobId.workSite === "ON_SITE" ? t("common.onsite") :
                  selectedApp.jobId.workSite.replace("_", " ")
                ) : t("common.remote")}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={14} />
                {new Date(selectedApp.createdAt).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          <div className="mb-4 sm:mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div>
                <h3 className="font-black uppercase text-xs tracking-tight leading-none mb-1 text-[var(--nm-text-primary)]">
                  {t("applications.intelligenceAnalysis")}
                </h3>
                <p className="text-[9px] font-black text-[var(--nm-primary)] uppercase tracking-widest">
                  {t("applications.aiCoreOutput")}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-5 border-4 border-[var(--nm-ink)] bg-[var(--nm-surface-low)] relative overflow-hidden flex flex-col items-center justify-center text-center">
                <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none text-[var(--nm-ink)]">
                  <Target size={90} />
                </div>
                <div className="relative z-10 w-full flex flex-col items-center justify-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--nm-text-tertiary)] mb-2">
                    {t("applications.positionFitScore")}
                  </p>
                  <div className="flex items-center justify-center whitespace-nowrap">
                    <span className="text-4xl sm:text-5xl font-black font-['Space_Grotesk'] tracking-tighter text-[var(--nm-text-primary)] leading-none">
                      {selectedApp.matchPercentage || 0}%
                    </span>
                  </div>
                  <p className="mt-2 text-[9px] font-black uppercase tracking-widest text-[var(--nm-text-tertiary)]">
                    {t("applications.accuracyOptimized")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 pt-4 border-t-2 border-[var(--nm-ink)]/10">
            <button
              onClick={() => onEdit(selectedApp)}
              className="jd-btn jd-btn-primary py-2.5 w-full text-xs sm:text-sm font-black uppercase tracking-widest shadow-[6px_6px_0_var(--nm-ink)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
            >
              <Edit3 size={18} /> {t("applications.updateApplication")}
            </button>
            <button
              onClick={() => onDelete(selectedApp)}
              disabled={deletingId === selectedApp._id}
              className="py-2.5 w-full text-xs sm:text-sm font-black uppercase tracking-widest border-4 border-[var(--nm-ink)] bg-[var(--nm-surface)] text-[var(--nm-text-primary)] hover:bg-[var(--nm-error)] hover:text-white transition-all flex items-center justify-center gap-2 shadow-[6px_6px_0_var(--nm-ink)] hover:shadow-none active:translate-x-1 active:translate-y-1"
            >
              {deletingId === selectedApp._id ? (
                <Loader size={18} className="animate-spin" />
              ) : (
                <Trash2 size={18} />
              )}
              {deletingId === selectedApp._id
                ? t("applications.removing")
                : t("applications.removeApplication")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="jd-panel p-20 flex flex-col items-center justify-center text-center bg-[var(--nm-surface)]/50 border-4 border-dashed border-[var(--nm-ink)]/20 text-[var(--nm-text-tertiary)]">
      <ArrowRight size={48} className="mb-4 opacity-20" />
      <h3 className="font-black uppercase tracking-tight">
        {t("applications.selectToView")}
      </h3>
    </div>
  );
}
