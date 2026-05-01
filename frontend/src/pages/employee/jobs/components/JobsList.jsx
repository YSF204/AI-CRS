import React from "react";
import {
  CvMatchPanel,
  JobDetailsPanel,
  JobDiscoveryState,
  JobFiltersPanel,
  JobPagination,
  JobResultsList,
  JobResultsToolbar,
  JobSearchBar,
} from "../../../../components/employee/job-discovery";

export default function JobsList({
  mode,
  query,
  setQuery,
  filters,
  onFilterChange,
  clearFilters,
  filtersOpen,
  setFiltersOpen,
  sortBy,
  setSortBy,
  browseFilteredJobs,
  cvFilteredJobs,
  jobsLoading,
  jobsError,
  refetchJobs,
  visibleJobs,
  selectedJobId,
  setSelectedJobId,
  currentPage,
  totalPages,
  setCurrentPage,
  cvs,
  selectedCvId,
  setSelectedCvId,
  handleMatchWithCv,
  handleUploadAndMatch,
  cvLoading,
  cvUploading,
  cvError,
  setCvError,
  fileValidationErrorRef,
  hasActiveFilters,
  selectedJob,
  onApply,
  onCloseJob,
}) {
  return (
    <div className="mt-6 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(360px,420px)] gap-5 items-start">
      <section className="jd-panel">
        <div className="space-y-4">
          <JobSearchBar value={query} onChange={setQuery} />

          {mode === "browse" ? (
            <>
              <JobFiltersPanel
                filters={filters}
                onFilterChange={onFilterChange}
                onClearFilters={clearFilters}
                isOpen={filtersOpen}
                onToggle={() => setFiltersOpen((prev) => !prev)}
              />

              <JobResultsToolbar
                resultCount={browseFilteredJobs.length}
                sortBy={sortBy}
                onSortChange={setSortBy}
                onClearFilters={clearFilters}
                hasActiveFilters={hasActiveFilters}
              />
            </>
          ) : (
            <>
              <CvMatchPanel
                cvs={cvs}
                selectedCvId={selectedCvId}
                onCvSelect={setSelectedCvId}
                onMatchWithCv={handleMatchWithCv}
                onUploadAndMatch={handleUploadAndMatch}
                loading={cvLoading}
                uploading={cvUploading}
                error={cvError}
                onValidationError={(message) => {
                  fileValidationErrorRef.current = message;
                  setCvError(message);
                }}
              />

              <JobResultsToolbar
                resultCount={cvFilteredJobs.length}
                sortBy={sortBy}
                onSortChange={setSortBy}
                onClearFilters={() => setQuery("")}
                hasActiveFilters={Boolean(query)}
              />
            </>
          )}

          {jobsError ? (
            <JobDiscoveryState
              type="error"
              description={
                jobsError?.response?.data?.message || "Unable to load jobs."
              }
              action="Try Again"
              onAction={refetchJobs}
            />
          ) : mode === "browse" && jobsLoading ? (
            <JobResultsList
              jobs={[]}
              selectedJobId={selectedJobId}
              onJobSelect={setSelectedJobId}
              getJobTypeLabel={(value) => value}
              loading
            />
          ) : visibleJobs.length === 0 ? (
            <JobDiscoveryState
              type={mode === "browse" ? "empty" : "no-results"}
              title={
                mode === "browse"
                  ? "No jobs match current filters"
                  : "No matches yet"
              }
              description={
                mode === "browse"
                  ? "Try a broader search term or clear filters."
                  : "Select a CV or upload a PDF to get personalized job matches."
              }
              action={
                mode === "browse" && hasActiveFilters
                  ? "Clear Filters"
                  : undefined
              }
              onAction={
                mode === "browse" && hasActiveFilters
                  ? clearFilters
                  : undefined
              }
            />
          ) : (
            <JobResultsList
              jobs={visibleJobs}
              selectedJobId={selectedJobId}
              onJobSelect={setSelectedJobId}
              getJobTypeLabel={(value) => value}
              loading={false}
            />
          )}

          {mode === "browse" &&
            !jobsLoading &&
            !jobsError &&
            browseFilteredJobs.length > 0 && (
              <JobPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => {
                  setCurrentPage(page);
                  setSelectedJobId(null);
                }}
              />
            )}
        </div>
      </section>

      <aside className="sticky top-10 h-[calc(100vh-80px)] flex flex-col overflow-hidden">
        <JobDetailsPanel
          job={selectedJob}
          onApply={onApply}
          onClose={onCloseJob}
        />
      </aside>
    </div>
  );
}
