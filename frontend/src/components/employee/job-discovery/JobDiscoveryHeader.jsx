import React from "react";
import { Briefcase, FileText } from "lucide-react";
import { useTranslation } from "../../../context/LanguageContext";

const JobDiscoveryHeader = ({ mode, onModeChange, resultCount }) => {
  const { t } = useTranslation();
  return (
    <div className="jd-surface-stack mb-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="jd-section-title">{t("employeeJobs.discoveryMode", {}, "Discovery Mode")}</p>
          <div className="jd-segment-group">
            <button
              type="button"
              onClick={() => onModeChange("browse")}
              className="jd-segment-button inline-flex items-center gap-2"
              data-active={mode === "browse"}
              aria-pressed={mode === "browse"}
            >
              <Briefcase size={16} />
              {t("employeeJobs.browseJobs", {}, "Browse Jobs")}
            </button>
            <button
              type="button"
              onClick={() => onModeChange("cv")}
              className="jd-segment-button inline-flex items-center gap-2"
              data-active={mode === "cv"}
              aria-pressed={mode === "cv"}
            >
              <FileText size={16} />
              {t("employeeJobs.matchByCv", {}, "Match by CV")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDiscoveryHeader;
