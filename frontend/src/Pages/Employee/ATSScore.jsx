import React, { useState } from "react";
import { BarChart3 } from "lucide-react";
import DashboardNav from "../../components/shared/DashboardNav";
import useFetch from "../../hooks/useFetch";
import api from "../../services/api";
import CVSelector from "../../components/Employee/ATSScore/CVSelector";
import ATSResults from "../../components/Employee/ATSScore/ATSResults";

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

  const stats = [
    { label: "Total CVs", value: cvs.length, color: "var(--jd-primary)" },
    { label: "Average Score", value: "—", color: "var(--jd-warning)" },
    {
      label: "Latest Analysis",
      value: atsResult ? "Complete" : "—",
      color: "var(--jd-success)",
    },
  ];

  return (
    <div className="ats-score-page min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <div className="dashboard-nav-area">
        <DashboardNav role="employee" />
      </div>

      <div className="dashboard-shell jd-shell py-6 lg:py-8">
        {/* Header */}
        <div className="jd-hero ats-score-hero mb-5 lg:mb-6 space-y-3">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="ats-score-hero-copy space-y-2">
              <span className="jd-hero-label">
                <BarChart3 size={14} />
                ATS Analyzer
              </span>
              <h1 className="jd-hero-title text-2xl lg:text-3xl font-bold">Optimize for impact.</h1>
              <p className="jd-hero-copy text-sm">
                Get detailed ATS optimization recommendations for your CVs before you apply.
              </p>
            </div>

            <div className="ats-score-stats jd-surface-stack min-w-0 xl:max-w-sm">
              <p className="jd-section-title mb-2">Analysis Stats</p>
              <div className="jd-meta-grid ats-score-stats-grid">
                {stats.map((stat) => (
                  <div key={stat.label} className="jd-stat-card ats-score-stat-card">
                    <p className="jd-stat-label">{stat.label}</p>
                    <p className="jd-stat-value" style={{ color: stat.color }}>{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {(error || cvFetchError) && (
          <div className="mb-6 jd-surface-stack" style={{ borderColor: 'var(--jd-danger)' }}>
            <p className="font-mono text-sm text-[var(--jd-danger)] m-0 font-bold uppercase py-2">
              {error || cvFetchError?.response?.data?.message || "Unable to load CVs."}
            </p>
          </div>
        )}

        {/* Content */}
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
  );
}
