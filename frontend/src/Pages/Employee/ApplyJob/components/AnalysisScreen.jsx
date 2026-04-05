import React from "react";
import { ChevronLeft } from "lucide-react";

export default function AnalysisScreen({ job, matchAnalysis, setStep, setMatchAnalysis, setCvFile, handleSubmitApplication, submitting, isEdit }) {
  const matchPercentage = matchAnalysis.matchPercentage || 0;
  const isQualified = matchPercentage >= 50;
  const matchBreakdown = matchAnalysis.matchDetails;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => {
            setStep("upload");
            setMatchAnalysis(null);
            setCvFile(null);
          }}
          className="flex items-center gap-2 mb-4 text-[var(--teal)] hover:text-[var(--yellow)] transition-colors"
        >
          <ChevronLeft size={18} />
          <span className="font-mono text-sm font-bold">Back</span>
        </button>
        <h1 className="text-3xl font-bold font-['Space_Grotesk'] uppercase tracking-tight mb-2">
          Match Analysis
        </h1>
        <p className="font-mono text-sm text-[var(--fg-muted)]">
          Applying for {job.position}
        </p>
      </div>

      {/* Match Score */}
      <div
        className="brutal-card p-8 mb-6 text-center border-4"
        style={{
          background: isQualified ? "rgba(78, 205, 196, 0.1)" : "rgba(255, 107, 107, 0.1)",
          borderColor: isQualified ? "--teal" : "var(--coral)",
        }}
      >
        <p className="font-mono text-xs font-bold text-[var(--fg-muted)] mb-2 uppercase">
          Overall Match Score
        </p>
        <p
          className="text-5xl font-bold mb-4"
          style={{ color: isQualified ? "--teal" : "var(--coral)" }}
        >
          {matchPercentage}%
        </p>
        <p
          className="font-['Space_Grotesk'] font-bold uppercase tracking-wider"
          style={{ color: isQualified ? "--teal" : "var(--coral)" }}
        >
          {isQualified ? "✓ Qualified to Apply" : "✗ Below Threshold"}
        </p>
      </div>

      {/* Match Breakdown */}
      <div className="brutal-card bg-[var(--card-bg)] p-6 mb-6">
        <h2 className="font-['Space_Grotesk'] font-bold text-sm uppercase tracking-wider mb-4">
          Match Breakdown
        </h2>
        <div className="space-y-3">
          {[
            { label: "Technical Skills", score: matchBreakdown?.technicalSkillsMatch || 0, weight: "(40%)" },
            { label: "Experience", score: matchBreakdown?.experienceMatch || 0, weight: "(30%)" },
            { label: "Soft Skills", score: matchBreakdown?.softSkillsMatch || 0, weight: "(15%)" },
            { label: "Languages", score: matchBreakdown?.languagesMatch || 0, weight: "(15%)" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="font-mono text-xs font-bold">
                    {item.label} {item.weight}
                  </span>
                  <span className="font-mono text-xs font-bold" style={{ color: "var(--yellow)" }}>
                    {item.score}%
                  </span>
                </div>
                <div className="w-full h-2 bg-[var(--border-color)]" style={{ borderRadius: "2px", overflow: "hidden" }}>
                  <div
                    style={{ background: "var(--teal)", width: `${item.score}%`, height: "100%", transition: "width 0.3s ease" }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Analysis */}
      {matchAnalysis.matchDetails?.matchAnalysis && (
        <div className="brutal-card bg-[var(--card-bg)] p-6 mb-6">
          <h2 className="font-['Space_Grotesk'] font-bold text-sm uppercase tracking-wider mb-4">
            AI Analysis
          </h2>
          <p className="font-mono text-sm leading-relaxed text-[var(--fg-muted)]">
            {matchAnalysis.matchDetails.matchAnalysis}
          </p>
        </div>
      )}

      {/* Strengths */}
      {matchAnalysis.strengths && matchAnalysis.strengths.length > 0 && (
        <div className="brutal-card bg-[var(--card-bg)] p-6 mb-6">
          <h2 className="font-['Space_Grotesk'] font-bold text-sm uppercase tracking-wider mb-4" style={{ color: "var(--teal)" }}>
            ✓ Your Strengths
          </h2>
          <ul className="space-y-2">
            {matchAnalysis.strengths.map((strength, i) => (
              <li key={i} className="flex gap-2 font-mono text-sm text-[var(--fg-muted)]">
                <span style={{ color: "var(--teal)", fontWeight: "bold" }}>•</span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Weaknesses */}
      {matchAnalysis.weaknesses && matchAnalysis.weaknesses.length > 0 && (
        <div className="brutal-card bg-[var(--card-bg)] p-6 mb-6">
          <h2 className="font-['Space_Grotesk'] font-bold text-sm uppercase tracking-wider mb-4" style={{ color: "var(--coral)" }}>
            ⚠ Areas to Improve
          </h2>
          <ul className="space-y-2">
            {matchAnalysis.weaknesses.map((weakness, i) => (
              <li key={i} className="flex gap-2 font-mono text-sm text-[var(--fg-muted)]">
                <span style={{ color: "var(--coral)", fontWeight: "bold" }}>•</span>
                <span>{weakness}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => {
            setStep("upload");
            setMatchAnalysis(null);
            setCvFile(null);
          }}
          className="flex-1 brutal-btn px-4 py-3 font-bold uppercase"
          style={{ background: "var(--fg-muted)", color: "#0a0a0a" }}
        >
          Back
        </button>
        {isQualified && (
          <button
            onClick={handleSubmitApplication}
            disabled={submitting}
            className="flex-1 brutal-btn px-4 py-3 font-bold uppercase disabled:opacity-50"
            style={{ background: submitting ? "--fg-muted" : "var(--yellow)", color: "#0a0a0a" }}
          >
            {submitting ? "Submitting..." : isEdit ? "Update Application" : "Apply Now"}
          </button>
        )}
      </div>

      {!isQualified && (
        <div className="mt-4 brutal-card bg-[rgba(255,107,107,0.1)] border-4 border-[var(--coral)] p-4">
          <p className="font-mono text-sm text-[var(--fg-muted)]">
            Your match percentage is below 50%. You cannot apply for this position. Consider improving your skills or experience in areas marked above.
          </p>
        </div>
      )}
    </div>
  );
}
