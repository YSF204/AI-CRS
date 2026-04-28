import React, { useState } from "react";
import { ChevronDown, ChevronUp, ArrowLeft, CheckCircle2, AlertCircle, Lightbulb } from "lucide-react";

export default function ATSResults({ result, onBack }) {
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const getScoreColor = (score) => {
    if (score >= 75) return "var(--nm-success)";
    if (score >= 50) return "var(--nm-warning)";
    return "var(--nm-error)";
  };

  const getScoreLabel = (score) => {
    if (score >= 75) return "OPTIMIZED";
    if (score >= 50) return "AVERAGE";
    return "IMPROVABLE";
  };

  const overallScore = result.overallScore || 0;
  const sections = result.sections || {};
  const topStrengths = result.topStrengths || [];
  const topWeaknesses = result.topWeaknesses || [];
  const suggestions = result.improvementSuggestions || [];
  const summary = result.summary || "";

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <div className="flex justify-start">
        <button
          onClick={onBack}
          className="jd-btn jd-btn-secondary inline-flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back to Selection
        </button>
      </div>

      {/* Main Analysis Panel */}
      <div className="jd-panel p-6 bg-[var(--nm-surface)]">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="flex-1 max-w-2xl space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-[3px] bg-[var(--nm-primary)]" />
              <h2 className="text-[10px] font-mono font-bold text-[var(--nm-primary)] tracking-[0.2em] uppercase">
                Analysis Summary
              </h2>
            </div>
            <p className="text-base font-['Manrope'] font-bold text-black leading-relaxed">
              {summary}
            </p>
          </div>

          {/* Score Block */}
          <div
            className="relative p-1 bg-black flex-shrink-0"
            style={{ boxShadow: '6px 6px 0 var(--nm-primary)' }}
          >
            <div className="bg-white p-4 border-2 border-black flex flex-col items-center justify-center min-w-[140px]">
              <div className="text-5xl font-bold font-['Space_Grotesk'] text-black leading-none mb-1">
                {overallScore}<span className="text-lg font-medium opacity-40">%</span>
              </div>
              <div className="text-[9px] font-mono font-bold px-2 py-0.5 bg-[var(--nm-primary)] text-white tracking-widest">
                {getScoreLabel(overallScore)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="jd-panel p-6 bg-white border-l-[12px] border-l-[var(--nm-success)]">
          <div className="flex items-center gap-2 mb-6">
            <CheckCircle2 size={18} className="text-[var(--nm-success)]" />
            <h3 className="font-bold font-['Space_Grotesk'] text-sm tracking-widest text-black uppercase">
              Strengths
            </h3>
          </div>
          <ul className="space-y-4">
            {topStrengths.map((strength, idx) => (
              <li key={idx} className="font-['Manrope'] text-sm flex items-start gap-3 group">
                <span className="text-[var(--nm-success)] font-bold opacity-40 mt-0.5 group-hover:opacity-100 transition-opacity">0{idx + 1}</span>
                <span className="text-black font-semibold">{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="jd-panel p-6 bg-white border-l-[12px] border-l-[var(--nm-error)]">
          <div className="flex items-center gap-2 mb-6">
            <AlertCircle size={18} className="text-[var(--nm-error)]" />
            <h3 className="font-bold font-['Space_Grotesk'] text-sm tracking-widest text-black uppercase">
              Areas to Improve
            </h3>
          </div>
          <ul className="space-y-4">
            {topWeaknesses.map((weakness, idx) => (
              <li key={idx} className="font-['Manrope'] text-sm flex items-start gap-3 group">
                <span className="text-[var(--nm-error)] font-bold opacity-40 mt-0.5 group-hover:opacity-100 transition-opacity">0{idx + 1}</span>
                <span className="text-black font-semibold">{weakness}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Detailed Section Breakdown */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="font-bold font-['Space_Grotesk'] text-lg tracking-tight uppercase text-black">
            Technical Breakdown
          </h3>
          <span className="text-[10px] font-mono text-black font-bold uppercase tracking-widest">
            {Object.keys(sections).length} Sections Analyzed
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {Object.entries(sections).map(([sectionKey, sectionData]) => {
            const isExpanded = expandedSections[sectionKey];
            const score = sectionData.score || 0;
            const strengths = sectionData.strengths || [];
            const weaknesses = sectionData.weaknesses || [];

            return (
              <div
                key={sectionKey}
                className="jd-card bg-white group hover:border-[var(--nm-primary)] transition-colors"
              >
                {/* Header */}
                <div
                  onClick={() => toggleSection(sectionKey)}
                  className="p-4 flex items-center justify-between cursor-pointer gap-6"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h4 className="font-bold font-['Space_Grotesk'] text-sm tracking-wider text-black uppercase">
                        {sectionKey.replace(/([A-Z])/g, " $1").trim()}
                      </h4>
                      <div className="h-[2px] flex-1 bg-[var(--nm-surface-high)]" />
                    </div>
                    {/* Minimal Progress Line */}
                    <div className="w-full bg-[var(--nm-surface-high)] h-[8px] relative overflow-hidden border border-black/5">
                      <div
                        className="h-full bg-[var(--nm-primary)] transition-all duration-700 ease-out"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-2xl font-bold font-['Space_Grotesk'] text-black leading-none">
                        {score}%
                      </div>
                      <div className="text-[10px] font-mono font-bold text-black uppercase tracking-tighter">
                        Accuracy
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp size={20} className="text-black" /> : <ChevronDown size={20} className="text-black" />}
                  </div>
                </div>

                {/* Content */}
                {isExpanded && (
                  <div className="p-6 bg-[var(--nm-surface-low)] border-t-[4px] border-black">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {strengths.length > 0 && (
                        <div>
                          <p className="text-[10px] font-mono font-bold text-[var(--nm-success)] mb-3 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-2 h-2 bg-[var(--nm-success)]" /> Optimized
                          </p>
                          <ul className="space-y-2">
                            {strengths.map((s, i) => (
                              <li key={i} className="text-sm font-['Manrope'] text-black font-medium pl-4 border-l-2 border-[var(--nm-success)]">{s}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {weaknesses.length > 0 && (
                        <div>
                          <p className="text-[10px] font-mono font-bold text-[var(--nm-error)] mb-3 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-2 h-2 bg-[var(--nm-error)]" /> Recommendations
                          </p>
                          <ul className="space-y-2">
                            {weaknesses.map((w, i) => (
                              <li key={i} className="text-sm font-['Manrope'] text-black font-medium pl-4 border-l-2 border-[var(--nm-error)]">{w}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Suggestions Section */}
      {suggestions.length > 0 && (
        <div className="jd-panel p-8 bg-white border-4 border-[var(--nm-primary)]">
          <div className="flex items-center gap-3 mb-8">
            <Lightbulb size={24} className="text-[var(--nm-primary)]" />
            <h3 className="font-bold font-['Space_Grotesk'] text-xl tracking-tight text-black uppercase">
              Action Plan
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suggestions.map((suggestion, idx) => (
              <div key={idx} className="p-5 border-2 border-black hover:bg-[var(--nm-surface-low)] transition-colors flex gap-4">
                <span className="text-xl font-bold text-[var(--nm-primary)]">0{idx + 1}</span>
                <p className="text-sm font-['Manrope'] font-bold leading-relaxed text-black">{suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="flex flex-col items-center gap-4 py-6">
        <button onClick={onBack} className="jd-btn jd-btn-primary px-16 py-4 text-sm tracking-widest uppercase shadow-[6px_6px_0_var(--nm-ink)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
          Analyze Another
        </button>
      </div>
    </div>
  );
}
