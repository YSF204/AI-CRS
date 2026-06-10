import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText } from "lucide-react";
import DashboardNav from "../../../components/shared/DashboardNav";
import ActionButton from "../../../components/shared/ActionButton";
import api from "../../../services/api";
import useFetch from "../../../hooks/useFetch";
import { useTranslation } from "../../../context/LanguageContext";
import CVSelector from "./components/CVSelector";
import MatchResults from "./components/MatchResults";

export default function FindJobByCV() {
  const navigate = useNavigate();
  const { t } = useTranslation();
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
          title: item.position || item.jobTitle || item.title || t("employeeJobs.untitledCv"),
          location: item.workSite || item.location || t("employeeJobs.locationNotAvailable", {}, "Location not available"),
          company: item.company || item.companyName || t("employer.company", {}, "Company"),
          match: Number.isFinite(Number(score)) ? Number(score) : null,
          reasoning: item.reasoning || item.recommendation_note,
          skillsMatched: item.skillsMatched || item.match_reasons || [],
          skillsMissing: item.skillsMissing || item.missing_skills || [],
          isExternal: !!item.isExternal,
          externalUrl: item.externalUrl || item.raw?.externalUrl || item.raw?.url || "",
        };
      })
      .sort((a, b) => (b.match ?? -1) - (a.match ?? -1));
  }, [jobs, t]);

  const stats = useMemo(() => {
    const safeCvs = Array.isArray(cvs) ? cvs : [];
    return [
      {
        label: t("employee.savedCvs"),
        value: safeCvs.length,
        color: "var(--color-primary)",
      },
      {
        label: t("findJobByCv.foundJobs", {}, "Found Jobs"),
        value: normalizedJobs.length,
        color: "var(--color-success)",
      },
      {
        label: t("findJobByCv.results"),
        value: jobs ? t("employeeJobs.jobsFound", { count: normalizedJobs.length }) : "-",
        color: "var(--color-warning)",
      },
    ];
  }, [cvs, normalizedJobs.length, jobs, t]);

  const setPageError = (err, fallback) =>
    setError(err?.response?.data?.message || err?.message || fallback);

  const handleFindWithExisting = async () => {
    if (!selectedCvId) {
      setError(t("findJobByCv.selectACv"));
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
      setPageError(err, t("findJobByCv.unableToFindJobs", {}, "Unable to find jobs with the selected CV."));
    } finally {
      setLoading(false);
    }
  };

  const handleUploadAndFind = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError(t("findJobByCv.uploadPdfOnly", {}, "Upload a PDF file only."));
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
        throw new Error(t("findJobByCv.uploadedCvNotSaved", {}, "Uploaded CV could not be saved."));
      }

      await refreshCvs();
      setSelectedCvId(createdCv._id);

      const matchRes = await api.post(`/cvs/${createdCv._id}/recommend-jobs`);
      const match = matchRes.data?.data?.match;
      setJobs(match || []);
      setLastAction("upload");
    } catch (err) {
      setPageError(err, t("findJobByCv.unableToUploadAndSearch", {}, "Unable to upload the PDF and search jobs."));
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

  return (
    <div className="min-h-screen bg-(--bg) text-(--fg)">
      <div className="dashboard-nav-area">
        <DashboardNav role="employee" />
      </div>

      <div className="dashboard-shell py-6">
        <div className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold font-['Space_Grotesk'] uppercase tracking-tight flex items-center gap-3">
                <FileText size={28} className="text-(--yellow)" />
                {t("findJobByCv.findJobsByCv")}
              </h1>
              <p className="font-mono text-sm text-(--fg-muted) mt-1 max-w-2xl">
                {t("findJobByCv.simplerFlow")}
              </p>
            </div>
            <ActionButton
              type="button"
              variant="prism"
              className="px-6 py-3 font-bold flex items-center gap-2"
              onClick={() => navigate("/employee/jobs")}
            >
              {t("findJobByCv.backToAllJobs")}
            </ActionButton>
          </div>
        </div>

        {(error || cvsError) && (
          <div className="mb-6 brutal-card p-4 bg-(--coral) text-black font-mono text-sm">
            {error ||
              cvsError?.response?.data?.message ||
              cvsError?.message ||
              t("findJobByCv.unableToLoadCvs")}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
          <CVSelector
            cvs={cvs}
            cvsLoading={cvsLoading}
            selectedCvId={selectedCvId}
            selectedCv={selectedCv}
            onCvChange={setSelectedCvId}
            loading={loading}
            uploading={uploading}
            onFindWithExisting={handleFindWithExisting}
            onUploadAndFind={handleUploadAndFind}
            fileInputRef={fileInputRef}
          />

          <MatchResults
            jobs={jobs}
            normalizedJobs={normalizedJobs}
            loading={loading}
            uploading={uploading}
            onClear={clearResults}
            onGoToJob={goToJob}
            onUploadClick={() => fileInputRef.current?.click()}
            onBrowseJobs={() => navigate("/employee/jobs")}
          />
        </div>
      </div>
    </div>
  );
}
