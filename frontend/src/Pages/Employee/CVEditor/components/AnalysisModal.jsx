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

  const sectionLabel = analysis.section === "fullCv" ? "Full CV" : analysis.section;

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
    return id.split('_').map(word => 
      word === "0" || word === "1" || word === "2" ? `#${parseInt(word)+1}` : word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ').replace('Items', 'Item');
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
                  Actionable AI suggestions for your {sectionLabel}.
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
            {(!analysis.issues || analysis.issues.length === 0) ? (
               <div
                  style={{
                    padding: "18px",
                    background: "#ffffff",
                    borderRadius: "16px",
                    border: "1px solid rgba(0,0,0,0.08)",
                  }}
               >
                  <p style={{ margin: 0, color: "#333", lineHeight: 1.8 }}>
                    Great job! No specific issues were found. Your CV looks well-structured and professionally written.
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
                  <h3
                    style={{
                      margin: 0,
                      marginBottom: "16px",
                      fontSize: "1.05rem",
                      fontWeight: 700,
                    }}
                  >
                    Actionable Improvements
                  </h3>
                  <div style={{ display: "grid", gap: "16px" }}>
                    {analysis.issues.map((issue) => (
                      <div
                        key={issue.fieldId}
                        style={{
                          border: "1px solid #ddd",
                          padding: "16px",
                          borderRadius: "12px",
                          background: "#fff"
                        }}
                      >
                        <label
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            cursor: "pointer",
                            marginBottom: "10px"
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={selectedUpdates[issue.fieldId] || false}
                            onChange={(e) =>
                              handleCheckboxChange(issue.fieldId, e.target.checked)
                            }
                            style={{ 
                              width: "18px", 
                              height: "18px", 
                              cursor: "pointer",
                              accentColor: "#ffe630"
                            }}
                          />
                          <strong style={{ fontSize: "0.95rem" }}>{formatFieldId(issue.fieldId)}</strong>
                        </label>
                        
                        <div style={{ display: "grid", gap: "12px", paddingLeft: "28px" }}>
                          <p style={{ fontSize: "0.9rem", color: "#b91c1c", margin: 0, padding: "8px", background: "#fef2f2", borderRadius: "6px" }}>
                            <strong>Needs Work:</strong> {issue.reason}
                          </p>
                          <p style={{ fontSize: "0.9rem", color: "#666", margin: 0 }}>
                            <del>{issue.originalText}</del>
                          </p>
                          <p style={{ fontSize: "0.95rem", color: "#166534", margin: 0, padding: "8px", background: "#f0fdf4", borderRadius: "6px" }}>
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
                  <Check size={16} /> Apply Selected Changes
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
        </div>
      </div>
    </div>
  );
}
