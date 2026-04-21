import React, { useMemo, useRef, useState } from "react";
import { useDebounce } from "@uidotdev/usehooks";
import { RefreshCw, Sparkles } from "lucide-react";
import DashboardNav from "../../components/shared/DashboardNav";
import api from "../../services/api";
import useFetch from "../../hooks/useFetch";
import { getRelativeTime } from "../../utils/dateFormatter";
import ApplyJobModal from "./ApplyJob";
import {
  CvMatchPanel,
  JobDetailsPanel,
  JobDiscoveryHeader,
  JobDiscoveryState,
  JobFiltersPanel,
  JobPagination,
  JobResultsList,
  JobResultsToolbar,
  JobSearchBar,
} from "../../components/Employee/JobDiscovery";

const PAGE_SIZE = 8;

const toRoleType = (value) => {
  if (value === "FULL_TIME") return "Full-time";
  if (value === "PART_TIME") return "Part-time";
  if (value === "CONTRACT") return "Contract";
  if (value === "INTERNSHIP") return "Internship";
  return value || "Open";
};

const normalizeJob = (job, index = 0) => ({
  id: job._id || job.id || job.externalUrl || job.url || `job-${index}`,
  title: job.position || job.title,
  company: job.employerId?.company?.name || job.sourceName || job.company || "Company",
  location: job.workSite?.replace("_", " ") || job.location || "N/A",
  type: toRoleType(job.workDuration),
  posted: job.createdAt ? getRelativeTime(job.createdAt) : (job.posted || "Recently"),
  externalUrl: job.externalUrl || job.url || "",
  sourceName: job.sourceName || "",
  raw: job,
});

const normalizeCvMatch = (item, index) => {
  const rawId = item.jobId || item.job_id || item._id || item.id;
  const id = typeof rawId === "object" ? rawId?._id : rawId;
  const score = item.matchScore ?? item.relevance_score ?? item.relevanceScore;

  return {
    key: id || index,
    id,
    title: item.position || item.jobTitle || item.title || "Matched Job",
    location: item.workSite || item.location || "Location not available",
    company: item.company || item.companyName || "Company",
    match: Number.isFinite(Number(score)) ? Number(score) : null,
    reasoning: item.reasoning || item.recommendation_note,
    skillsMatched: item.skillsMatched || item.match_reasons || [],
    skillsMissing: item.skillsMissing || item.missing_skills || [],
    type: item.workDuration ? toRoleType(item.workDuration) : "Open",
    posted: item.createdAt ? getRelativeTime(item.createdAt) : "Recently",
    raw: item,
  };
};

const sortJobs = (jobs, sortBy) => {
  const sorted = [...jobs];

  switch (sortBy) {
    case "oldest":
      return sorted.sort(
        (a, b) =>
          new Date(a.raw?.createdAt || 0).getTime() -
          new Date(b.raw?.createdAt || 0).getTime(),
      );
    case "salary_desc":
      return sorted.sort((a, b) => (b.raw?.salary || 0) - (a.raw?.salary || 0));
    case "salary_asc":
      return sorted.sort((a, b) => (a.raw?.salary || 0) - (b.raw?.salary || 0));
    case "relevance":
      return sorted.sort((a, b) => (b.match || 0) - (a.match || 0));
    case "newest":
    default:
      return sorted.sort(
        (a, b) =>
          new Date(b.raw?.createdAt || 0).getTime() -
          new Date(a.raw?.createdAt || 0).getTime(),
      );
  }
};

export default function Jobs() {
  const [mode, setMode] = useState("browse");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [applyJobId, setApplyJobId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    workSite: null,
    workDuration: null,
    minSalary: null,
    maxSalary: null,
    minExperience: null,
  });

  const [selectedCvId, setSelectedCvId] = useState("");
  const [cvJobs, setCvJobs] = useState([]);
  const [cvLoading, setCvLoading] = useState(false);
  const [cvUploading, setCvUploading] = useState(false);
  const [cvError, setCvError] = useState("");

  const debouncedQuery = useDebounce(query, 250);
  const hasActiveFilters = Object.values(filters).some((value) => value !== null && value !== "");
  const fileValidationErrorRef = useRef("");

  const {
    data: jobs = [],
    loading: jobsLoading,
    error: jobsError,
    refetch: refetchJobs,
  } = useFetch(
    async () => {
      const res = await api.get("/jobs");
      const internalJobs = (res.data?.data?.jobs || []).map((job, index) => normalizeJob(job, index));
      const externalJobs = (res.data?.data?.externalJobs || []).map((job, index) => normalizeJob(job, internalJobs.length + index));
      return [...internalJobs, ...externalJobs];
    },
    { initialData: [] },
  );

  const {
    data: cvs = [],
    refetch: refetchCvs,
  } = useFetch(
    async () => {
      const res = await api.get("/cvs");
      return res.data?.data?.cvs || [];
    },
    { initialData: [] },
  );

  const browseFilteredJobs = useMemo(() => {
    let list = [...jobs];

    if (debouncedQuery) {
      const q = debouncedQuery.toLowerCase();
      list = list.filter(
        (job) =>
          job.title.toLowerCase().includes(q) ||
          job.company.toLowerCase().includes(q) ||
          job.location.toLowerCase().includes(q),
      );
    }

    if (filters.workSite) {
      list = list.filter((job) => job.raw?.workSite === filters.workSite);
    }

    if (filters.workDuration) {
      list = list.filter((job) => job.raw?.workDuration === filters.workDuration);
    }

    if (filters.minSalary !== null) {
      list = list.filter((job) => Number(job.raw?.salary || 0) >= Number(filters.minSalary));
    }

    if (filters.maxSalary !== null) {
      list = list.filter((job) => Number(job.raw?.salary || 0) <= Number(filters.maxSalary));
    }

    if (filters.minExperience !== null) {
      list = list.filter(
        (job) => Number(job.raw?.yearsOfExperience || 0) >= Number(filters.minExperience),
      );
    }

    return sortJobs(list, sortBy);
  }, [debouncedQuery, filters, jobs, sortBy]);

  const cvFilteredJobs = useMemo(() => {
    let list = [...cvJobs];
    if (debouncedQuery) {
      const q = debouncedQuery.toLowerCase();
      list = list.filter(
        (job) =>
          job.title.toLowerCase().includes(q) ||
          job.company.toLowerCase().includes(q) ||
          job.location.toLowerCase().includes(q),
      );
    }
    return sortJobs(list, sortBy);
  }, [cvJobs, debouncedQuery, sortBy]);

  const totalPages = Math.max(1, Math.ceil(browseFilteredJobs.length / PAGE_SIZE));
  const browsePageJobs = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return browseFilteredJobs.slice(start, start + PAGE_SIZE);
  }, [browseFilteredJobs, currentPage]);

  const visibleJobs = mode === "browse" ? browsePageJobs : cvFilteredJobs;
  const selectedJob = visibleJobs.find((job) => job.id === selectedJobId) || null;

  const stats = useMemo(() => {
    const recentCutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recent = jobs.filter((job) => {
      const created = new Date(job.raw?.createdAt || 0).getTime();
      return Number.isFinite(created) && created >= recentCutoff;
    }).length;

    return [
      { label: "Open", value: jobs.length, color: "var(--color-primary)" },
      { label: "New (7d)", value: recent, color: "var(--color-warning)" },
      {
        label: mode === "browse" ? "Visible" : "Matched",
        value: mode === "browse" ? browseFilteredJobs.length : cvFilteredJobs.length,
        color: "var(--color-success)",
      },
    ];
  }, [browseFilteredJobs.length, cvFilteredJobs.length, jobs, mode]);

  const resetSelectionAndPage = () => {
    setSelectedJobId(null);
    setCurrentPage(1);
  };

  const handleModeChange = (nextMode) => {
    setMode(nextMode);
    setQuery("");
    resetSelectionAndPage();
  };

  const clearFilters = () => {
    setFilters({
      workSite: null,
      workDuration: null,
      minSalary: null,
      maxSalary: null,
      minExperience: null,
    });
    setCurrentPage(1);
  };

  const handleApply = (job) => {
    if (!job?.id) return;

    const sourceUrl = job.externalUrl || job.raw?.externalUrl || job.raw?.url;
    if (sourceUrl) {
      window.open(sourceUrl, "_blank", "noopener,noreferrer");
      return;
    }

    setApplyJobId(job.id);
  };

  const handleMatchWithCv = async () => {
    if (!selectedCvId) {
      setCvError("Please select a CV first.");
      return;
    }

    setCvLoading(true);
    setCvError("");

    try {
      const res = await api.post(`/cvs/${selectedCvId}/recommend-jobs`);
      const match = res.data?.data?.match;
      const normalized = (Array.isArray(match) ? match : [match])
        .filter(Boolean)
        .map(normalizeCvMatch)
        .sort((a, b) => (b.match || 0) - (a.match || 0));
      setCvJobs(normalized);
      setSelectedJobId(normalized[0]?.id || null);
    } catch (err) {
      setCvError(err?.response?.data?.message || "Unable to match jobs with selected CV.");
    } finally {
      setCvLoading(false);
    }
  };

  const handleUploadAndMatch = async (file) => {
    setCvUploading(true);
    setCvError("");

    try {
      const formData = new FormData();
      formData.append("cvFile", file);

      const uploadRes = await api.post("/cvs/upload/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const createdCv = uploadRes.data?.data?.cv;
      if (!createdCv?._id) {
        throw new Error("Uploaded CV could not be saved.");
      }

      await refetchCvs();
      setSelectedCvId(createdCv._id);

      const matchRes = await api.post(`/cvs/${createdCv._id}/recommend-jobs`);
      const match = matchRes.data?.data?.match;
      const normalized = (Array.isArray(match) ? match : [match])
        .filter(Boolean)
        .map(normalizeCvMatch)
        .sort((a, b) => (b.match || 0) - (a.match || 0));
      setCvJobs(normalized);
      setSelectedJobId(normalized[0]?.id || null);
    } catch (err) {
      setCvError(err?.response?.data?.message || err?.message || "Unable to upload CV and match jobs.");
    } finally {
      setCvUploading(false);
    }
  };

  const resultCount = mode === "browse" ? browseFilteredJobs.length : cvFilteredJobs.length;

  return (
    <div className="min-h-screen bg-[var(--jd-bg)] text-[var(--jd-text-primary)]">
      <div className="dashboard-nav-area">
        <DashboardNav role="employee" />
      </div>

      <div className="dashboard-shell jd-shell py-8 lg:py-10">
        <div className="jd-hero mb-6 lg:mb-8 space-y-6">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="space-y-4">
              <span className="jd-hero-label">
                <Sparkles size={14} />
                Job Discovery
              </span>
              <h1 className="jd-hero-title text-4xl lg:text-5xl font-bold">Find jobs with structure.</h1>
              <p className="jd-hero-copy text-sm">
                Browse open roles or match them to a CV. The layout is tuned for fast scanning, sharp hierarchy, and direct action.
              </p>
            </div>

            <div className="jd-surface-stack min-w-0 xl:max-w-md">
              <p className="jd-section-title mb-3">At a glance</p>
              <div className="jd-meta-grid">
                {stats.map((stat) => (
                  <div key={stat.label} className="jd-stat-card">
                    <p className="jd-stat-label">{stat.label}</p>
                    <p className="jd-stat-value">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <JobDiscoveryHeader mode={mode} onModeChange={handleModeChange} resultCount={resultCount} />

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(360px,420px)] gap-5 items-start">
          <section className="jd-panel">
            <div className="space-y-4">
              <JobSearchBar value={query} onChange={setQuery} />

              {mode === "browse" ? (
                <>
                  <JobFiltersPanel
                    filters={filters}
                    onFilterChange={(nextFilters) => {
                      setFilters(nextFilters);
                      setCurrentPage(1);
                    }}
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
                  description={jobsError?.response?.data?.message || "Unable to load jobs."}
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
                  title={mode === "browse" ? "No jobs match current filters" : "No matches yet"}
                  description={
                    mode === "browse"
                      ? "Try a broader search term or clear filters."
                      : "Select a CV or upload a PDF to get personalized job matches."
                  }
                  action={mode === "browse" && hasActiveFilters ? "Clear Filters" : undefined}
                  onAction={mode === "browse" && hasActiveFilters ? clearFilters : undefined}
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

              {mode === "browse" && !jobsLoading && !jobsError && browseFilteredJobs.length > 0 && (
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

          <aside className="min-h-[420px]">
            <JobDetailsPanel job={selectedJob} onApply={handleApply} onClose={() => setSelectedJobId(null)} />
          </aside>
        </div>
      </div>

      {applyJobId && <ApplyJobModal jobId={applyJobId} onClose={() => setApplyJobId(null)} />}
    </div>
  );
}
