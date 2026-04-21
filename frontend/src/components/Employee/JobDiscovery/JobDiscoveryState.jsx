import React from "react";
import { Loader2, AlertCircle, Inbox, FileText, Search } from "lucide-react";

const JobDiscoveryState = ({ type, title, description, action, onAction }) => {
  const getStateConfig = () => {
    switch (type) {
      case "loading":
        return {
          icon: Loader2,
          iconProps: { className: "animate-spin" },
          defaultTitle: "Loading Jobs…",
          defaultDescription: "Please wait while we fetch available positions."
        };
      case "error":
        return {
          icon: AlertCircle,
          defaultTitle: "Unable to load jobs",
          defaultDescription: "There was a problem loading the jobs. Please try again."
        };
      case "empty":
        return {
          icon: Search,
          defaultTitle: "No jobs found",
          defaultDescription: "Try adjusting your search or filters to find more results."
        };
      case "no-results":
        return {
          icon: Inbox,
          defaultTitle: "No matching jobs",
          defaultDescription: "We couldn't find any jobs that match your criteria."
        };
      case "no-cv":
        return {
          icon: FileText,
          defaultTitle: "No CVs uploaded",
          defaultDescription: "Upload a CV to get personalized job recommendations."
        };
      default:
        return {
          icon: Inbox,
          defaultTitle: "No results",
          defaultDescription: "No results found."
        };
    }
  };

  const config = getStateConfig();
  const Icon = config.icon;

  return (
    <div className="jd-state-container">
      <div className="jd-state-icon">
        <Icon size={48} {...config.iconProps} />
      </div>
      <h3 className="jd-state-title">{title || config.defaultTitle}</h3>
      <p className="jd-state-description">{description || config.defaultDescription}</p>
      {action && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="jd-btn jd-btn-primary"
        >
          {action}
        </button>
      )}
    </div>
  );
};

export default JobDiscoveryState;
