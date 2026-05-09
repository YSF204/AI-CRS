import React, { useState, useEffect, useMemo } from "react";
import { X, Sparkles } from "lucide-react";
import LivePreview from "./LivePreview";
import AnalysisResults from "./AnalysisResults";

export default function AnalysisModal({
  show,
  analysis,
  currentData,
  userName,
  templateId,
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

  const highlights = useMemo(() => {
    if (!analysis?.issues) return {};
    const h = {};
    analysis.issues.forEach(issue => {
      if (issue.improvedText) {
        h[issue.fieldId] = 'suggestion';
      } else {
        h[issue.fieldId] = 'warning';
      }
    });
    return h;
  }, [analysis]);

  if (!show || !analysis) return null;

  const handleCheckboxChange = (fieldId, checked) => {
    setSelectedUpdates((prev) => ({ ...prev, [fieldId]: checked }));
  };

  const handleApplyAll = () => {
    const updatesToApply = {};
    if (analysis.issues) {
      analysis.issues.forEach((issue) => {
        if (issue.improvedText || issue.fieldId) {
          updatesToApply[issue.fieldId] = issue.improvedText || "__DELETE__";
        }
      });
    }
    onApply(updatesToApply);
  };

  const handleApplySelected = () => {
    const updatesToApply = {};
    if (analysis.issues) {
      analysis.issues.forEach((issue) => {
        if (selectedUpdates[issue.fieldId]) {
          updatesToApply[issue.fieldId] = issue.improvedText || "__DELETE__";
        }
      });
    }
    onApply(updatesToApply);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        backdropFilter: "blur(4px)",
        zIndex: 9200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1400px",
          height: "90vh",
          background: "var(--nm-bg)",
          border: "4px solid var(--nm-ink)",
          boxShadow: "12px 12px 0 var(--nm-ink)",
          display: "flex",
          flexDirection: "row",
          overflow: "hidden",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            width: "35%",
            height: "100%",
            overflowY: "auto",
            borderRight: "4px solid var(--nm-ink)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ padding: "28px" }}>
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
                  <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "1.4rem", margin: 0 }}>
                    CV Analysis
                  </h2>
                  <p style={{ margin: 0, color: "var(--nm-text-secondary)", fontSize: "0.85rem", fontFamily: "Manrope, sans-serif", fontWeight: 500, marginTop: 2 }}>
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

            <AnalysisResults
              analysis={analysis}
              selectedUpdates={selectedUpdates}
              showImprovements={showImprovements}
              onCheckboxChange={handleCheckboxChange}
              onToggleImprovements={() => setShowImprovements(!showImprovements)}
              onApplyAll={handleApplyAll}
              onApplySelected={handleApplySelected}
              onClose={onClose}
            />
          </div>
        </div>

        <div
          style={{
            width: "65%",
            height: "100%",
            background: "var(--nm-surface-high)",
            position: "relative",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <LivePreview
            formData={currentData}
            userName={userName}
            templateId={templateId}
            highlights={highlights}
            zoom={0.72}
          />
        </div>
      </div>
    </div>
  );
}
