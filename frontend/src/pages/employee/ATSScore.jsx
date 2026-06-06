import React, { useState, useRef, useCallback } from "react";
import { BarChart3 } from "lucide-react";
import "../../styles/job-discovery.css";
import "../../styles/ats-gallery.css";
import DashboardNav from "../../components/shared/DashboardNav";
import { useTranslation } from "../../context/LanguageContext";
import useFetch from "../../hooks/useFetch";
import api from "../../services/api";
import CVSelector from "../../components/employee/ats-score/CVSelector";
import ATSResults from "../../components/employee/ats-score/ATSResults";

export default function ATSScore() {
  const { t } = useTranslation();
  const [selectedCvId, setSelectedCvId] = useState(null);
  const [atsResult, setAtsResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const progressTimerRef = useRef(null);

  const startProgressSimulation = useCallback(() => {
    setProgress(0);
    let p = 0;
    clearInterval(progressTimerRef.current);
    progressTimerRef.current = setInterval(() => {
      p += Math.random() * 8 + 2;
      if (p >= 92) {
        p = 92;
        clearInterval(progressTimerRef.current);
      }
      setProgress(Math.round(p));
    }, 400);
  }, []);

  const finishProgress = useCallback(() => {
    clearInterval(progressTimerRef.current);
    setProgress(100);
    setTimeout(() => setProgress(0), 600);
  }, []);

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

  const handleAnalyze = async (cvId, forceRefresh = false) => {
    setLoading(true);
    setSelectedCvId(cvId);
    setError("");
    setAtsResult(null);
    startProgressSimulation();

    try {
      const res = await api.post("/applications/analyze-ats", { cvId, forceRefresh });
      setAtsResult(res.data?.data);
      finishProgress();
    } catch (err) {
      finishProgress();
      setError(
        err.response?.data?.message ||
          t("atsAudit.failedToAnalyze", {}, "Failed to analyze CV. Please try again."),
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
                  t("atsAudit.systemError", {}, "System error: Unable to load data.")}
              </p>
            </div>
          </div>
        )}

        <div className="mt-8">
          {atsResult ? (
            <ATSResults
              result={atsResult}
              onBack={handleBackToSelector}
              onReanalyze={() => selectedCvId && handleAnalyze(selectedCvId, true)}
            />
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

      {loading && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 9999,
            width: 280,
            background: "var(--nm-surface)",
            border: "4px solid var(--nm-ink)",
            boxShadow: "6px 6px 0 var(--nm-ink)",
            padding: "16px",
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontWeight: 800, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--nm-text-primary)" }}>
              {t("atsAudit.atsAnalysis", {}, "ATS Analysis")}
            </span>
            <span style={{ fontWeight: 800, fontSize: "0.85rem", color: "var(--nm-primary)" }}>
              {progress}%
            </span>
          </div>
          <div style={{ width: "100%", height: 10, background: "var(--nm-surface-high)", border: "2px solid var(--nm-ink)" }}>
            <div
              style={{
                height: "100%",
                width: `${progress}%`,
                background: "var(--nm-primary)",
                transition: "width 0.3s ease",
              }}
            />
          </div>
          <p style={{ margin: "8px 0 0", fontSize: "0.7rem", color: "var(--nm-text-tertiary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {progress < 30 
              ? t("atsAudit.loadingCvData", {}, "Loading CV data...") 
              : progress < 60 
              ? t("atsAudit.runningAtsScoring", {}, "Running ATS scoring...") 
              : progress < 90 
              ? t("atsAudit.generatingRecs", {}, "Generating recommendations...") 
              : t("atsAudit.almostDone", {}, "Almost done...")}
          </p>
        </div>
      )}
    </div>
  );
}
