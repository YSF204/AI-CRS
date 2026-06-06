import React from "react";
import { Loader2, AlertCircle, Inbox, FileText, Search } from "lucide-react";
import { useTranslation } from "../../../context/LanguageContext";

const JobDiscoveryState = ({ type, title, description, action, onAction }) => {
  const { t } = useTranslation();
  const getStateConfig = () => {
    switch (type) {
      case "loading":
        return {
          icon: Loader2,
          iconProps: { className: "animate-spin" },
          defaultTitle: t("employeeJobs.loadingTitle", {}, "Loading Jobs"),
          defaultDescription: t("employeeJobs.loadingDesc", {}, "Fetching available jobs...")
        };
      case "error":
        return {
          icon: AlertCircle,
          defaultTitle: t("common.error", {}, "Error"),
          defaultDescription: t("employeeJobs.errorDesc", {}, "Failed to load jobs. Please try again.")
        };
      case "empty":
        return {
          icon: Search,
          defaultTitle: t("employeeJobs.emptyTitle", {}, "No Jobs Found"),
          defaultDescription: t("employeeJobs.emptyDesc", {}, "Try adjusting your search filters.")
        };
      case "no-results":
        return {
          icon: Inbox,
          defaultTitle: t("employeeJobs.noResultsTitle", {}, "No Results"),
          defaultDescription: t("employeeJobs.noResultsDesc", {}, "No jobs match your criteria.")
        };
      case "no-cv":
        return {
          icon: FileText,
          defaultTitle: t("employeeJobs.noCvTitle", {}, "CV Missing"),
          defaultDescription: t("employeeJobs.noCvDesc", {}, "Upload a CV to see jobs that match your skills.")
        };
      default:
        return {
          icon: Inbox,
          defaultTitle: t("employeeJobs.noDataTitle", {}, "No Data"),
          defaultDescription: t("employeeJobs.noDataDesc", {}, "No information available.")
        };
    }
  };

  const config = getStateConfig();
  const Icon = config.icon;

  return (
    <div className="p-12 border-4 border-[var(--nm-ink)] bg-[var(--nm-surface-low)] text-center flex flex-col items-center justify-center shadow-[8px_8px_0_var(--nm-ink)]">
      <div className="flex items-center gap-4 mb-6 justify-center">
        <div className="w-16 h-16 flex items-center justify-center bg-[var(--nm-ink)] text-white shadow-[6px_6px_0_var(--nm-primary)]">
          <Icon size={32} strokeWidth={2.5} {...config.iconProps} />
        </div>
        <div className="w-2 h-2 bg-[var(--nm-primary)] animate-pulse" />
      </div>
      <h3 className="font-[var(--font-display)] text-2xl font-black uppercase tracking-tighter text-[var(--nm-text-primary)] leading-none mb-3">
        {title ? title.toUpperCase() : config.defaultTitle}
      </h3>
      <p className="font-[var(--font-body)] text-[var(--nm-text-secondary)] font-bold text-sm max-w-md mb-8">
        {description || config.defaultDescription}
      </p>
      {action && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="jd-btn jd-btn-primary px-8 py-4 font-black shadow-[6px_6px_0_var(--nm-ink)] active:shadow-none active:translate-x-[6px] active:translate-y-[6px]"
        >
          {action.toUpperCase()}
        </button>
      )}
    </div>
  );
};

export default JobDiscoveryState;
