import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "../../../context/LanguageContext";

const JobPagination = ({ currentPage, totalPages, onPageChange, disabled = false }) => {
  const { t } = useTranslation();
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
      aria-label={t("employeeJobs.paginationLabel", {}, "Job list pagination")}
    >
      <div className="text-sm text-[var(--nm-text-secondary)] font-[var(--font-body)]">
        {t("common.page", {}, "Page")} {currentPage} {t("common.of", {}, "of")} {totalPages}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handlePrevious}
          disabled={!hasPrevious || disabled}
          className="jd-btn jd-btn-secondary"
          aria-label={t("employeeJobs.prevPageLabel", {}, "Go to previous page")}
        >
          <ChevronLeft size={16} />
          {t("common.previous", {}, "Previous")}
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={!hasNext || disabled}
          className="jd-btn jd-btn-secondary"
          aria-label={t("employeeJobs.nextPageLabel", {}, "Go to next page")}
        >
          {t("common.next", {}, "Next")}
          <ChevronRight size={16} />
        </button>
      </div>
    </nav>
  );
};

export default JobPagination;
