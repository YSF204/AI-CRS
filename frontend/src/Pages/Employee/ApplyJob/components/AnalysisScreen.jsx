import React, { useEffect } from "react";
import {
  ChevronLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AnalysisScreen({
  job,
  matchAnalysis,
  setStep,
  setMatchAnalysis,
  setCvFile,
  setSelectedCvId,
  handleSubmitApplication,
  submitting,
  isEdit,
}) {
  const navigate = useNavigate();

  // Scroll overlay to top on mount
  useEffect(() => {
    const overlay = document.querySelector("[data-analysis-overlay]");
    if (overlay) overlay.scrollTop = 0;
  }, []);

  // ── Score ──────────────────────────────────────────────────────────────
  const matchPercentage =
    matchAnalysis?.overall_fit_percentage ??
    matchAnalysis?.matchPercentage ??
    0;
  const isQualified = matchPercentage >= 50;
  const scoreColor = isQualified ? "#1e51f6" : "#ba1a1a";

  // ── Details ────────────────────────────────────────────────────────────
  const details = matchAnalysis?.matchDetails || matchAnalysis || {};
  const aiSummary =
    matchAnalysis?.recruiter_summary ||
    details?.recruiter_summary ||
    details?.matchAnalysis || "";

  const strengthsList = matchAnalysis?.strengths || details?.strengths || [];
  const rawGaps = matchAnalysis?.gaps || details?.gaps || [];
  const weaknessesList =
    rawGaps.length > 0
      ? rawGaps.map((g) => (typeof g === "string" ? g : g.gap || ""))
      : matchAnalysis?.weaknesses || details?.weaknesses || [];

  // ── Matrix ─────────────────────────────────────────────────────────────
  const dimScores = matchAnalysis?.dimension_scores || details?.dimension_scores || {};
  const techScore  = dimScores?.technical_skills?.score  ?? details?.technicalSkillsMatch ?? null;
  const expScore   = dimScores?.experience?.score        ?? details?.experienceMatch       ?? null;
  const softScore  = dimScores?.soft_skills_culture?.score ?? details?.softSkillsMatch    ?? null;

  const dimensions = [
    { label: "Technical Skills",     score: techScore, color: "#2563eb" },
    { label: "Experience",           score: expScore,  color: "#7c3aed" },
    { label: "Interpersonal Skills", score: softScore, color: "#0891b2" },
  ].filter((d) => d.score !== null && d.score > 0);

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleBack = () => {
    setStep("upload");
    setMatchAnalysis(null);
    setCvFile(null);
  };
  
  const handleTryDifferentCV = () => {
    setMatchAnalysis(null);
    setCvFile(null);
    setSelectedCvId("");
    setStep("upload");
  };

  return (
    <div style={{ width: "100%", maxWidth: 680, margin: "0 auto", paddingBottom: "2rem",
      background: "#fbfaee",
      border: "4px solid #1b1c15",
      borderRadius: 0,
      boxShadow: "8px 8px 0px 0px #1b1c15",
    }}>

      {/* ── Sticky top bar ──────────────────────────────────────────────── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 20,
        background: "#e9e9dd",
        borderBottom: "4px solid #1b1c15",
        padding: "1rem 1.25rem",
        display: "flex", alignItems: "center", gap: "1rem",
      }}>
        <button
          onClick={handleBack}
          style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800,
            fontSize: "0.8rem", textTransform: "uppercase",
            letterSpacing: "0.05em",
            background: "#fbfaee", border: "4px solid #1b1c15", cursor: "pointer",
            color: "#1b1c15",
            padding: "0.5rem 1rem",
            borderRadius: 0,
            transition: "transform 0.15s ease",
          }}
          onMouseEnter={e => e.currentTarget.style.transform = "translate(2px, 2px)"}
          onMouseLeave={e => e.currentTarget.style.transform = "translate(0px, 0px)"}
        >
          <ChevronLeft size={16} strokeWidth={3} />
          Back
        </button>
        <span style={{
          fontFamily: "'Manrope', sans-serif", fontSize: "0.85rem",
          color: "#1b1c15", fontWeight: 700, textTransform: "uppercase",
          letterSpacing: "0.06em", overflow: "hidden", textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {job.position}
        </span>
      </div>

      {/* ── Score card ───────────────────────────────────────────────────── */}
      <div style={{
        margin: "1.5rem 1.25rem",
        borderRadius: 0,
        background: "#ffffff",
        border: "4px solid #1b1c15",
        padding: "2.5rem 1.5rem",
        display: "flex", flexDirection: "column", alignItems: "center",
        gap: "0.5rem",
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: "0.5rem",
          color: scoreColor, marginBottom: "0.5rem",
        }}>
          {isQualified
            ? <CheckCircle2 size={24} strokeWidth={2.5} />
            : <XCircle size={24} strokeWidth={2.5} />}
          <span style={{
            fontFamily: "'Manrope', sans-serif", fontSize: "0.8rem",
            fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em",
            color: "#1b1c15",
          }}>
            {isQualified ? "Qualified" : "Below Threshold"}
          </span>
        </div>

        {/* Big score */}
        <div style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 800, lineHeight: 1,
          fontSize: "clamp(4.5rem, 16vw, 8rem)",
          color: scoreColor,
          letterSpacing: "-0.04em",
        }}>
          {matchPercentage}<span style={{ fontSize: "40%" }}>%</span>
        </div>

        <p style={{
          fontFamily: "'Manrope', sans-serif", fontSize: "0.8rem",
          color: "#1b1c15", fontWeight: 700, textTransform: "uppercase",
          letterSpacing: "0.08em", marginTop: "0.5rem",
        }}>
          Overall AI Match Score
        </p>
      </div>

      {/* ── Matrix bars ─────────────────────────────────────────────────── */}
      {dimensions.length > 0 && (
        <div style={{ margin: "0 1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <p style={{
            fontFamily: "'Manrope', sans-serif", fontSize: "0.75rem",
            fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em",
            color: "#1b1c15", marginBottom: "0.25rem",
          }}>
            Breakdown
          </p>
          {dimensions.map((d, i) => (
            <div key={i}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span style={{
                  fontFamily: "'Manrope', sans-serif", fontSize: "0.8rem",
                  fontWeight: 700, color: "#1b1c15", textTransform: "uppercase",
                  letterSpacing: "0.02em",
                }}>
                  {d.label}
                </span>
                <span style={{
                  fontFamily: "'Space Grotesk', sans-serif", fontSize: "1rem",
                  fontWeight: 800, color: d.score >= 50 ? "#1e51f6" : "#ba1a1a",
                }}>
                  {d.score}%
                </span>
              </div>
              <div style={{
                height: 12, borderRadius: 0,
                background: "#ffffff", border: "2px solid #1b1c15",
                overflow: "hidden",
              }}>
                <div style={{
                  height: "100%", borderRadius: 0,
                  width: `${d.score}%`,
                  background: d.score >= 50 ? "#1b1c15" : "#ba1a1a",
                  transition: "width 0.6s ease",
                }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Summary ─────────────────────────────────────────────────────── */}
      {aiSummary && (
        <div style={{
          margin: "0 1.25rem 1.5rem",
          padding: "1.5rem",
          background: "#ffffff",
          borderRadius: 0,
          border: "4px solid #1b1c15",
        }}>
          <p style={{
            fontFamily: "'Manrope', sans-serif", fontSize: "0.75rem",
            fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em",
            color: "#1b1c15", marginBottom: "1rem",
          }}>
            Recruiter Summary
          </p>
          <p style={{
            fontFamily: "'Manrope', sans-serif", fontSize: "0.95rem",
            color: "#1b1c15", lineHeight: 1.6, fontWeight: 500,
          }}>
            {aiSummary}
          </p>
        </div>
      )}

      {/* ── Strengths & Gaps ────────────────────────────────────────────── */}
      {(strengthsList.length > 0 || weaknessesList.length > 0) && (
        <div style={{
          margin: "0 1.25rem 1.5rem",
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem",
        }}>
          {/* Strengths */}
          <div style={{
            padding: "1.5rem",
            background: "#ffffff",
            borderRadius: 0, border: "4px solid #1b1c15",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
              <TrendingUp size={16} color="#1b1c15" strokeWidth={2.5} />
              <span style={{
                fontFamily: "'Manrope', sans-serif", fontSize: "0.75rem",
                fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em",
                color: "#1b1c15",
              }}>
                Strengths
              </span>
            </div>
            {strengthsList.length > 0 ? (
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {strengthsList.map((s, i) => (
                  <li key={i} style={{
                    fontFamily: "'Manrope', sans-serif", fontSize: "0.85rem",
                    color: "#1b1c15", lineHeight: 1.5, fontWeight: 500,
                    paddingLeft: "1.25rem", position: "relative",
                  }}>
                    <span style={{ position: "absolute", left: 0, color: "#1e51f6", fontWeight: 800 }}>+</span>
                    {s}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: "0.85rem", color: "#1b1c15", fontStyle: "italic", fontWeight: 500 }}>
                None listed
              </p>
            )}
          </div>

          {/* Gaps */}
          <div style={{
            padding: "1.5rem",
            background: "#ffffff",
            borderRadius: 0, border: "4px solid #1b1c15",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
              <TrendingDown size={16} color="#ba1a1a" strokeWidth={2.5} />
              <span style={{
                fontFamily: "'Manrope', sans-serif", fontSize: "0.75rem",
                fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em",
                color: "#1b1c15",
              }}>
                Gaps
              </span>
            </div>
            {weaknessesList.length > 0 ? (
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {weaknessesList.map((w, i) => (
                  <li key={i} style={{
                    fontFamily: "'Manrope', sans-serif", fontSize: "0.85rem",
                    color: "#1b1c15", lineHeight: 1.5, fontWeight: 500,
                    paddingLeft: "1.25rem", position: "relative",
                  }}>
                    <span style={{ position: "absolute", left: 0, color: "#ba1a1a", fontWeight: 800 }}>−</span>
                    {w}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: "0.85rem", color: "#1b1c15", fontStyle: "italic", fontWeight: 500 }}>
                None detected
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Warning banner ──────────────────────────────────────────────── */}
      {!isQualified && (
        <div style={{
          margin: "0 1.25rem 1.5rem",
          padding: "1.25rem",
          background: "#ffffff",
          border: "4px solid #ba1a1a",
          borderRadius: 0,
          display: "flex", alignItems: "flex-start", gap: "1rem",
        }}>
          <AlertTriangle size={20} color="#ba1a1a" style={{ flexShrink: 0, marginTop: 2 }} strokeWidth={2.5} />
          <p style={{
            fontFamily: "'Manrope', sans-serif", fontSize: "0.9rem",
            color: "#1b1c15", lineHeight: 1.5, margin: 0, fontWeight: 600,
          }}>
            Your score ({matchPercentage}%) is below the 50% threshold. Try a different CV for a better match.
          </p>
        </div>
      )}

      {/* ── Action buttons ──────────────────────────────────────────────── */}
      <div style={{ margin: "0 1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        {isQualified ? (
          <button
            onClick={handleSubmitApplication}
            disabled={submitting}
            style={{
              width: "100%", padding: "1.25rem",
              background: "#1e51f6", color: "#ffffff",
              border: "4px solid #1b1c15", borderRadius: 0,
              fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800,
              fontSize: "1rem", textTransform: "uppercase",
              letterSpacing: "0.05em", cursor: submitting ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem",
              transition: "transform 0.15s ease",
            }}
            onMouseEnter={(e) => !submitting && (e.currentTarget.style.transform = "translate(2px, 2px)")}
            onMouseLeave={(e) => !submitting && (e.currentTarget.style.transform = "translate(0px, 0px)")}
          >
            {submitting ? "Processing…" : isEdit ? "Update Submission" : "Submit Application"}
            {!submitting && <ArrowRight size={20} strokeWidth={3} />}
          </button>
        ) : (
          <div style={{ display: "flex", gap: "1rem" }}>
            <button
              onClick={handleTryDifferentCV}
              style={{
                flex: 1, padding: "1rem",
                background: "#ffffff",
                color: "#1b1c15",
                border: "4px solid #1b1c15",
                borderRadius: 0,
                fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800,
                fontSize: "0.9rem", textTransform: "uppercase",
                letterSpacing: "0.04em", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                transition: "transform 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translate(2px, 2px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translate(0px, 0px)")}
            >
              <RotateCcw size={16} strokeWidth={2.5} /> Try Different CV
            </button>
            <button
              onClick={() => navigate("/employee/jobs")}
              style={{
                flex: 1, padding: "1rem",
                background: "#fbfaee",
                color: "#1b1c15",
                border: "4px solid #1b1c15",
                borderRadius: 0,
                fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800,
                fontSize: "0.9rem", textTransform: "uppercase",
                letterSpacing: "0.04em", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                transition: "transform 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translate(2px, 2px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translate(0px, 0px)")}
            >
              Find Another Job <ArrowRight size={16} strokeWidth={2.5} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
