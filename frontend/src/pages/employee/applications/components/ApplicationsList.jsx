import React from "react";
import {
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  Building2,
} from "lucide-react";
import { SkCard, SkBox, SkText } from "../../../../components/ui/Skeleton";
import { useTranslation } from "../../../../context/LanguageContext";

export default function ApplicationsList({
  paginatedApps,
  selectedApp,
  onSelectApp,
  getStatusInfo,
  loading,
  currentPage,
  totalPages,
  onPageChange,
}) {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
          {[1, 2, 3, 4].map((i) => (
            <SkCard key={i} style={{ padding: "var(--spacing-4)" }}>
              <div style={{ display: "flex", gap: "var(--spacing-3)", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <SkBox w="60%" h={16} />
                  <div style={{ marginTop: "var(--spacing-1)" }}><SkBox w="40%" h={12} /></div>
                </div>
                <SkBox w={64} h={24} />
              </div>
            </SkCard>
          ))}
        </div>
      ) : paginatedApps.length === 0 ? (
        <div className="jd-panel p-20 text-center bg-[var(--nm-surface)] text-[var(--nm-text-primary)]">
          <ClipboardList size={48} className="mx-auto mb-4 opacity-20" />
          <p className="font-bold">{t("applications.noApplicationsFound")}</p>
        </div>
      ) : (
        paginatedApps.map((app) => {
          const isActive = selectedApp?._id === app._id;
          const status = getStatusInfo(app.status);
          return (
            <div
              key={app._id}
              onClick={() => onSelectApp(app)}
              className={`jd-card p-5 cursor-pointer transition-all border-4 ${
                isActive
                  ? "border-[var(--nm-primary)] bg-[var(--nm-surface-low)] translate-x-1"
                  : "border-[var(--nm-ink)] bg-[var(--nm-surface)] hover:border-[var(--nm-primary)] hover:translate-x-1"
              }`}
              style={{ boxShadow: isActive ? 'none' : '6px 6px 0 var(--nm-ink)' }}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="space-y-1">
                  <h3 className="font-black text-sm uppercase tracking-tight leading-tight text-[var(--nm-text-primary)]">
                    {app.jobId?.position || t("applications.untitledPosition")}
                  </h3>
                  <p className="text-xs font-bold text-[var(--nm-text-secondary)] flex items-center gap-1">
                    <Building2 size={12} />
                    {app.employerId?.company?.name || t("employer.company", {}, "Company")}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black font-['Space_Grotesk'] leading-none text-[var(--nm-text-primary)]">
                    {app.matchPercentage || 0}%
                  </div>
                  <span className="text-[8px] font-black text-[var(--nm-text-tertiary)] uppercase">
                    {t("applications.match")}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4">
                <div
                  className="flex items-center gap-2 px-2 py-0.5 border-2 text-[9px] font-black uppercase"
                  style={{ color: status.color, borderColor: status.color }}
                >
                  {status.icon}
                  {status.label}
                </div>
                <span className="text-[10px] font-bold text-[var(--nm-text-tertiary)]">
                  {new Date(app.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                  })}
                </span>
              </div>
            </div>
          );
        })
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 px-2">
          <button
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="p-2 border-2 border-[var(--nm-ink)] bg-[var(--nm-surface)] text-[var(--nm-text-primary)] disabled:opacity-20 hover:bg-[var(--nm-ink)] hover:text-white transition-all"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs font-black text-[var(--nm-text-primary)]">
            {t("common.page")} {currentPage} {t("common.of")} {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="p-2 border-2 border-[var(--nm-ink)] bg-[var(--nm-surface)] text-[var(--nm-text-primary)] disabled:opacity-20 hover:bg-[var(--nm-ink)] hover:text-white transition-all"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
