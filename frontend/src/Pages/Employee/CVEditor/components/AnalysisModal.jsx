import React, { useState, useEffect } from "react";
import { X, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

export default function AnalysisModal({
  show,
  analysis,
  currentData,
  onClose,
  onApply,
}) {
  const [selectedUpdates, setSelectedUpdates] = useState({});

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

  const isNewFormat = !!analysis.sections;
  const sectionLabel =
    analysis.section === "fullCv" ? "Full CV" : analysis.section;

  // Determine color based on score
  const getScoreColor = (score) => {
    if (score < 40)
      return { bg: "#fee2e2", text: "#b91c1c", border: "#fca5a5" };
    if (score < 70)
      return { bg: "#fef3c7", text: "#92400e", border: "#fcd34d" };
    return { bg: "#dcfce7", text: "#166534", border: "#86efac" };
  };

  const scoreColor = getScoreColor(
    analysis.overallScore ?? analysis.atsScore ?? 0,
  );

  const handleCheckboxChange = (fieldId, checked) => {
    setSelectedUpdates((prev) => ({ ...prev, [fieldId]: checked }));
  };

  const handleApply = () => {
    const updatesToApply = {};
    if (analysis.issues) {
      analysis.issues.forEach((issue) => {
        if (selectedUpdates[issue.fieldId]) {
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
        word === "0" || word === "1" || word === "2"
          ? `#${parseInt(word) + 1}`
          : word.charAt(0).toUpperCase() + word.slice(1),
      )
      .join(" ")
      .replace("Items", "Item");
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(10,10,10,0.18)",
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
          maxHeight: "85vh",
          overflowY: "auto",
          background: "#f8f7f2",
          borderRadius: "20px",
          boxShadow: "0 22px 70px rgba(0,0,0,0.18)",
        }}
      >
        <div style={{ padding: "24px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              marginBottom: "18px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Sparkles size={24} color="#0a0a0a" />
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "1.35rem",
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 900,
                    letterSpacing: "0.08em",
                  }}
                >
                  CV Analysis
                </h2>
                <p style={{ margin: 0, color: "#4b4b4b", fontSize: "0.95rem" }}>
                  Professional review of your CV
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "8px",
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* New structured format */}
          {isNewFormat && (
            <div style={{ display: "grid", gap: "18px" }}>
              {/* Overall Score */}
              <div
                style={{
                  padding: "20px",
                  background: scoreColor.bg,
                  border: `2px solid ${scoreColor.border}`,
                  borderRadius: "16px",
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.9rem",
                    color: scoreColor.text,
                    fontWeight: 600,
                  }}
                >
                  Overall Completeness Score
                </p>
                <p
                  style={{
                    margin: "8px 0 0 0",
                    fontSize: "2.5rem",
                    fontWeight: 900,
                    color: scoreColor.text,
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  {analysis.overallScore}%
                </p>
              </div>

              {/* Sections */}
              <div style={{ display: "grid", gap: "12px" }}>
                {analysis.sections?.map((section, idx) => {
                  const isGood = section.status === "Good";
                  const isEmpty = section.status === "Empty";
                  const needsAttention = section.status === "Needs Attention";

                  const statusColor = isEmpty
                    ? "#dc2626"
                    : needsAttention
                      ? "#f97316"
                      : "#16a34a";
                  const statusBg = isEmpty
                    ? "#fee2e2"
                    : needsAttention
                      ? "#fef3c7"
                      : "#dcfce7";

                  return (
                    <div
                      key={idx}
                      style={{
                        border: "1px solid #e5e7eb",
                        borderRadius: "12px",
                        padding: "16px",
                        background: "#ffffff",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          marginBottom: "12px",
                        }}
                      >
                        {isEmpty ? (
                          <AlertCircle size={20} color={statusColor} />
                        ) : isGood ? (
                          <CheckCircle2 size={20} color={statusColor} />
                        ) : (
                          <AlertCircle size={20} color={statusColor} />
                        )}
                        <h4
                          style={{
                            margin: 0,
                            fontSize: "1rem",
                            fontWeight: 700,
                            color: "#0a0a0a",
                          }}
                        >
                          {section.name}
                        </h4>
                        <span
                          style={{
                            marginLeft: "auto",
                            background: statusBg,
                            color: statusColor,
                            padding: "4px 12px",
                            borderRadius: "20px",
                            fontSize: "0.85rem",
                            fontWeight: 600,
                          }}
                        >
                          {section.status}
                        </span>
                      </div>

                      {section.suggestions &&
                        section.suggestions.length > 0 && (
                          <ul
                            style={{
                              margin: 0,
                              paddingLeft: "24px",
                              fontSize: "0.9rem",
                              color: "#4b4b4b",
                              lineHeight: "1.6",
                            }}
                          >
                            {section.suggestions.map((suggestion, sidx) => (
                              <li key={sidx} style={{ marginBottom: "8px" }}>
                                {suggestion}
                              </li>
                            ))}
                          </ul>
                        )}
                    </div>
                  );
                })}
              </div>

              {/* General Advice */}
              {analysis.generalAdvice && analysis.generalAdvice.length > 0 && (
                <div
                  style={{
                    padding: "16px",
                    background: "#f0f9ff",
                    border: "1px solid rgba(0,123,255,0.18)",
                    borderRadius: "12px",
                  }}
                >
                  <h4
                    style={{
                      margin: "0 0 12px 0",
                      fontSize: "0.95rem",
                      fontWeight: 700,
                      color: "#0c2d6b",
                    }}
                  >
                    General Recommendations
                  </h4>
                  <ol
                    style={{
                      margin: 0,
                      paddingLeft: "20px",
                      fontSize: "0.9rem",
                      color: "#4b4b4b",
                      lineHeight: "1.6",
                    }}
                  >
                    {analysis.generalAdvice.map((advice, idx) => (
                      <li key={idx} style={{ marginBottom: "8px" }}>
                        {advice}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}

          {/* Old format - for backward compatibility */}
          {!isNewFormat && (
            <div style={{ display: "grid", gap: "18px" }}>
              {!analysis.issues || analysis.issues.length === 0 ? (
                <div
                  style={{
                    padding: "18px",
                    background: "#ffffff",
                    borderRadius: "16px",
                    border: "1px solid rgba(0,0,0,0.08)",
                  }}
                >
                  <p style={{ margin: 0, color: "#333", lineHeight: 1.8 }}>
                    Great job! No specific issues were found. Your CV looks
                    well-structured and professionally written.
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    padding: "18px",
                    background: "#f0f9ff",
                    borderRadius: "16px",
                    border: "1px solid rgba(0,123,255,0.18)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "16px",
                    }}
                  >
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "1.05rem",
                        fontWeight: 700,
                      }}
                    >
                      Actionable Improvements
                    </h3>
                    {analysis.atsScore != null && (
                      <span
                        style={{
                          background:
                            analysis.atsScore >= 80
                              ? "#166534"
                              : analysis.atsScore >= 60
                                ? "#ca8a04"
                                : "#b91c1c",
                          color: "#fff",
                          padding: "4px 10px",
                          borderRadius: "12px",
                          fontSize: "0.85rem",
                          fontWeight: 700,
                        }}
                      >
                        ATS: {analysis.atsScore}%
                      </span>
                    )}
                  </div>
                  {analysis.atsFeedback && (
                    <p
                      style={{
                        margin: "0 0 16px 0",
                        fontSize: "0.95rem",
                        color: "#333",
                        background: "#fff",
                        padding: "12px",
                        borderRadius: "8px",
                        border: "1px solid #ddd",
                      }}
                    >
                      {analysis.atsFeedback}
                    </p>
                  )}
                  <div style={{ display: "grid", gap: "16px" }}>
                    {analysis.issues.map((issue) => (
                      <div
                        key={issue.fieldId}
                        style={{
                          border: "1px solid #ddd",
                          padding: "16px",
                          borderRadius: "12px",
                          background: "#fff",
                        }}
                      >
                        <label
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            cursor: "pointer",
                            marginBottom: "10px",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={selectedUpdates[issue.fieldId] || false}
                            onChange={(e) =>
                              handleCheckboxChange(
                                issue.fieldId,
                                e.target.checked,
                              )
                            }
                            style={{
                              width: "18px",
                              height: "18px",
                              cursor: "pointer",
                              accentColor: "#ffe630",
                            }}
                          />
                          <strong style={{ fontSize: "0.95rem" }}>
                            {formatFieldId(issue.fieldId)}
                          </strong>
                        </label>

                        <div
                          style={{
                            display: "grid",
                            gap: "12px",
                            paddingLeft: "28px",
                          }}
                        >
                          <p
                            style={{
                              fontSize: "0.9rem",
                              color: "#b91c1c",
                              margin: 0,
                              padding: "8px",
                              background: "#fef2f2",
                              borderRadius: "6px",
                            }}
                          >
                            <strong>Needs Work:</strong> {issue.reason}
                          </p>
                          <p
                            style={{
                              fontSize: "0.9rem",
                              color: "#666",
                              margin: 0,
                            }}
                          >
                            <del>{issue.originalText}</del>
                          </p>
                          <p
                            style={{
                              fontSize: "0.95rem",
                              color: "#166534",
                              margin: 0,
                              padding: "8px",
                              background: "#f0fdf4",
                              borderRadius: "6px",
                            }}
                          >
                            <strong>Suggested:</strong> {issue.improvedText}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  flexWrap: "wrap",
                  justifyContent: "flex-end",
                  paddingTop: "10px",
                  borderTop: "1px solid rgba(0,0,0,0.08)",
                }}
              >
                {analysis.issues && analysis.issues.length > 0 && (
                  <button
                    onClick={handleApply}
                    className="brutal-btn px-5 py-3"
                    style={{
                      background: "#ffe630",
                      color: "#0a0a0a",
                      border: "2px solid #0a0a0a",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <CheckCircle2 size={16} /> Apply Selected Changes
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="brutal-btn px-5 py-3"
                  style={{
                    background: "#ffffff",
                    color: "#0a0a0a",
                    border: "1px solid rgba(0,0,0,0.12)",
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
