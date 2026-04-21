import React from "react";
import { Search } from "lucide-react";

const JobSearchBar = ({ value, onChange, placeholder = "Search jobs by title or company…", disabled = false }) => {
  return (
    <div>
      <label htmlFor="job-search" className="jd-section-title mb-2 block">
        Search Jobs
      </label>
      <div className="input-with-icon-wrapper">
        <Search size={18} aria-hidden="true" />
        <input
          id="job-search"
          type="text"
          name="jobSearch"
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="jd-input input-with-icon"
          aria-label="Search jobs"
        />
      </div>
    </div>
  );
};

export default JobSearchBar;
