import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  Briefcase,
  ChevronRight,
  FileText,
  RefreshCw,
  Sparkles,
  Upload,
} from "lucide-react";
import DashboardNav from "../../components/shared/DashboardNav";
import StatsBar from "../../components/shared/StatsBar";
import api from "../../services/api";
import useFetch from "../../hooks/useFetch";

// No session caching - always start fresh on refresh
export default function FindJobByCV() {
  const navigate = useNavigate();
  const [selectedCvId, setSelectedCvId] = useState("");
  const [jobs, setJobs] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [lastAction, setLastAction] = useState("none");
  const fileInputRef = useRef(null);

  const {
    data: cvs = [],
    loading: cvsLoading,
    error: cvsError,
    refetch: refreshCvs,
  } = useFetch(
    async () => {
      const res = await api.get("/cvs");
      return res.data?.data?.cvs || [];
    },
    { initialData: [] },
  );

  useEffect(() => {
    if (!selectedCvId && Array.isArray(cvs) && cvs.length > 0) {
      setSelectedCvId(cvs[0]._id);
    }
  }, [cvs, selectedCvId]);

  const selectedCv = useMemo(
    () => cvs.find((cv) => cv._id === selectedCvId) || null,
    [cvs, selectedCvId],
  );

  const normalizedJobs = useMemo(() => {
    if (!jobs) return [];
    const items = Array.isArray(jobs) ? jobs : [jobs];

    return items
      .map((item, index) => {
        const rawId = item.jobId || item.job_id || item._id || item.id;
        const id = typeof rawId === "object" ? rawId?._id : rawId;
        const score =
          item.matchScore ?? item.relevance_score ?? item.relevanceScore;

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
        };
      })
      .sort((a, b) => (b.match ?? -1) - (a.match ?? -1));
  }, [jobs]);

  const stats = useMemo(() => {
    const safeCvs = Array.isArray(cvs) ? cvs : [];
    return [
      {
        label: "Saved CVs",
        value: safeCvs.length,
        color: "var(--color-primary)",
      },
      {
        label: "Found Jobs",
        value: normalizedJobs.length,
        color: "var(--color-success)",
      },
      {
        label: "Results",
        value: jobs ? `${normalizedJobs.length} jobs` : "-",
        color: "var(--color-warning)",
      },
    ];
  }, [cvs, normalizedJobs.length, jobs]);

  const setPageError = (err, fallback) =>
    setError(err?.response?.data?.message || err?.message || fallback);

  const handleFindWithExisting = async () => {
    if (!selectedCvId) {
      setError("Please select a CV first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await api.post(`/cvs/${selectedCvId}/recommend-jobs`);
      const match = res.data?.data?.match;
      setJobs(match || []);
      setLastAction("saved");
    } catch (err) {
      setPageError(err, "Unable to find jobs with the selected CV.");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadAndFind = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Upload a PDF file only.");
      return;
    }

    setUploading(true);
    setError("");

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

      await refreshCvs();
      setSelectedCvId(createdCv._id);

      const matchRes = await api.post(`/cvs/${createdCv._id}/recommend-jobs`);
      const match = matchRes.data?.data?.match;
      setJobs(match || []);
      setLastAction("upload");
    } catch (err) {
      setPageError(err, "Unable to upload the PDF and search jobs.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const goToJob = (jobId) => {
    if (!jobId) return;
    navigate(`/employee/jobs/${jobId}`, {
      state: { source: "find-job-by-cv" },
    });
  };

  const clearResults = () => {
    setJobs(null);
    setError("");
    setLastAction("none");
  };

  const renderResults = () => {
    if (!jobs) {
      return (
        <div className="brutal-card p-8 bg-(--card-bg) border-4 border-(--border-color)">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 shrink-0 border-2 border-black bg-(--yellow) flex items-center justify-center">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="font-['Space_Grotesk'] font-bold uppercase text-lg mb-1">
                Choose One, Then Search
              </p>
              <p className="font-mono text-sm text-(--fg-muted)">
                Pick a saved CV or upload a PDF. You do not need to switch
                modes.
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (normalizedJobs.length === 0) {
      return (
        <div className="brutal-card p-8 bg-(--card-bg) border-4 border-(--border-color)">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-(--coral) shrink-0" />
            <div>
              <p className="font-['Space_Grotesk'] font-bold uppercase text-lg mb-1">
                No Strong Matches Right Now
              </p>
              <p className="font-mono text-sm text-(--fg-muted)">
                Try another CV or upload a more complete one. You can also
                browse all open jobs.
              </p>
              <div className="flex flex-wrap gap-3 mt-4">
                <button
                  type="button"
                  className="brutal-btn px-4 py-2 font-bold"
                  style={{
                    background: "var(--color-primary)",
                    color: "var(--color-text-primary)",
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload another PDF
                </button>
                <button
                  type="button"
                  className="brutal-btn px-4 py-2 font-bold"
                  style={{
                    background: "var(--color-warning)",
                    color: "var(--color-text-primary)",
                  }}
                  onClick={() => navigate("/employee/jobs")}
                >
                  Browse all jobs
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-5">
        {normalizedJobs.map((item, index) => (
          <div
            key={item.key || index}
            className="brutal-card p-6 bg-(--card-bg) border-4 border-(--border-color) hover:border-black transition-all"
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h2 className="font-['Space_Grotesk'] font-bold text-xl uppercase mb-1">
                  {item.title}
                </h2>
                <p className="font-mono text-sm text-(--fg-muted)">
                  {item.company} • {item.location}
                </p>
              </div>
              {item.match !== null && (
                <div
                  className="brutal-card px-3 py-1 font-mono text-sm font-bold border-2 border-black whitespace-nowrap"
                  style={{
                    background:
                      item.match >= 80
                        ? "var(--color-success)"
                        : item.match >= 60
                          ? "var(--color-warning)"
                          : "var(--color-danger)",
                    color: "var(--color-text-primary)",
                  }}
                >
                  {item.match}% Match
                </div>
              )}
            </div>

            {item.reasoning && (
              <p className="font-mono text-sm text-(--fg) mb-4">
                {item.reasoning}
              </p>
            )}

            {item.skillsMatched?.length > 0 && (
              <div className="mb-3">
                <p className="font-bold uppercase text-xs tracking-[0.2em] text-(--fg-muted)">
                  Matched Skills
                </p>
                <p className="font-mono text-sm">
                  {item.skillsMatched.join(", ")}
                </p>
              </div>
            )}

            {item.skillsMissing?.length > 0 && (
              <div className="mb-4">
                <p className="font-bold uppercase text-xs tracking-[0.2em] text-(--fg-muted)">
                  Missing Skills
                </p>
                <p className="font-mono text-sm text-(--coral)">
                  {item.skillsMissing.join(", ")}
                </p>
              </div>
            )}

            <button
              type="button"
              className="brutal-btn px-4 py-2 font-bold inline-flex items-center gap-2"
              style={{
                background: "var(--color-primary)",
                color: "var(--color-text-primary)",
              }}
              onClick={() => goToJob(item.id)}
            >
              View & Apply
              <ChevronRight size={16} />
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen p-8 bg-(--bg) text-(--fg)">
      <div className="dashboard-shell">
        <DashboardNav role="employee" />

        <div className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold font-['Space_Grotesk'] uppercase tracking-tight flex items-center gap-3">
                <FileText size={28} className="text-(--yellow)" />
                Find Jobs By CV
              </h1>
              <p className="font-mono text-sm text-(--fg-muted) mt-1 max-w-2xl">
                A simpler flow: pick a saved CV or upload a PDF, then get
                matched jobs instantly.
              </p>
            </div>
            <button
              type="button"
              className="brutal-btn px-6 py-3 font-bold flex items-center gap-2"
              style={{
                background: "var(--color-warning)",
                color: "var(--color-text-primary)",
              }}
              onClick={() => navigate("/employee/jobs")}
            >
              Back to all jobs
              <ArrowRight size={18} />
            </button>
          </div>
        </div>

        <StatsBar stats={stats} />

        {(error || cvsError) && (
          <div className="mb-6 brutal-card p-4 bg-(--coral) text-black font-mono text-sm">
            {error ||
              cvsError?.response?.data?.message ||
              cvsError?.message ||
              "Unable to load your CVs."}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
          <div className="space-y-6">
            <div className="brutal-card p-6 border-4 border-black bg-(--card-bg)">
              <h2 className="font-['Space_Grotesk'] font-bold uppercase text-lg mb-4">
                Choose Resume Source
              </h2>

              <div className="space-y-5">
                <div className="brutal-card p-4 border-2 border-(--border-color) bg-(--bg)">
                  <p className="font-bold uppercase text-sm mb-3">
                    Use Saved CV
                  </p>
                  {cvsLoading ? (
                    <p className="font-mono text-sm text-(--fg-muted)">
                      Loading CVs...
                    </p>
                  ) : cvs.length === 0 ? (
                    <p className="font-mono text-sm text-(--coral)">
                      No CVs available. Create or upload one first.
                    </p>
                  ) : (
                    <>
                      <select
                        value={selectedCvId}
                        onChange={(e) => setSelectedCvId(e.target.value)}
                        className="w-full border-2 border-[var(--border-color)] bg-[var(--bg)] text-[var(--fg)] px-3 py-2 font-mono text-sm outline-none focus:border-[var(--yellow)]"
                      >
                        <option value="">Select a CV</option>
                        {cvs.map((cv) => (
                          <option key={cv._id} value={cv._id}>
                            {cv.jobTitle || `CV ${cv._id.substring(0, 6)}`}
                          </option>
                        ))}
                      </select>

                      {selectedCv && (
                        <p className="font-mono text-xs text-(--fg-muted) mt-2">
                          Selected: {selectedCv.jobTitle || "Untitled CV"}
                        </p>
                      )}
                    </>
                  )}

                  <button
                    type="button"
                    onClick={handleFindWithExisting}
                    disabled={!selectedCvId || loading || uploading}
                    className="mt-3 brutal-btn px-5 py-3 font-bold w-full inline-flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{ background: "var(--yellow)", color: "#0a0a0a" }}
                  >
                    {loading ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        Matching with selected CV...
                      </>
                    ) : (
                      "Find jobs with selected CV"
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-[2px] bg-(--border-color) flex-1" />
                  <span className="font-mono text-xs uppercase text-(--fg-muted)">
                    or
                  </span>
                  <div className="h-[2px] bg-(--border-color) flex-1" />
                </div>

                <div className="brutal-card p-4 border-2 border-(--border-color) bg-(--bg)">
                  <p className="font-bold uppercase text-sm mb-3">
                    Upload New PDF
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleUploadAndFind}
                    className="hidden"
                    disabled={uploading || loading}
                  />

                  <button
                    type="button"
                    className="brutal-btn px-5 py-5 font-bold w-full border-dashed border-4 inline-flex items-center justify-center gap-2"
                    style={{
                      background: "var(--color-primary)",
                      color: "var(--color-text-primary)",
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading || loading}
                  >
                    {uploading ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        Uploading and matching...
                      </>
                    ) : (
                      <>
                        <Upload size={16} />
                        Upload PDF and find jobs
                      </>
                    )}
                  </button>

                  <p className="font-mono text-xs text-(--fg-muted) mt-2">
                    Best when testing a new resume version quickly.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="brutal-card p-6 border-4 border-black bg-(--card-bg)">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h2 className="font-['Space_Grotesk'] font-bold uppercase text-lg inline-flex items-center gap-2">
                  <Briefcase size={18} />
                  Results
                </h2>
                {jobs && (
                  <button
                    type="button"
                    onClick={clearResults}
                    className="brutal-btn px-3 py-1 font-bold text-xs"
                    style={{ background: "var(--card-bg)", color: "var(--fg)" }}
                  >
                    Clear
                  </button>
                )}
              </div>

              {loading || uploading ? (
                <div className="brutal-card p-6 bg-(--bg) border-2 border-(--border-color) font-mono text-sm text-(--fg-muted) inline-flex items-center gap-2">
                  <RefreshCw size={16} className="animate-spin" />
                  Searching for job matches...
                </div>
              ) : (
                renderResults()
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
