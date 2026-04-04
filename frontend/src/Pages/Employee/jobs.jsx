import React, { useMemo, useState } from "react";
import { Briefcase, Search, ChevronRight } from "lucide-react";
import { useDebounce } from "@uidotdev/usehooks";
import { useNavigate } from "react-router-dom";
import DashboardNav from "../../components/shared/DashboardNav";
import StatsBar from "../../components/shared/StatsBar";
import JobItem from "../../components/Employee/JobItem";
import api from "../../services/api";
import useFetch from "../../hooks/useFetch";
import { getRelativeTime } from "../../utils/dateFormatter";

const toRoleType = (value) => {
  if (value === "FULL_TIME") return "Full-time";
  if (value === "PART_TIME") return "Part-time";
  if (value === "CONTRACT") return "Contract";
  if (value === "INTERNSHIP") return "Internship";
  return value || "Open";
};

export default function Jobs() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [selectedJobId, setSelectedJobId] = useState(null);
  const debouncedQuery = useDebounce(query, 250);

  const {
    data: jobs = [],
    loading,
    error,
  } = useFetch(
    async () => {
      const res = await api.get("/jobs");
      return (res.data?.data?.jobs || []).map((job) => ({
        id: job._id,
        title: job.position,
        company: job.employerId?.company?.name || "Company",
        location: job.workSite?.replace("_", " ") || "N/A",
        type: toRoleType(job.workDuration),
        posted: getRelativeTime(job.createdAt),
        raw: job,
      }));
    },
    { initialData: [] },
  );

  const filtered = jobs.filter(
    (j) =>
      j.title.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
      j.company.toLowerCase().includes(debouncedQuery.toLowerCase()),
  );

  const selectedJob = jobs.find((j) => j.id === selectedJobId);

  const stats = useMemo(() => {
    const recentCutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recent = jobs.filter((job) => {
      const timestamp = new Date(job.raw?.createdAt || 0).getTime();
      return Number.isFinite(timestamp) && timestamp >= recentCutoff;
    }).length;
    return [
      { label: "Open", value: jobs.length, color: "var(--teal)" },
      { label: "New (7d)", value: recent, color: "var(--yellow)" },
      { label: "Visible", value: filtered.length, color: "var(--coral)" },
    ];
  }, [jobs, filtered.length]);

  const handleApply = (job) => {
    navigate(`/employee/apply-job/${job.id}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--fg)]">
      <div className="flex-shrink-0 p-8">
        <DashboardNav role="employee" />

        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-['Space_Grotesk'] uppercase tracking-tight flex items-center gap-3">
              <Briefcase size={28} className="text-[var(--teal)]" />
              Find Jobs
            </h1>
            <p className="font-mono text-sm text-[var(--fg-muted)] mt-1">
              {filtered.length} positions available
            </p>
          </div>

          <div className="flex items-center gap-2 brutal-card px-4 py-2.5 bg-[var(--card-bg)] w-full sm:w-64">
            <Search size={15} className="text-[var(--fg-muted)] shrink-0" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-transparent outline-none font-mono text-sm w-full placeholder:text-[var(--fg-muted)]"
            />
          </div>
        </div>

        <StatsBar stats={stats} />
      </div>

      {/* Main Content - Split Screen */}
      <div className="flex-1 flex overflow-hidden px-8 pb-8 gap-4">
        {/* Left: Job List */}
        <div
          className={`${selectedJobId ? "flex-shrink-0 w-full md:w-96" : "w-full"} overflow-y-auto transition-all duration-500`}
        >
          {error && (
            <div className="mb-4 brutal-card p-4 bg-[var(--coral)] text-black font-mono text-sm">
              {error.response?.data?.message || "Unable to load jobs."}
            </div>
          )}

          {loading ? (
            <div className="brutal-card p-8 bg-[var(--card-bg)] text-center font-mono text-[var(--fg-muted)]">
              Loading jobs...
            </div>
          ) : filtered.length === 0 ? (
            <div className="brutal-card p-8 bg-[var(--card-bg)] text-center font-mono text-[var(--fg-muted)]">
              No jobs matched your search.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filtered.map((job) => (
                <div
                  key={job.id}
                  onClick={() => {
                    // Toggle: if clicked job is already selected, deselect it; otherwise select it
                    if (selectedJobId === job.id) {
                      setSelectedJobId(null);
                    } else {
                      setSelectedJobId(job.id);
                    }
                  }}
                  className={`brutal-card p-4 cursor-pointer transition-all ${
                    selectedJobId === job.id
                      ? "bg-[var(--yellow)] text-black border-4 border-black"
                      : "bg-[var(--card-bg)] hover:border-[var(--yellow)]"
                  }`}
                >
                  <p
                    className={`font-bold font-['Space_Grotesk'] text-sm uppercase tracking-tight mb-1 ${
                      selectedJobId === job.id
                        ? "text-black"
                        : "text-[var(--fg)]"
                    }`}
                  >
                    {job.title}
                  </p>
                  <p
                    className={`font-mono text-xs ${
                      selectedJobId === job.id
                        ? "text-black opacity-75"
                        : "text-[var(--fg-muted)]"
                    }`}
                  >
                    {job.company}
                  </p>
                  <p
                    className={`font-mono text-xs mt-2 ${
                      selectedJobId === job.id
                        ? "text-black opacity-60"
                        : "text-[var(--fg-muted)]"
                    }`}
                  >
                    {job.posted}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Job Details */}
        <div
          className={`${selectedJobId ? "flex-1 flex opacity-100" : "hidden opacity-0 absolute"} overflow-hidden transition-all duration-1000`}
        >
          {selectedJob ? (
            <div className="w-full brutal-card bg-[var(--card-bg)] p-6 overflow-y-auto flex flex-col">
              {/* Header */}
              <div className="mb-6 pb-6 border-b-4 border-[var(--border-color)]">
                <h2 className="text-2xl font-bold font-['Space_Grotesk'] uppercase tracking-tight text-[var(--fg)]">
                  {selectedJob.title}
                </h2>
                <p className="font-mono text-sm text-[var(--fg-muted)] mt-1">
                  {selectedJob.company} • {selectedJob.location}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="px-3 py-1 text-xs font-bold font-mono border-2 border-black bg-[var(--yellow)] text-black">
                    {selectedJob.type}
                  </span>
                  <span className="px-3 py-1 text-xs font-mono bg-[var(--teal)] text-black font-bold">
                    $
                    {selectedJob.raw?.salary?.toLocaleString() ||
                      "Not specified"}
                  </span>
                  <span className="px-3 py-1 text-xs font-mono bg-[var(--coral)] text-black font-bold">
                    {selectedJob.posted}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="font-['Space_Grotesk'] font-bold text-sm uppercase tracking-wider mb-2 text-[var(--fg)]">
                  Job Description
                </h3>
                <p className="font-mono text-sm leading-relaxed text-[var(--fg-muted)]">
                  {selectedJob.raw?.description}
                </p>
              </div>

              {/* Requirements */}
              <div className="mb-6">
                <h3 className="font-['Space_Grotesk'] font-bold text-sm uppercase tracking-wider mb-2 text-[var(--fg)]">
                  Requirements
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="font-mono text-xs font-bold text-[var(--fg-muted)] mb-1">
                      Years of Experience
                    </p>
                    <p className="font-mono text-sm text-[var(--fg)]">
                      {selectedJob.raw?.yearsOfExperience || 0}+ years
                    </p>
                  </div>

                  {selectedJob.raw?.technicalSkills?.length > 0 && (
                    <div>
                      <p className="font-mono text-xs font-bold text-[var(--fg-muted)] mb-1">
                        Technical Skills
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedJob.raw.technicalSkills.map((skill, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 text-xs font-mono bg-[var(--teal)] text-black rounded"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedJob.raw?.softSkills?.length > 0 && (
                    <div>
                      <p className="font-mono text-xs font-bold text-[var(--fg-muted)] mb-1">
                        Soft Skills
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedJob.raw.softSkills.map((skill, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 text-xs font-mono bg-[var(--mint)] text-black rounded"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedJob.raw?.language?.length > 0 && (
                    <div>
                      <p className="font-mono text-xs font-bold text-[var(--fg-muted)] mb-1">
                        Languages
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedJob.raw.language.map((lang, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 text-xs font-mono bg-[var(--yellow)] text-black rounded"
                          >
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Details */}
              <div className="mb-6">
                <h3 className="font-['Space_Grotesk'] font-bold text-sm uppercase tracking-wider mb-2 text-[var(--fg)]">
                  Details
                </h3>
                <div className="space-y-2 font-mono text-sm text-[var(--fg-muted)]">
                  <p>
                    <span className="font-bold text-[var(--fg)]">
                      Work Site:
                    </span>{" "}
                    {selectedJob.raw?.workSite || "N/A"}
                  </p>
                  <p>
                    <span className="font-bold text-[var(--fg)]">
                      Duration:
                    </span>{" "}
                    {selectedJob.raw?.workDuration || "N/A"}
                  </p>
                </div>
              </div>

              {/* Apply Button */}
              <div className="mt-auto flex gap-2">
                <button
                  onClick={() => handleApply(selectedJob)}
                  className="flex-1 brutal-btn px-4 py-3 font-bold uppercase tracking-wider flex items-center justify-center gap-2"
                  style={{ background: "var(--yellow)", color: "#0a0a0a" }}
                >
                  <ChevronRight size={16} />
                  Apply Now
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full brutal-card bg-[var(--card-bg)] p-8 flex items-center justify-center">
              <p className="font-mono text-[var(--fg-muted)] text-center">
                Select a job to view details and apply
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
