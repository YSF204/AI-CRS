import React from "react";
import { X, SlidersHorizontal } from "lucide-react";

const JobFiltersPanel = ({ filters, onFilterChange, onClearFilters, isOpen, onToggle }) => {
  const workSiteOptions = [
    { value: "", label: "All Work Sites" },
    { value: "REMOTE", label: "Remote" },
    { value: "ONSITE", label: "On-site" },
    { value: "HYBRID", label: "Hybrid" }
  ];

  const workDurationOptions = [
    { value: "", label: "All Types" },
    { value: "FULL_TIME", label: "Full-time" },
    { value: "PART_TIME", label: "Part-time" },
    { value: "CONTRACT", label: "Contract" },
    { value: "INTERNSHIP", label: "Internship" }
  ];

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== "" && value !== null && value !== undefined
  );

  return (
    <div className="jd-surface-stack mb-4">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center justify-between w-full text-left"
        aria-expanded={isOpen}
        aria-controls="filters-content"
      >
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={18} className="text-[var(--jd-primary)]" />
          <span className="jd-section-title mb-0">Filters</span>
          {hasActiveFilters && (
            <span className="jd-badge jd-badge-primary">
              {Object.values(filters).filter(v => v !== "" && v !== null && v !== undefined).length}
            </span>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-[var(--jd-text-tertiary)] transition-transform ${isOpen ? "rotate-180" : ""
            }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div id="filters-content" className="mt-4 space-y-4">
          <div>
            <label htmlFor="filter-worksite" className="jd-section-title mb-2 block">
              Work Site
            </label>
            <select
              id="filter-worksite"
              value={filters.workSite || ""}
              onChange={(e) => onFilterChange({ ...filters, workSite: e.target.value || null })}
              className="jd-select"
            >
              {workSiteOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="filter-duration" className="jd-section-title mb-2 block">
              Work Duration
            </label>
            <select
              id="filter-duration"
              value={filters.workDuration || ""}
              onChange={(e) => onFilterChange({ ...filters, workDuration: e.target.value || null })}
              className="jd-select"
            >
              {workDurationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="filter-min-salary" className="jd-section-title mb-2 block">
              Minimum Salary ($)
            </label>
            <input
              id="filter-min-salary"
              type="number"
              name="minSalary"
              autoComplete="off"
              inputMode="numeric"
              min="0"
              step="100"
              value={filters.minSalary || ""}
              onChange={(e) => onFilterChange({ ...filters, minSalary: e.target.value ? Number(e.target.value) : null })}
              className="jd-input"
              placeholder="No minimum…"
            />
          </div>

          <div>
            <label htmlFor="filter-max-salary" className="jd-section-title mb-2 block">
              Maximum Salary ($)
            </label>
            <input
              id="filter-max-salary"
              type="number"
              name="maxSalary"
              autoComplete="off"
              inputMode="numeric"
              min="0"
              step="100"
              value={filters.maxSalary || ""}
              onChange={(e) => onFilterChange({ ...filters, maxSalary: e.target.value ? Number(e.target.value) : null })}
              className="jd-input"
              placeholder="No maximum…"
            />
          </div>

          <div>
            <label htmlFor="filter-min-experience" className="jd-section-title mb-2 block">
              Minimum Experience (years)
            </label>
            <input
              id="filter-min-experience"
              type="number"
              name="minExperience"
              autoComplete="off"
              inputMode="numeric"
              min="0"
              step="1"
              value={filters.minExperience || ""}
              onChange={(e) => onFilterChange({ ...filters, minExperience: e.target.value ? Number(e.target.value) : null })}
              className="jd-input"
              placeholder="No minimum…"
            />
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="jd-btn jd-btn-ghost w-full"
            >
              <X size={16} />
              Clear All Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default JobFiltersPanel;
