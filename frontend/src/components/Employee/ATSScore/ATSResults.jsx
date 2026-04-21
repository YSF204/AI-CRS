import React, { useState } from "react";
import { ChevronDown, ChevronUp, ArrowLeft } from "lucide-react";

export default function ATSResults({ result, onBack }) {
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const getScoreColor = (score) => {
    if (score >= 75) return "var(--teal)"; // Green
    if (score >= 50) return "var(--yellow)"; // Yellow
    return "var(--coral)"; // Red
  };

  const getScoreLabel = (score) => {
    if (score >= 75) return "STRONG";
    if (score >= 50) return "FAIR";
    return "NEEDS WORK";
  };

  const overallScore = result.overallScore || 0;
  const sections = result.sections || {};
  const topStrengths = result.topStrengths || [];
  const topWeaknesses = result.topWeaknesses || [];
  const suggestions = result.improvementSuggestions || [];
  const summary = result.summary || "";

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="jd-btn jd-btn-secondary mb-4 inline-flex items-center gap-2"
      >
        <ArrowLeft size={16} />
        Back to CV Selection
      </button>

      {/* Overall Score */}
      <div className="brutal-card p-8 bg-[var(--card-bg)]">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-sm font-mono text-[var(--fg-muted)] mb-2">
              OVERALL ATS SCORE
            </h2>
            <p className="text-lg text-[var(--fg-muted)]">{summary}</p>
          </div>

          {/* Score Circle */}
          <div
            className="relative w-32 h-32 rounded-full border-4 border-black flex items-center justify-center"
            style={{ background: getScoreColor(overallScore) }}
          >
            <div className="text-center">
              <div
                className="text-4xl font-bold font-['Space_Grotesk']"
                style={{ color: "#0a0a0a" }}
              >
                {overallScore}
              </div>
              <div
                className="text-xs font-mono font-bold"
                style={{ color: "#0a0a0a" }}
              >
                {getScoreLabel(overallScore)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="brutal-card p-6 bg-[var(--teal)] text-black">
          <h3 className="font-bold font-['Space_Grotesk'] mb-4 text-sm">
            TOP STRENGTHS
          </h3>
          <ul className="space-y-2">
            {topStrengths.map((strength, idx) => (
              <li
                key={idx}
                className="font-mono text-sm flex items-start gap-2"
              >
                <span className="font-bold">✓</span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="brutal-card p-6 bg-[var(--coral)] text-black">
          <h3 className="font-bold font-['Space_Grotesk'] mb-4 text-sm">
            TOP WEAKNESSES
          </h3>
          <ul className="space-y-2">
            {topWeaknesses.map((weakness, idx) => (
              <li
                key={idx}
                className="font-mono text-sm flex items-start gap-2"
              >
                <span className="font-bold">⚠</span>
                <span>{weakness}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Section Scores */}
      <div className="brutal-card p-6 bg-[var(--card-bg)]">
        <h3 className="font-bold font-['Space_Grotesk'] mb-4 text-lg">
          SECTION SCORES
        </h3>
        <div className="space-y-4">
          {Object.entries(sections).map(([sectionKey, sectionData]) => {
            const isExpanded = expandedSections[sectionKey];
            const score = sectionData.score || 0;
            const strengths = sectionData.strengths || [];
            const weaknesses = sectionData.weaknesses || [];

            return (
              <div
                key={sectionKey}
                className="brutal-card p-4 bg-[var(--bg)] border-2 border-black"
              >
                {/* Score Header */}
                <div
                  onClick={() => toggleSection(sectionKey)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex-1">
                    <h4 className="font-bold font-['Space_Grotesk'] capitalize mb-2">
                      {sectionKey
                        .replace(/([A-Z])/g, " $1")
                        .toLowerCase()
                        .trim()}
                    </h4>
                    {/* Progress bar */}
                    <div className="bg-[var(--bg)] border-2 border-black h-6 flex items-center overflow-hidden">
                      <div
                        className="h-full flex items-center justify-center text-xs font-bold text-white"
                        style={{
                          width: `${score}%`,
                          background: getScoreColor(score),
                        }}
                      >
                        {score > 10 && `${score}`}
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4 flex flex-col items-end">
                    <span
                      className="font-bold text-2xl font-['Space_Grotesk']"
                      style={{ color: getScoreColor(score) }}
                    >
                      {score}
                    </span>
                    {isExpanded ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </div>
                </div>

                {/* Collapsible Details */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t-2 border-black space-y-3">
                    {strengths.length > 0 && (
                      <div>
                        <div className="font-mono text-xs font-bold text-[var(--teal)] mb-2">
                          STRENGTHS
                        </div>
                        <ul className="space-y-1">
                          {strengths.map((strength, idx) => (
                            <li key={idx} className="font-mono text-sm">
                              • {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {weaknesses.length > 0 && (
                      <div>
                        <div className="font-mono text-xs font-bold text-[var(--coral)] mb-2">
                          WEAKNESSES
                        </div>
                        <ul className="space-y-1">
                          {weaknesses.map((weakness, idx) => (
                            <li key={idx} className="font-mono text-sm">
                              • {weakness}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Improvement Suggestions */}
      {suggestions.length > 0 && (
        <div className="brutal-card p-6 bg-[var(--yellow)] text-black">
          <h3 className="font-bold font-['Space_Grotesk'] mb-4 text-lg">
            IMPROVEMENT SUGGESTIONS
          </h3>
          <ol className="space-y-3">
            {suggestions.map((suggestion, idx) => (
              <li key={idx} className="font-mono text-sm">
                <span className="font-bold">{idx + 1}.</span> {suggestion}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Back Button Bottom */}
      <div className="flex justify-center pt-4">
        <button
          onClick={onBack}
          className="jd-btn jd-btn-primary"
        >
          Analyze Another CV
        </button>
      </div>
    </div>
  );
}
