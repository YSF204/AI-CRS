import React from "react";
import { X } from "lucide-react";

const JobResultsToolbar = ({ resultCount, sortBy, onSortChange, onClearFilters, hasActiveFilters }) => {
  const sortOptions = [
    { value: "newest", label: "DATE_DESC" },
    { value: "oldest", label: "DATE_ASC" },
    { value: "salary_desc", label: "PAY_DESC" },
    { value: "salary_asc", label: "PAY_ASC" },
    { value: "relevance", label: "MATCH_SCORE" }
  ];

  return (
    <div className="p-4 border-4 border-[var(--nm-ink)] bg-[var(--nm-surface)] flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 shadow-[4px_4px_0_var(--nm-ink)]">
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 bg-[var(--nm-primary)]" />
        <span className="font-mono text-[11px] font-black uppercase tracking-widest text-[var(--nm-text-primary)]">
          {resultCount === 1 ? "001_OBJECT_LOADED" : `${String(resultCount).padStart(3, '0')}_OBJECTS_LOADED`}
        </span>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="flex-1 sm:flex-none relative">
          <label htmlFor="sort-jobs" className="sr-only">
            Sort jobs by
          </label>
          <select
            id="sort-jobs"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="jd-select py-2 min-h-0 font-mono text-[10px] font-black uppercase tracking-tight bg-[var(--nm-surface-low)] pr-8"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                SORT_BY: {option.label}
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="jd-btn jd-btn-ghost py-2 min-h-0 font-mono text-[10px] font-black uppercase bg-[var(--nm-error-surface)] text-[var(--nm-error)] border-2 hover:bg-[var(--nm-error)] hover:text-white transition-colors"
            aria-label="Clear all filters"
          >
            <X size={12} strokeWidth={3} />
            RESET_FILTERS
          </button>
        )}
      </div>
    </div>
  );
};

export default JobResultsToolbar;
