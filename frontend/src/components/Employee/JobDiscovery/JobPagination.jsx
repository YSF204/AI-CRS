import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const JobPagination = ({ currentPage, totalPages, onPageChange, disabled = false }) => {
  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  const handlePrevious = () => {
    if (hasPrevious && !disabled) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (hasNext && !disabled) {
      onPageChange(currentPage + 1);
    }
  };

  if (totalPages <= 1) return null;

  return (
    <nav
      className="jd-card flex items-center justify-between gap-4"
      role="navigation"
      aria-label="Job list pagination"
    >
      <div className="text-sm text-[var(--jd-text-secondary)] font-[var(--jd-font-body)]">
        Page {currentPage} of {totalPages}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handlePrevious}
          disabled={!hasPrevious || disabled}
          className="jd-btn jd-btn-secondary"
          aria-label="Go to previous page"
        >
          <ChevronLeft size={16} />
          Previous
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={!hasNext || disabled}
          className="jd-btn jd-btn-secondary"
          aria-label="Go to next page"
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    </nav>
  );
};

export default JobPagination;
