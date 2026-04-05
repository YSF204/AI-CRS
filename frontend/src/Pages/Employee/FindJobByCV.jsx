import React, { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Search, Upload, ArrowRight } from "lucide-react";
import DashboardNav from "../../components/shared/DashboardNav";
import StatsBar from "../../components/shared/StatsBar";
import api from "../../services/api";
import useFetch from "../../hooks/useFetch";

const CV_SEARCH_MODES = {
  EXISTING: "existing",
  UPLOAD: "upload",
};

export default function FindJobByCV() {
  const navigate = useNavigate();
  const [mode, setMode] = useState(CV_SEARCH_MODES.EXISTING);
  const [selectedCvId, setSelectedCvId] = useState("");
  const [jobs, setJobs] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
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

  const stats = useMemo(() => {
    const safeCvs = Array.isArray(cvs) ? cvs : [];
    return [
      { label: "Saved CVs", value: safeCvs.length, color: "var(--blue)" },
      {
        label: "Upload Mode",
        value: mode === CV_SEARCH_MODES.UPLOAD ? 1 : 0,
        color: "var(--yellow)",
      },
      {
        label: "Found Jobs",
        value: jobs ? (Array.isArray(jobs) ? jobs.length : 1) : 0,
        color: "var(--mint)",
      },
    ];
  }, [cvs, mode, jobs]);

  const setPageError = (err, fallback) =>
    setError(err?.response?.data?.message || err?.message || fallback);

  const handleSelectMode = (selected) => {
    setMode(selected);
    setError("");
    setJobs(null);
  };

  const handleFindWithExisting = async () => {
    if (!selectedCvId) {
      setError("Please select a CV first.");
      return;
    }

    setLoading(true);
    setError("");
    setJobs(null);

    try {
      const res = await api.post(`/cvs/${selectedCvId}/recommend-jobs`);
      const match = res.data?.data?.match;
      setJobs(match || []);
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
    setJobs(null);

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
      setMode(CV_SEARCH_MODES.EXISTING);

      const matchRes = await api.post(`/cvs/${createdCv._id}/recommend-jobs`);
      const match = matchRes.data?.data?.match;
      setJobs(match || []);
    } catch (err) {
      setPageError(err, "Unable to upload the PDF and search jobs.");
    } finally {
      setUploading(false);
    }
  };

  const displayJobs = () => {
    if (!jobs || (Array.isArray(jobs) && jobs.length === 0)) {
      return (
        <div className="brutal-card p-8 text-center bg-(--card-bg)">
          <p className="font-mono text-sm text-(--fg-muted)">
            No job matches were found yet.
          </p>
        </div>
      );
    }

    const items = Array.isArray(jobs) ? jobs : [jobs];

    return (
      <div className="grid grid-cols-1 gap-5">
        {items.map((item, index) => (
          <div
            key={item.jobId || item._id || index}
            className="brutal-card p-6 bg-(--card-bg) border-4 border-(--border-color) cursor-pointer hover:border-black transition-all"
            onClick={() => navigate(`/employee/apply-job/${item.jobId}`)}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-['Space_Grotesk'] font-bold text-xl uppercase mb-1">
                  {item.position ||
                    item.jobTitle ||
                    item.title ||
                    "Matched Job"}
                </h2>
                <p className="font-mono text-sm text-(--fg-muted)">
                  {item.workSite || item.location || "Location not available"}
                </p>
              </div>
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
              <div>
                <p className="font-bold uppercase text-xs tracking-[0.2em] text-(--fg-muted)">
                  Missing Skills
                </p>
                <p className="font-mono text-sm text-(--coral)">
                  {item.skillsMissing.join(", ")}
                </p>
              </div>
            )}
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
                Choose an existing CV or upload a PDF, then search open jobs
                tailored to that resume.
              </p>
            </div>
            <button
              type="button"
              className="brutal-btn px-6 py-3 font-bold flex items-center gap-2"
              style={{ background: "var(--yellow)", color: "#0a0a0a" }}
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

        <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
          <div className="space-y-6">
            <div className="brutal-card p-6 border-4 border-black bg-(--card-bg)">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-['Space_Grotesk'] font-bold uppercase text-lg">
                  Search Mode
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <button
                  type="button"
                  className={`brutal-btn px-5 py-4 text-left ${
                    mode === CV_SEARCH_MODES.EXISTING
                      ? "border-black bg-(--yellow)"
                      : "border-(--border-color) bg-(--card-bg)"
                  }`}
                  onClick={() => handleSelectMode(CV_SEARCH_MODES.EXISTING)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold uppercase">Existing CV</span>
                    <span className="font-mono text-xs text-(--fg-muted)">
                      Select one of your saved resumes
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  className={`brutal-btn px-5 py-4 text-left ${
                    mode === CV_SEARCH_MODES.UPLOAD
                      ? "border-black bg-(--teal)"
                      : "border-(--border-color) bg-(--card-bg)"
                  }`}
                  onClick={() => handleSelectMode(CV_SEARCH_MODES.UPLOAD)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold uppercase">Upload PDF</span>
                    <span className="font-mono text-xs text-(--fg-muted)">
                      Upload a new resume and search jobs
                    </span>
                  </div>
                </button>
              </div>
            </div>

            <div className="brutal-card p-6 border-4 border-black bg-(--card-bg)">
              <h2 className="font-['Space_Grotesk'] font-bold uppercase text-lg mb-4">
                Quick Actions
              </h2>
              {mode === CV_SEARCH_MODES.EXISTING ? (
                <div className="space-y-4">
                  <select
                    value={selectedCvId}
                    onChange={(e) => setSelectedCvId(e.target.value)}
                    className="brutal-card w-full px-4 py-3 bg-(--card-bg) font-mono text-sm"
                    disabled={cvsLoading || cvs.length === 0}
                  >
                    <option value="">Select a CV</option>
                    {cvs.map((cv) => (
                      <option key={cv._id} value={cv._id}>
                        {cv.jobTitle || `CV ${cv._id.substring(0, 6)}`}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleFindWithExisting}
                    disabled={!selectedCvId || loading}
                    className="brutal-btn px-5 py-3 font-bold w-full"
                    style={{ background: "var(--yellow)", color: "#0a0a0a" }}
                  >
                    {loading ? "Searching..." : "Find jobs with selected CV"}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleUploadAndFind}
                    className="hidden"
                    disabled={uploading}
                  />
                  <button
                    type="button"
                    className="brutal-btn px-5 py-3 font-bold w-full"
                    style={{ background: "var(--teal)", color: "#0a0a0a" }}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? "Uploading..." : "Upload PDF and find jobs"}
                  </button>
                  <p className="font-mono text-sm text-(--fg-muted)">
                    Upload a new PDF resume and automatically search open roles
                    that fit.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="brutal-card p-6 border-4 border-black bg-(--card-bg)">
              <h2 className="font-['Space_Grotesk'] font-bold uppercase text-lg mb-4">
                Results
              </h2>
              {loading || uploading ? (
                <div className="font-mono text-sm text-(--fg-muted)">
                  Searching for job matches...
                </div>
              ) : (
                displayJobs()
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
