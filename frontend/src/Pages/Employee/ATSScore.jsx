import React, { useState } from "react";
import { FileText, BarChart3 } from "lucide-react";
import DashboardNav from "../../components/shared/DashboardNav";
import StatsBar from "../../components/shared/StatsBar";
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
    setError("");
    setAtsResult(null);

    try {
      const res = await api.post("/applications/analyze-ats", { cvId });
      setAtsResult(res.data?.data);
      setSelectedCvId(cvId);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to analyze CV. Please try again.",
      );
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
    { label: "Total CVs", value: cvs.length, color: "var(--teal)" },
    { label: "Average Score", value: "—", color: "var(--coral)" },
    {
      label: "Latest Analysis",
      value: atsResult ? "Complete" : "—",
      color: "var(--yellow)",
    },
  ];

  return (
    <div className="min-h-screen p-8 bg-[var(--bg)] text-[var(--fg)]">
      <div className="dashboard-shell">
        <DashboardNav role="employee" />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-['Space_Grotesk'] uppercase tracking-tight flex items-center gap-3">
            <BarChart3 size={28} className="text-[var(--coral)]" />
            ATS Score Analyzer
          </h1>
          <p className="font-mono text-sm text-[var(--fg-muted)] mt-1">
            Get detailed ATS optimization recommendations for your CVs
          </p>
        </div>

        <StatsBar stats={stats} />

        {(error || cvFetchError) && (
          <div className="mb-6 brutal-card p-4 bg-[var(--coral)] text-black font-mono text-sm">
            {error ||
              cvFetchError?.response?.data?.message ||
              "Unable to load CVs."}
          </div>
        )}

        {/* Content */}
        {atsResult ? (
          <ATSResults result={atsResult} onBack={handleBackToSelector} />
        ) : (
          <CVSelector
            cvs={cvs}
            loading={cvLoading || loading}
            onAnalyze={handleAnalyze}
          />
        )}
      </div>
    </div>
  );
}
