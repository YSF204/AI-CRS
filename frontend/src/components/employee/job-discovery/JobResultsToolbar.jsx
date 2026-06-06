import React from "react";
import { X } from "lucide-react";
import { useTranslation } from "../../../context/LanguageContext";

const JobResultsToolbar = ({ resultCount, sortBy, onSortChange, onClearFilters, hasActiveFilters }) => {
  const { t } = useTranslation();

  const sortOptions = [
    { value: "newest", label: t("employeeJobs.newest", {}, "Newest") },
    { value: "oldest", label: t("employeeJobs.oldest", {}, "Oldest") },
    { value: "salary_desc", label: t("employeeJobs.highestSalary", {}, "Highest Salary") },
    { value: "salary_asc", label: t("employeeJobs.lowestSalary", {}, "Lowest Salary") },
    { value: "relevance", label: t("employeeJobs.relevance", {}, "Relevance") }
  ];

  return (
    <div className="p-4 border-4 border-[var(--nm-ink)] bg-[var(--nm-surface)] flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 shadow-[4px_4px_0_var(--nm-ink)]">
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 bg-[var(--nm-primary)]" />
        <span className="font-mono text-[11px] font-black uppercase tracking-widest text-[var(--nm-text-primary)]">
          {resultCount === 1
            ? t("employeeJobs.jobsFound_one", {}, "1 job found")
            : t("employeeJobs.jobsFound_other", { count: resultCount }, `${resultCount} jobs found`)}
        </span>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="flex-1 sm:flex-none relative">
          <label htmlFor="sort-jobs" className="sr-only">
            {t("employeeJobs.sortBy", {}, "Sort by")}
          </label>
          <select
            id="sort-jobs"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="jd-select py-2 min-h-0 font-mono text-[10px] font-black uppercase tracking-tight bg-[var(--nm-surface-low)] pr-8"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="jd-btn jd-btn-ghost py-2 min-h-0 font-mono text-[10px] font-black uppercase bg-[var(--nm-error-surface)] text-[var(--nm-error)] border-2 hover:bg-[var(--nm-error)] hover:text-white transition-colors"
            aria-label={t("employeeJobs.clearFilters", {}, "Clear Filters")}
          >
            <X size={12} strokeWidth={3} />
            {t("employeeJobs.clearFilters", {}, "Clear Filters")}
          </button>
        )}
      </div>
    </div>
  );
};

export default JobResultsToolbar;
