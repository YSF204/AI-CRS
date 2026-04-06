import React, { useState, useEffect } from "react";
import { X, Check, Sparkles } from "lucide-react";

export default function AnalysisModal({
  show,
  analysis,
  currentData,
  onClose,
  onApply,
}) {
  const [selectedUpdates, setSelectedUpdates] = useState({});

  // Initialize selectedUpdates when analysis changes
  useEffect(() => {
    if (analysis?.fieldUpdates) {
      const initialSelected = Object.keys(analysis.fieldUpdates).reduce(
        (acc, key) => {
          acc[key] = true; // Select all by default
          return acc;
        },
        {},
      );
      setSelectedUpdates(initialSelected);
    }
  }, [analysis]);

  if (!show || !analysis) return null;

  const sectionLabel =
    analysis.section === "fullCv"
      ? "Full CV"
      : analysis.section
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase());

  const handleCheckboxChange = (key, checked) => {
    setSelectedUpdates((prev) => ({ ...prev, [key]: checked }));
  };

  const handleApply = () => {
    const updatesToApply = {};
    Object.keys(selectedUpdates).forEach((key) => {
      if (selectedUpdates[key] && analysis.fieldUpdates[key]) {
        updatesToApply[key] = analysis.fieldUpdates[key];
      }
    });
    onApply({ ...analysis, fieldUpdates: updatesToApply });
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
                  CV Review
                </h2>
                <p style={{ margin: 0, color: "#4b4b4b", fontSize: "0.95rem" }}>
                  Helpful recommendations for your {sectionLabel}.
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

          <div style={{ display: "grid", gap: "18px" }}>
            <div
              style={{
                padding: "18px",
                background: "#ffffff",
                borderRadius: "16px",
                border: "1px solid rgba(0,0,0,0.08)",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  marginBottom: "10px",
                  fontSize: "1rem",
                  fontWeight: 700,
                }}
              >
                Suggestions
              </h3>
              <p style={{ margin: 0, color: "#333", lineHeight: 1.8 }}>
                {analysis.suggestions ||
                  "Your CV looks well structured. Use these suggestions to refine your wording and impact."}
              </p>
            </div>

            {analysis.improvements && (
              <div
                style={{
                  padding: "18px",
                  background: "#ffffff",
                  borderRadius: "16px",
                  border: "1px solid rgba(0,0,0,0.08)",
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    marginBottom: "10px",
                    fontSize: "1rem",
                    fontWeight: 700,
                  }}
                >
                  Improvements
                </h3>
                <p style={{ margin: 0, color: "#333", lineHeight: 1.8 }}>
                  {analysis.improvements}
                </p>
              </div>
            )}

            {analysis.spellingCorrections?.length > 0 && (
              <div
                style={{
                  padding: "18px",
                  background: "#fff6f1",
                  borderRadius: "16px",
                  border: "1px solid rgba(255,130,0,0.18)",
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    marginBottom: "10px",
                    fontSize: "1rem",
                    fontWeight: 700,
                  }}
                >
                  Spelling corrections
                </h3>
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: "20px",
                    color: "#333",
                    lineHeight: 1.7,
                  }}
                >
                  {analysis.spellingCorrections.map((correction, index) => (
                    <li key={index}>
                      <strong>{correction.original}</strong> →{" "}
                      {correction.corrected}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.fieldUpdates &&
              Object.keys(analysis.fieldUpdates).length > 0 && (
                <div
                  style={{
                    padding: "18px",
                    background: "#f0f9ff",
                    borderRadius: "16px",
                    border: "1px solid rgba(0,123,255,0.18)",
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      marginBottom: "10px",
                      fontSize: "1rem",
                      fontWeight: 700,
                    }}
                  >
                    Proposed Changes
                  </h3>
                  <div style={{ display: "grid", gap: "12px" }}>
                    {analysis.fieldUpdates.summary && (
                      <div
                        style={{
                          border: "1px solid #ddd",
                          padding: "10px",
                          borderRadius: "8px",
                        }}
                      >
                        <label
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={selectedUpdates.summary || false}
                            onChange={(e) =>
                              handleCheckboxChange("summary", e.target.checked)
                            }
                          />
                          <strong>Summary</strong>
                        </label>
                        <div style={{ marginTop: "8px" }}>
                          <p style={{ fontSize: "0.9rem", color: "#666" }}>
                            <strong>Current:</strong>{" "}
                            {currentData?.summary || "None"}
                          </p>
                          <p style={{ fontSize: "0.9rem", color: "#333" }}>
                            <strong>Proposed:</strong>{" "}
                            {analysis.fieldUpdates.summary}
                          </p>
                        </div>
                      </div>
                    )}
                    {analysis.fieldUpdates.jobTitle && (
                      <div
                        style={{
                          border: "1px solid #ddd",
                          padding: "10px",
                          borderRadius: "8px",
                        }}
                      >
                        <label
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={selectedUpdates.jobTitle || false}
                            onChange={(e) =>
                              handleCheckboxChange("jobTitle", e.target.checked)
                            }
                          />
                          <strong>Job Title</strong>
                        </label>
                        <div style={{ marginTop: "8px" }}>
                          <p style={{ fontSize: "0.9rem", color: "#666" }}>
                            <strong>Current:</strong>{" "}
                            {currentData?.jobTitle || "None"}
                          </p>
                          <p style={{ fontSize: "0.9rem", color: "#333" }}>
                            <strong>Proposed:</strong>{" "}
                            {analysis.fieldUpdates.jobTitle}
                          </p>
                        </div>
                      </div>
                    )}
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
                <Check size={16} /> Apply Selected Changes
              </button>
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
        </div>
      </div>
    </div>
  );
}
