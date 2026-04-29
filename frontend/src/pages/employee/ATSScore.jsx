import React, { useState } from "react";
import { BarChart3 } from "lucide-react";
import DashboardNav from "../../components/shared/DashboardNav";
import useFetch from "../../hooks/useFetch";
import api from "../../services/api";
import CVSelector from "../../components/employee/ats-score/CVSelector";
import ATSResults from "../../components/employee/ats-score/ATSResults";

export default function ATSScore() {
  const [selectedCvId, setSelectedCvId] = useState(null);
  const [atsResult, setAtsResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    data: cvs = [],
    loading: cvLoading,
    error: cvFetchError,
  } = useFetch(
    async () => {
      const res = await api.get("/cvs");
      return res.data?.data?.cvs || [];
    },
    { initialData: [] },
  );

  const handleAnalyze = async (cvId) => {
    setLoading(true);
    setSelectedCvId(cvId);
    setError("");
    setAtsResult(null);

    try {
      const res = await api.post("/applications/analyze-ats", { cvId });
      setAtsResult(res.data?.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to analyze CV. Please try again.",
      );
      setSelectedCvId(null);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToSelector = () => {
    setAtsResult(null);
    setSelectedCvId(null);
    setError("");
  };

  // Calculate Average Score from CVs that have an atsScore
  const scoredCvs = cvs.filter(cv => cv.atsScore != null);
  const averageScore = scoredCvs.length > 0 
    ? Math.round(scoredCvs.reduce((acc, cv) => acc + cv.atsScore, 0) / scoredCvs.length) + "%"
    : "—";

  return (
    <div className="min-h-screen bg-[var(--nm-bg)] text-[var(--nm-text-primary)]">
      <div className="dashboard-nav-area">
        <DashboardNav role="employee" />
      </div>

      <div className="dashboard-shell jd-shell py-8 lg:py-10">

        {(error || cvFetchError) && (
          <div
            className="mb-8 jd-panel bg-[var(--nm-error-surface)] border-[var(--nm-error)] p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[var(--nm-error)] animate-pulse" />
              <p className="font-mono text-sm text-[var(--nm-error)] m-0 font-bold uppercase">
                {error ||
                  cvFetchError?.response?.data?.message ||
                  "System error: Unable to load data."}
              </p>
            </div>
          </div>
        )}

        {/* Content Section */}
        <div className="mt-8">
          {atsResult ? (
            <ATSResults result={atsResult} onBack={handleBackToSelector} />
          ) : (
            <CVSelector
              cvs={cvs}
              loading={cvLoading || loading}
              analyzingId={loading ? selectedCvId : null}
              onAnalyze={handleAnalyze}
            />
          )}
        </div>
      </div>
    </div>
  );
}
