import React, { useMemo, useRef, useState } from "react";
import { useDebounce } from "@uidotdev/usehooks";
import DashboardNav from "../../../components/shared/DashboardNav";
import api from "../../../services/api";
import useFetch from "../../../hooks/useFetch";
import { getRelativeTime } from "../../../utils/dateFormatter";
import ApplyJobModal from "../apply-job";
import { JobDiscoveryHeader } from "../../../components/employee/job-discovery";
import JobCard from "./components/JobCard";
import JobsList from "./components/JobsList";

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
    externalUrl: item.externalUrl || "",
    sourceName: item.sourceName || "",
    isExternal: !!item.isExternal,
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

  const handleFilterChange = (nextFilters) => {
    setFilters(nextFilters);
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
      const internal = (res.data?.data?.internalMatches || []).map(normalizeCvMatch);
      const external = (res.data?.data?.externalMatches || []).map(normalizeCvMatch);
      
      const combined = [...internal];
      if (internal.length > 0 && external.length > 0) {
        combined.push({ isSeparator: true });
      }
      combined.push(...external);

      setCvJobs(combined);
      setSelectedJobId(internal[0]?.id || external[0]?.id || null);
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
      const internal = (matchRes.data?.data?.internalMatches || []).map(normalizeCvMatch);
      const external = (matchRes.data?.data?.externalMatches || []).map(normalizeCvMatch);
      
      const combined = [...internal];
      if (internal.length > 0 && external.length > 0) {
        combined.push({ isSeparator: true });
      }
      combined.push(...external);

      setCvJobs(combined);
      setSelectedJobId(internal[0]?.id || external[0]?.id || null);
    } catch (err) {
      setCvError(err?.response?.data?.message || err?.message || "Unable to upload CV and match jobs.");
    } finally {
      setCvUploading(false);
    }
  };

  const resultCount = mode === "browse" ? browseFilteredJobs.length : cvFilteredJobs.length;

  return (
    <div className="min-h-screen bg-[var(--nm-bg)] text-[var(--nm-text-primary)]">
      <div className="dashboard-nav-area">
        <DashboardNav role="employee" />
      </div>

      <div className="dashboard-shell jd-shell py-8 lg:py-10">
        <JobCard stats={stats} />

        <JobDiscoveryHeader mode={mode} onModeChange={handleModeChange} resultCount={resultCount} />

        <JobsList
          mode={mode}
          query={query}
          setQuery={setQuery}
          filters={filters}
          onFilterChange={handleFilterChange}
          clearFilters={clearFilters}
          filtersOpen={filtersOpen}
          setFiltersOpen={setFiltersOpen}
          sortBy={sortBy}
          setSortBy={setSortBy}
          browseFilteredJobs={browseFilteredJobs}
          cvFilteredJobs={cvFilteredJobs}
          jobsLoading={jobsLoading}
          jobsError={jobsError}
          refetchJobs={refetchJobs}
          visibleJobs={visibleJobs}
          selectedJobId={selectedJobId}
          setSelectedJobId={setSelectedJobId}
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
          cvs={cvs}
          selectedCvId={selectedCvId}
          setSelectedCvId={setSelectedCvId}
          handleMatchWithCv={handleMatchWithCv}
          handleUploadAndMatch={handleUploadAndMatch}
          cvLoading={cvLoading}
          cvUploading={cvUploading}
          cvError={cvError}
          setCvError={setCvError}
          fileValidationErrorRef={fileValidationErrorRef}
          hasActiveFilters={hasActiveFilters}
          selectedJob={selectedJob}
          onApply={handleApply}
          onCloseJob={() => setSelectedJobId(null)}
        />
      </div>

      {applyJobId && <ApplyJobModal jobId={applyJobId} onClose={() => setApplyJobId(null)} />}
    </div>
  );
}
