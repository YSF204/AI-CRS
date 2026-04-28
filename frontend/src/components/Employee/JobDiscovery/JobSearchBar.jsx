import React from "react";
import { Search } from "lucide-react";

const JobSearchBar = ({ value, onChange, placeholder = "Search jobs by title or company…", disabled = false }) => {
  return (
    <div>
      <label htmlFor="job-search" className="jd-section-title mb-2 block">
        Search Jobs
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
          placeholder={placeholder}
          disabled={disabled}
          className="jd-input"
          style={{ paddingLeft: "60px" }}
          aria-label="Search jobs"
        />
      </div>
    </div>
  );
};

export default JobSearchBar;
