import React from "react";
import { Search } from "lucide-react";
import { useTranslation } from "../../../context/LanguageContext";

const JobSearchBar = ({ value, onChange, placeholder, disabled = false }) => {
  const { t } = useTranslation();
  const defaultPlaceholder = placeholder || t("employeeJobs.searchPlaceholder", {}, "Search jobs by title or company…");

  return (
    <div>
      <label htmlFor="job-search" className="jd-section-title mb-2 block">
        {t("employeeJobs.searchJobs", {}, "Search Jobs")}
      </label>
      <div style={{ position: "relative" }}>
        <Search
          size={18}
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "20px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--nm-text-tertiary)",
            pointerEvents: "none",
            zIndex: 10,
          }}
        />
        <input
          id="job-search"
          type="text"
          name="jobSearch"
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={defaultPlaceholder}
          disabled={disabled}
          className="jd-input"
          style={{ paddingLeft: "60px" }}
          aria-label={t("employeeJobs.searchJobs", {}, "Search Jobs")}
        />
      </div>
    </div>
  );
};

export default JobSearchBar;
