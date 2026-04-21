import React from "react";
import { X } from "lucide-react";

const JobResultsToolbar = ({ resultCount, sortBy, onSortChange, onClearFilters, hasActiveFilters }) => {
  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "salary_desc", label: "Salary: High to Low" },
    { value: "salary_asc", label: "Salary: Low to High" },
    { value: "relevance", label: "Most Relevant" }
  ];

  return (
    <div className="jd-card flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
      <div className="text-sm text-[var(--jd-text-secondary)]">
        {resultCount === 1 ? "1 job found" : `${resultCount} jobs found`}
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="flex-1 sm:flex-none">
          <label htmlFor="sort-jobs" className="sr-only">
            Sort jobs by
          </label>
          <select
            id="sort-jobs"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="jd-select"
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
            className="jd-btn jd-btn-ghost"
            aria-label="Clear all filters"
          >
            <X size={16} />
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
};

export default JobResultsToolbar;
