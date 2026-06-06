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

  return (
    <div className="grid grid-cols-1 gap-5">
      {normalizedJobs.map((item, index) => (
        <div
          key={item.key || index}
          className="brutal-card p-6 bg-(--card-bg) border-4 border-(--border-color) hover:border-black transition-all"
        >
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="font-['Space_Grotesk'] font-bold text-xl uppercase mb-1">
                {item.title}
              </h2>
              <p className="font-mono text-sm text-(--fg-muted)">
                {item.company} • {item.location}
              </p>
            </div>
            {item.match !== null && (
              <div
                className="brutal-card px-3 py-1 font-mono text-sm font-bold border-2 border-black whitespace-nowrap"
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

          {item.reasoning && (
            <p className="font-mono text-sm text-(--fg) mb-4">
              {item.reasoning}
            </p>
          )}

          {item.skillsMatched?.length > 0 && (
            <div className="mb-3">
              <p className="font-bold uppercase text-xs tracking-[0.2em] text-(--fg-muted)">
                {t("findJobByCv.matchedSkills")}
              </p>
              <p className="font-mono text-sm">
                {item.skillsMatched.join(", ")}
              </p>
            </div>
          )}

          {item.skillsMissing?.length > 0 && (
            <div className="mb-4">
              <p className="font-bold uppercase text-xs tracking-[0.2em] text-(--fg-muted)">
                {t("findJobByCv.missingSkills")}
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
            onClick={() => onGoToJob(item.id)}
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
