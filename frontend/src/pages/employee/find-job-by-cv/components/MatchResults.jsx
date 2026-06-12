import React from "react";
import {
  AlertTriangle,
  Briefcase,
  ChevronRight,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import ActionButton from "../../../../components/shared/ActionButton";
import { useTranslation } from "../../../../context/LanguageContext";

function renderResults({
  jobs,
  normalizedJobs,
  onGoToJob,
  onUploadClick,
  onBrowseJobs,
  t,
}) {
  if (!jobs) {
    return (
      <div className="brutal-card p-8 bg-(--card-bg) border-4 border-(--border-color)">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 shrink-0 border-2 border-black bg-(--yellow) flex items-center justify-center">
            <Sparkles size={18} />
          </div>
          <div>
            <p className="font-['Space_Grotesk'] font-bold uppercase text-lg mb-1">
              {t("findJobByCv.chooseOneThenSearch")}
            </p>
            <p className="font-mono text-sm text-(--fg-muted)">
              {t("findJobByCv.pickSavedOrUpload")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (normalizedJobs.length === 0) {
    return (
      <div className="brutal-card p-8 bg-(--card-bg) border-4 border-(--border-color)">
        <div className="flex items-start gap-3">
          <AlertTriangle className="text-(--coral) shrink-0" />
          <div>
            <p className="font-['Space_Grotesk'] font-bold uppercase text-lg mb-1">
              {t("findJobByCv.noStrongMatches")}
            </p>
            <p className="font-mono text-sm text-(--fg-muted)">
              {t("findJobByCv.tryAnotherOrUpload")}
            </p>
            <div className="flex flex-wrap gap-3 mt-4">
              <ActionButton
                type="button"
                variant="prism"
                className="px-4 py-2 font-bold"
                onClick={onUploadClick}
              >
                {t("findJobByCv.uploadAnotherPdf")}
              </ActionButton>
              <ActionButton
                type="button"
                variant="prism"
                className="px-4 py-2 font-bold"
                onClick={onBrowseJobs}
              >
                {t("findJobByCv.browseAllJobs")}
              </ActionButton>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const toWorkSite = (value) => {
    if (!value) return null;
    if (value === "REMOTE") return t("common.remote", {}, "Remote");
    if (value === "HYBRID") return t("common.hybrid", {}, "Hybrid");
    if (value === "ON_SITE") return t("common.onsite", {}, "On-site");
    return value.replace("_", " ");
  };

  const toRoleType = (value) => {
    if (!value) return null;
    if (value === "FULL_TIME") return t("common.fullTime", {}, "Full-time");
    if (value === "PART_TIME") return t("common.partTime", {}, "Part-time");
    if (value === "CONTRACT") return t("common.contract", {}, "Contract");
    if (value === "INTERNSHIP") return t("common.internship", {}, "Internship");
    return value;
  };

  return (
    <div className="grid grid-cols-1 gap-5">
      {normalizedJobs.map((item, index) => (
        <div
          key={item.key || index}
          className="brutal-card p-6 bg-(--card-bg) border-4 border-(--border-color) hover:border-black transition-all"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0 flex-1">
              <h2 className="font-['Space_Grotesk'] font-bold text-xl uppercase mb-1 break-words">
                {item.title}
              </h2>
              <p className="font-mono text-sm text-(--fg-muted)">
                {item.company} • {toWorkSite(item.location) || item.location}
              </p>
            </div>
            {item.match !== null && (
              <div
                className="brutal-card px-3 py-1 font-mono text-sm font-bold border-2 border-black whitespace-nowrap shrink-0"
                style={{
                  background:
                    item.match >= 80
                      ? "var(--color-success)"
                      : item.match >= 60
                        ? "var(--color-warning)"
                        : "var(--color-danger)",
                  color: "var(--color-text-primary)",
                }}
              >
                {t("employeeJobs.matchPercent", { percent: item.match })}
              </div>
            )}
          </div>

          {/* Meta badges (type / salary) */}
          {(item.workDuration || item.salary !== null) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {item.workDuration && (
                <span className="px-2 py-0.5 text-xs font-mono border border-(--border-color) text-(--fg-muted)">
                  {toRoleType(item.workDuration)}
                </span>
              )}
              {item.salary !== null && (
                <span className="px-2 py-0.5 text-xs font-mono border border-(--border-color) text-(--fg-muted)">
                  ${item.salary?.toLocaleString()}
                </span>
              )}
              {item.yearsOfExperience !== null && (
                <span className="px-2 py-0.5 text-xs font-mono border border-(--border-color) text-(--fg-muted)">
                  {item.yearsOfExperience}+ yrs
                </span>
              )}
            </div>
          )}

          {/* Description */}
          {item.description && (
            <p className="font-mono text-sm text-(--fg-muted) mb-4 leading-relaxed line-clamp-3">
              {item.description}
            </p>
          )}

          {/* AI reasoning */}
          {item.reasoning && (
            <p className="font-mono text-xs italic text-(--fg-muted) mb-3 border-l-2 border-(--yellow) pl-3">
              {item.reasoning}
            </p>
          )}

          {/* Technical skills required */}
          {item.technicalSkills?.length > 0 && (
            <div className="mb-3">
              <p className="font-bold uppercase text-xs tracking-[0.2em] text-(--fg-muted) mb-1">
                {t("employeeJobs.technicalSkills", {}, "Technical Skills")}
              </p>
              <div className="flex flex-wrap gap-1">
                {item.technicalSkills.slice(0, 8).map((s, i) => (
                  <span key={i} className="px-2 py-0.5 text-xs font-mono bg-(--bg) border border-(--border-color)">{s}</span>
                ))}
                {item.technicalSkills.length > 8 && (
                  <span className="px-2 py-0.5 text-xs font-mono text-(--fg-muted)">+{item.technicalSkills.length - 8} more</span>
                )}
              </div>
            </div>
          )}

          {/* Matched skills */}
          {item.skillsMatched?.length > 0 && (
            <div className="mb-3">
              <p className="font-bold uppercase text-xs tracking-[0.2em] text-(--fg-muted) mb-1">
                ✅ {t("findJobByCv.matchedSkills")}
              </p>
              <p className="font-mono text-sm text-(--color-success, green)">
                {item.skillsMatched.join(", ")}
              </p>
            </div>
          )}

          {/* Missing skills */}
          {item.skillsMissing?.length > 0 && (
            <div className="mb-4">
              <p className="font-bold uppercase text-xs tracking-[0.2em] text-(--fg-muted) mb-1">
                ❌ {t("findJobByCv.missingSkills")}
              </p>
              <p className="font-mono text-sm text-(--coral)">
                {item.skillsMissing.join(", ")}
              </p>
            </div>
          )}

          <ActionButton
            type="button"
            variant="prism"
            className="px-4 py-2 font-bold inline-flex items-center gap-2"
            onClick={() => {
              if (item.isExternal && item.externalUrl) {
                window.open(item.externalUrl, "_blank", "noopener,noreferrer");
              } else {
                onGoToJob(item.id);
              }
            }}
          >
            {t("findJobByCv.viewApply")}
            <ChevronRight size={16} />
          </ActionButton>
        </div>
      ))}
    </div>
  );
}

export default function MatchResults({
  jobs,
  normalizedJobs,
  loading,
  uploading,
  onClear,
  onGoToJob,
  onUploadClick,
  onBrowseJobs,
}) {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <div className="brutal-card p-6 border-4 border-black bg-(--card-bg)">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="font-['Space_Grotesk'] font-bold uppercase text-lg inline-flex items-center gap-2">
            <Briefcase size={18} />
            {t("findJobByCv.results")}
          </h2>
          {jobs && (
            <ActionButton
              type="button"
              variant="prism"
              onClick={onClear}
              className="px-3 py-1 font-bold text-xs"
            >
              {t("findJobByCv.clear")}
            </ActionButton>
          )}
        </div>

        {loading || uploading ? (
          <div className="brutal-card p-6 bg-(--bg) border-2 border-(--border-color) font-mono text-sm text-(--fg-muted) inline-flex items-center gap-2">
            <RefreshCw size={16} className="animate-spin" />
            {t("findJobByCv.searchingMatches")}
          </div>
        ) : (
          renderResults({
            jobs,
            normalizedJobs,
            onGoToJob,
            onUploadClick,
            onBrowseJobs,
            t,
          })
        )}
      </div>
    </div>
  );
}
