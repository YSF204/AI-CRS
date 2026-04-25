import React, { useState, useEffect } from "react";
import { X, CheckCircle2, AlertCircle, Sparkles, Wand2 } from "lucide-react";

export default function AnalysisModal({
  show,
  analysis,
  currentData,
  onClose,
  onApply,
}) {
  const [selectedUpdates, setSelectedUpdates] = useState({});
  const [showImprovements, setShowImprovements] = useState(false);

  useEffect(() => {
    if (analysis?.issues) {
      const initialSelected = analysis.issues.reduce((acc, issue) => {
        acc[issue.fieldId] = true;
        return acc;
      }, {});
      setSelectedUpdates(initialSelected);
    }
  }, [analysis]);

  if (!show || !analysis) return null;

  const isEmptyCV = analysis.isEmpty === true;
  const hasImprovements = analysis.issues && analysis.issues.length > 0;

  const getScoreColor = (score) => {
    if (score < 40)
      return { bg: "var(--nm-error-surface)", text: "var(--nm-error)" };
    if (score < 70)
      return { bg: "var(--nm-warning-surface)", text: "var(--nm-warning)" };
    return { bg: "var(--nm-success-surface)", text: "var(--nm-success)" };
  };

  const scoreColor = getScoreColor(analysis.overallScore ?? 0);

  const handleCheckboxChange = (fieldId, checked) => {
    setSelectedUpdates((prev) => ({ ...prev, [fieldId]: checked }));
  };

  const handleApplyAll = () => {
    const updatesToApply = {};
    if (analysis.issues) {
      analysis.issues.forEach((issue) => {
        if (issue.improvedText) {
          updatesToApply[issue.fieldId] = issue.improvedText;
        }
      });
    }
    onApply(updatesToApply);
  };

  const handleApplySelected = () => {
    const updatesToApply = {};
    if (analysis.issues) {
      analysis.issues.forEach((issue) => {
        if (selectedUpdates[issue.fieldId] && issue.improvedText) {
          updatesToApply[issue.fieldId] = issue.improvedText;
        }
      });
    }
    onApply(updatesToApply);
  };

  const formatFieldId = (id) => {
    return id
      .split("_")
      .map((word) =>
        /^\d+$/.test(word)
          ? `#${parseInt(word) + 1}`
          : word.charAt(0).toUpperCase() + word.slice(1),
      )
      .join(" ")
      .replace("Items", "Item");
  };

  // ── Reusable Styles ────────────────────────────────────────────────
  const headingStyle = {
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "var(--nm-text-primary)",
    margin: 0,
  };

  const cardStyle = {
    background: "var(--nm-surface)",
    border: "4px solid var(--nm-ink)",
    boxShadow: "6px 6px 0 var(--nm-ink)",
    borderRadius: "0px",
    padding: "20px",
  };

  const pillStyle = (bg, color) => ({
    background: bg,
    color: color,
    padding: "6px 14px",
    border: `3px solid ${color}`,
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 700,
    fontSize: "0.75rem",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    borderRadius: "0px",
  });

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(27, 28, 21, 0.4)",
        backdropFilter: "blur(8px)",
        zIndex: 9200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "780px",
          maxHeight: "90vh",
          overflowY: "auto",
          background: "var(--nm-bg)",
          border: "4px solid var(--nm-ink)",
          boxShadow: "10px 10px 0 var(--nm-ink)",
          borderRadius: "0px",
        }}
      >
        <div style={{ padding: "28px" }}>
          {/* ── Header ─────────────────────────────────────────────── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              marginBottom: "24px",
              paddingBottom: "16px",
              borderBottom: "4px solid var(--nm-ink)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  background: "var(--nm-primary)",
                  border: "4px solid var(--nm-ink)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Sparkles size={22} color="#fff" strokeWidth={2.5} />
              </div>
              <div>
                <h2 style={{ ...headingStyle, fontSize: "1.4rem" }}>
                  CV Analysis
                </h2>
                <p
                  style={{
                    margin: 0,
                    color: "var(--nm-text-secondary)",
                    fontSize: "0.85rem",
                    fontFamily: "Manrope, sans-serif",
                    fontWeight: 500,
                    marginTop: 2,
                  }}
                >
                  Professional review of your CV
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "var(--nm-surface)",
                border: "4px solid var(--nm-ink)",
                cursor: "pointer",
                padding: "8px",
                width: 40,
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "3px 3px 0 var(--nm-ink)",
                borderRadius: "0px",
              }}
            >
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>

          {/* ── Empty CV Warning ───────────────────────────────────── */}
          {isEmptyCV && (
            <div style={{ display: "grid", gap: "16px" }}>
              <div
                style={{
                  ...cardStyle,
                  background: "var(--nm-warning-surface)",
                  borderColor: "var(--nm-warning)",
                  boxShadow: "6px 6px 0 var(--nm-warning)",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                  <AlertCircle size={28} color="var(--nm-warning)" strokeWidth={2.5} style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <h3 style={{ ...headingStyle, fontSize: "1.1rem", marginBottom: "10px", color: "var(--nm-warning)" }}>
                      Your CV needs more content
                    </h3>
                    <p style={{
                      margin: 0,
                      color: "var(--nm-text-primary)",
                      lineHeight: 1.7,
                      fontSize: "0.95rem",
                      fontFamily: "Manrope, sans-serif",
                      fontWeight: 500,
                    }}>
                      Your CV does not contain enough information to perform a meaningful analysis. Please complete your CV by adding relevant sections such as experience, education, skills, and a professional summary before requesting an evaluation.
                    </p>
                  </div>
                </div>
              </div>

              {analysis.generalAdvice && analysis.generalAdvice.length > 0 && (
                <div style={cardStyle}>
                  <h4 style={{ ...headingStyle, fontSize: "0.9rem", marginBottom: "14px" }}>
                    What to add:
                  </h4>
                  <ul style={{
                    margin: 0,
                    paddingLeft: "20px",
                    fontSize: "0.9rem",
                    color: "var(--nm-text-primary)",
                    lineHeight: 1.8,
                    fontFamily: "Manrope, sans-serif",
                    fontWeight: 500,
                  }}>
                    {analysis.generalAdvice.map((advice, idx) => (
                      <li key={idx} style={{ marginBottom: "6px" }}>{advice}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "8px" }}>
                <BrutalButton onClick={onClose} variant="secondary">Close</BrutalButton>
              </div>
            </div>
          )}

          {/* ── Normal Analysis View ───────────────────────────────── */}
          {!isEmptyCV && (
            <div style={{ display: "grid", gap: "16px" }}>
              {/* Score Card */}
              {analysis.overallScore != null && (
                <div
                  style={{
                    ...cardStyle,
                    background: scoreColor.bg,
                    borderColor: scoreColor.text,
                    boxShadow: `6px 6px 0 ${scoreColor.text}`,
                    textAlign: "center",
                    padding: "28px 20px",
                  }}
                >
                  <p style={{ ...headingStyle, fontSize: "0.85rem", color: scoreColor.text }}>
                    Overall Completeness Score
                  </p>
                  <p style={{
                    margin: "12px 0 0 0",
                    fontSize: "3.5rem",
                    fontWeight: 800,
                    color: scoreColor.text,
                    fontFamily: "'Space Grotesk', sans-serif",
                    lineHeight: 1,
                    letterSpacing: "-0.02em",
                  }}>
                    {analysis.overallScore}%
                  </p>
                </div>
              )}

              {/* Quick Apply Banner — shown when there are improvements */}
              {hasImprovements && (
                <div
                  style={{
                    ...cardStyle,
                    background: "var(--nm-primary)",
                    borderColor: "var(--nm-ink)",
                    boxShadow: "6px 6px 0 var(--nm-ink)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
                    <Wand2 size={26} color="#fff" strokeWidth={2.5} style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <h3 style={{ ...headingStyle, fontSize: "0.95rem", color: "#fff", marginBottom: 4 }}>
                        AI-Powered Improvements Available
                      </h3>
                      <p style={{
                        margin: 0,
                        color: "rgba(255,255,255,0.9)",
                        fontSize: "0.85rem",
                        fontFamily: "Manrope, sans-serif",
                        fontWeight: 500,
                      }}>
                        {analysis.issues.length} suggested improvement{analysis.issues.length > 1 ? "s" : ""} ready to apply.
                      </p>
                    </div>
                    <BrutalButton onClick={handleApplyAll} variant="white">
                      <Wand2 size={16} strokeWidth={2.5} />
                      Apply All
                    </BrutalButton>
                  </div>
                </div>
              )}

              {/* Sections */}
              {analysis.sections && (
                <div style={{ display: "grid", gap: "12px" }}>
                  {analysis.sections.map((section, idx) => {
                    const isGood = section.status === "Good";
                    const isEmpty = section.status === "Empty";

                    const statusBg = isEmpty
                      ? "var(--nm-error-surface)"
                      : isGood
                        ? "var(--nm-success-surface)"
                        : "var(--nm-warning-surface)";
                    const statusColor = isEmpty
                      ? "var(--nm-error)"
                      : isGood
                        ? "var(--nm-success)"
                        : "var(--nm-warning)";

                    return (
                      <div key={idx} style={cardStyle}>
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          marginBottom: section.suggestions?.length ? "14px" : 0,
                        }}>
                          {isGood ? (
                            <CheckCircle2 size={22} color={statusColor} strokeWidth={2.5} />
                          ) : (
                            <AlertCircle size={22} color={statusColor} strokeWidth={2.5} />
                          )}
                          <h4 style={{ ...headingStyle, fontSize: "0.95rem", flex: 1 }}>
                            {section.name}
                          </h4>
                          <span style={pillStyle(statusBg, statusColor)}>
                            {section.status}
                          </span>
                        </div>

                        {section.suggestions && section.suggestions.length > 0 && (
                          <ul style={{
                            margin: 0,
                            paddingLeft: "24px",
                            fontSize: "0.9rem",
                            color: "var(--nm-text-primary)",
                            lineHeight: 1.7,
                            fontFamily: "Manrope, sans-serif",
                            fontWeight: 500,
                          }}>
                            {section.suggestions.map((suggestion, sidx) => (
                              <li key={sidx} style={{ marginBottom: "6px" }}>{suggestion}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Detailed Improvements (Expandable) */}
              {hasImprovements && (
                <div style={cardStyle}>
                  <button
                    onClick={() => setShowImprovements(!showImprovements)}
                    style={{
                      width: "100%",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: 0,
                    }}
                  >
                    <h4 style={{ ...headingStyle, fontSize: "0.95rem" }}>
                      {showImprovements ? "▼ " : "▶ "}
                      Review Improvements Individually ({analysis.issues.length})
                    </h4>
                  </button>

                  {showImprovements && (
                    <div style={{ marginTop: "16px", display: "grid", gap: "14px" }}>
                      {analysis.issues.map((issue) => (
                        <div
                          key={issue.fieldId}
                          style={{
                            background: "var(--nm-surface-low)",
                            border: "3px solid var(--nm-ink)",
                            padding: "14px",
                          }}
                        >
                          <label style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            cursor: "pointer",
                            marginBottom: "12px",
                          }}>
                            <input
                              type="checkbox"
                              checked={selectedUpdates[issue.fieldId] || false}
                              onChange={(e) => handleCheckboxChange(issue.fieldId, e.target.checked)}
                              style={{
                                width: "18px",
                                height: "18px",
                                cursor: "pointer",
                                accentColor: "var(--nm-primary)",
                              }}
                            />
                            <strong style={{
                              fontSize: "0.85rem",
                              fontFamily: "'Space Grotesk', sans-serif",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                            }}>
                              {formatFieldId(issue.fieldId)}
                            </strong>
                          </label>

                          <div style={{ display: "grid", gap: "10px", paddingLeft: "28px" }}>
                            <p style={{
                              fontSize: "0.85rem",
                              color: "var(--nm-error)",
                              margin: 0,
                              padding: "8px 10px",
                              background: "var(--nm-error-surface)",
                              border: "2px solid var(--nm-error)",
                              fontFamily: "Manrope, sans-serif",
                              fontWeight: 500,
                            }}>
                              <strong>Issue: </strong> {issue.reason}
                            </p>
                            {issue.originalText && (
                              <p style={{
                                fontSize: "0.85rem",
                                color: "var(--nm-text-secondary)",
                                margin: 0,
                                padding: "8px 10px",
                                background: "var(--nm-bg)",
                                border: "2px solid var(--nm-text-tertiary)",
                                fontFamily: "Manrope, sans-serif",
                              }}>
                                <strong>Current: </strong>
                                <span style={{ textDecoration: "line-through" }}>
                                  {issue.originalText.length > 150
                                    ? issue.originalText.slice(0, 150) + "..."
                                    : issue.originalText}
                                </span>
                              </p>
                            )}
                            <p style={{
                              fontSize: "0.9rem",
                              color: "var(--nm-success)",
                              margin: 0,
                              padding: "10px 12px",
                              background: "var(--nm-success-surface)",
                              border: "2px solid var(--nm-success)",
                              fontFamily: "Manrope, sans-serif",
                              fontWeight: 500,
                              lineHeight: 1.6,
                            }}>
                              <strong>Suggested: </strong> {issue.improvedText}
                            </p>
                          </div>
                        </div>
                      ))}

                      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
                        <BrutalButton onClick={handleApplySelected} variant="primary">
                          <CheckCircle2 size={16} strokeWidth={2.5} />
                          Apply Selected
                        </BrutalButton>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* General Advice */}
              {analysis.generalAdvice && analysis.generalAdvice.length > 0 && (
                <div
                  style={{
                    ...cardStyle,
                    background: "var(--nm-surface-low)",
                  }}
                >
                  <h4 style={{ ...headingStyle, fontSize: "0.9rem", marginBottom: "14px" }}>
                    General Recommendations
                  </h4>
                  <ol style={{
                    margin: 0,
                    paddingLeft: "20px",
                    fontSize: "0.9rem",
                    color: "var(--nm-text-primary)",
                    lineHeight: 1.7,
                    fontFamily: "Manrope, sans-serif",
                    fontWeight: 500,
                  }}>
                    {analysis.generalAdvice.map((advice, idx) => (
                      <li key={idx} style={{ marginBottom: "8px" }}>{advice}</li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Footer */}
              <div style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
                justifyContent: "flex-end",
                paddingTop: "12px",
                borderTop: "4px solid var(--nm-ink)",
              }}>
                <BrutalButton onClick={onClose} variant="secondary">Close</BrutalButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Reusable Brutal Button ───────────────────────────────────────────
function BrutalButton({ onClick, variant = "primary", children }) {
  const variants = {
    primary: { bg: "var(--nm-primary)", color: "#fff", border: "var(--nm-ink)" },
    secondary: { bg: "var(--nm-surface)", color: "var(--nm-text-primary)", border: "var(--nm-ink)" },
    white: { bg: "#fff", color: "var(--nm-ink)", border: "var(--nm-ink)" },
  };
  const v = variants[variant];

  return (
    <button
      onClick={onClick}
      style={{
        padding: "12px 20px",
        background: v.bg,
        color: v.color,
        border: `4px solid ${v.border}`,
        boxShadow: `4px 4px 0 ${v.border}`,
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 700,
        fontSize: "0.85rem",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        cursor: "pointer",
        borderRadius: "0px",
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translate(-2px, -2px)";
        e.currentTarget.style.boxShadow = `6px 6px 0 ${v.border}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translate(0, 0)";
        e.currentTarget.style.boxShadow = `4px 4px 0 ${v.border}`;
      }}
    >
      {children}
    </button>
  );
}