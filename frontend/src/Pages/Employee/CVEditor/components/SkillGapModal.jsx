import React, { useState, useRef, useEffect } from "react";
import { X, Send, Loader2, Target, AlertTriangle, CheckCircle2, Lightbulb, Bot, User } from "lucide-react";

const STEPS = {
  TARGET_ROLE: "target_role",
  ADDITIONAL_INFO: "additional_info",
  ANALYZING: "analyzing",
  RESULTS: "results",
};

export default function SkillGapModal({ show, cvData, onClose, onAnalyze }) {
  const [step, setStep] = useState(STEPS.TARGET_ROLE);
  const [targetRole, setTargetRole] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (show) {
      setStep(STEPS.TARGET_ROLE);
      setTargetRole("");
      setAdditionalInfo("");
      setResult(null);
      setError("");
    }
  }, [show]);

  const handleStartAnalysis = async () => {
    setStep(STEPS.ANALYZING);
    setError("");
    try {
      const res = await onAnalyze({
        targetRole,
        additionalInfo,
        cvData,
      });
      setResult(res);
      setStep(STEPS.RESULTS);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Analysis failed. Please try again.");
      setStep(STEPS.ADDITIONAL_INFO);
    }
  };

  if (!show) return null;

  const cvSummary = cvData
    ? [
        cvData.jobTitle && `Title: ${cvData.jobTitle}`,
        cvData.technicalSkills?.length && `Tech Skills: ${cvData.technicalSkills.filter(Boolean).join(", ")}`,
        cvData.softSkills?.length && `Soft Skills: ${cvData.softSkills.filter(Boolean).join(", ")}`,
        cvData.experience?.length && `Experience: ${cvData.experience.length} role(s)`,
        cvData.education?.length && `Education: ${cvData.education.length} entry(ies)`,
        cvData.language?.length && `Languages: ${cvData.language.map(l => typeof l === "string" ? l : l.name).join(", ")}`,
      ].filter(Boolean)
    : [];

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(27,28,21,0.4)", backdropFilter: "blur(8px)", zIndex: 9200, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "640px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          background: "var(--nm-bg)",
          border: "4px solid var(--nm-ink)",
          boxShadow: "10px 10px 0 var(--nm-ink)",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "4px solid var(--nm-ink)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: 40, height: 40, background: "var(--nm-primary)", border: "4px solid var(--nm-ink)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Target size={20} color="#fff" strokeWidth={2.5} />
            </div>
            <div>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "1.1rem", margin: 0 }}>
                Skill Gap Analysis
              </h2>
              <p style={{ margin: 0, color: "var(--nm-text-secondary)", fontSize: "0.8rem", fontFamily: "Manrope, sans-serif", fontWeight: 500, marginTop: 2 }}>
                Find what your CV is missing for your target role
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "var(--nm-surface)", border: "4px solid var(--nm-ink)", cursor: "pointer", padding: "6px", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "3px 3px 0 var(--nm-ink)" }}>
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            <ChatBubble type="bot">
              <p style={{ margin: 0, lineHeight: 1.6 }}>
                I'll analyze your CV against your target position to identify skill gaps. First, I've read your current CV:
              </p>
              {cvSummary.length > 0 && (
                <ul style={{ margin: "10px 0 0 0", paddingLeft: "16px", fontSize: "0.85rem", lineHeight: 1.8, color: "var(--nm-text-secondary)" }}>
                  {cvSummary.map((line, i) => <li key={i}>{line}</li>)}
                </ul>
              )}
            </ChatBubble>

            {step === STEPS.TARGET_ROLE && (
              <>
                <ChatBubble type="bot">
                  <p style={{ margin: 0, lineHeight: 1.6 }}>
                    What position are you trying to apply for? Be specific — e.g. "Senior React Developer", "Data Analyst", "Product Manager".
                  </p>
                </ChatBubble>
                <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && targetRole.trim()) {
                        setStep(STEPS.ADDITIONAL_INFO);
                      }
                    }}
                    placeholder="e.g. Senior Frontend Developer"
                    style={{
                      flex: 1,
                      padding: "12px 14px",
                      border: "3px solid var(--nm-ink)",
                      background: "var(--nm-surface)",
                      fontFamily: "Manrope, sans-serif",
                      fontSize: "0.9rem",
                      color: "var(--nm-text-primary)",
                      outline: "none",
                    }}
                    autoFocus
                  />
                  <button
                    onClick={() => { if (targetRole.trim()) setStep(STEPS.ADDITIONAL_INFO); }}
                    disabled={!targetRole.trim()}
                    style={{
                      padding: "12px 16px",
                      background: "var(--nm-primary)",
                      color: "#fff",
                      border: "3px solid var(--nm-ink)",
                      boxShadow: "3px 3px 0 var(--nm-ink)",
                      cursor: targetRole.trim() ? "pointer" : "not-allowed",
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      textTransform: "uppercase",
                      opacity: targetRole.trim() ? 1 : 0.5,
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      flexShrink: 0,
                    }}
                  >
                    <Send size={14} /> Next
                  </button>
                </div>
              </>
            )}

            {step === STEPS.ADDITIONAL_INFO && (
              <>
                <ChatBubble type="user">
                  Target role: <strong>{targetRole}</strong>
                </ChatBubble>
                <ChatBubble type="bot">
                  <p style={{ margin: 0, lineHeight: 1.6 }}>
                    Great choice. Anything else that would help me give a more accurate analysis? For example:
                  </p>
                  <ul style={{ margin: "8px 0 0 0", paddingLeft: "16px", fontSize: "0.85rem", lineHeight: 1.8, color: "var(--nm-text-secondary)" }}>
                    <li>Specific company or industry you're targeting</li>
                    <li>Required years of experience</li>
                    <li>Technologies or certifications you know are required</li>
                    <li>Any job description you already have</li>
                  </ul>
                  <p style={{ margin: "8px 0 0 0", color: "var(--nm-text-tertiary)", fontSize: "0.8rem" }}>
                    Leave empty if you want a general analysis.
                  </p>
                </ChatBubble>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <textarea
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                    placeholder="Any additional context (optional)..."
                    style={{
                      padding: "12px 14px",
                      border: "3px solid var(--nm-ink)",
                      background: "var(--nm-surface)",
                      fontFamily: "Manrope, sans-serif",
                      fontSize: "0.9rem",
                      color: "var(--nm-text-primary)",
                      outline: "none",
                      minHeight: "80px",
                      resize: "vertical",
                    }}
                  />
                  <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                    <button
                      onClick={() => setStep(STEPS.TARGET_ROLE)}
                      style={{
                        padding: "10px 16px",
                        background: "var(--nm-surface)",
                        color: "var(--nm-text-primary)",
                        border: "3px solid var(--nm-ink)",
                        boxShadow: "3px 3px 0 var(--nm-ink)",
                        cursor: "pointer",
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontWeight: 700,
                        fontSize: "0.8rem",
                        textTransform: "uppercase",
                      }}
                    >
                      Back
                    </button>
                    <button
                      onClick={handleStartAnalysis}
                      style={{
                        padding: "10px 20px",
                        background: "var(--nm-primary)",
                        color: "#fff",
                        border: "3px solid var(--nm-ink)",
                        boxShadow: "3px 3px 0 var(--nm-ink)",
                        cursor: "pointer",
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        textTransform: "uppercase",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <Target size={14} strokeWidth={2.5} /> Analyze Gaps
                    </button>
                  </div>
                </div>
              </>
            )}

            {step === STEPS.ANALYZING && (
              <ChatBubble type="bot">
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <Loader2 size={20} className="animate-spin" />
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Analyzing your CV against {targetRole}...
                  </span>
                </div>
              </ChatBubble>
            )}

            {step === STEPS.RESULTS && result && (
              <ResultsView result={result} targetRole={targetRole} />
            )}

            {error && (
              <div style={{ padding: "12px 16px", background: "var(--nm-error-surface)", border: "3px solid var(--nm-error)", display: "flex", alignItems: "center", gap: "10px" }}>
                <AlertTriangle size={18} color="var(--nm-error)" />
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "0.85rem", color: "var(--nm-error)", textTransform: "uppercase" }}>{error}</span>
              </div>
            )}
          </div>
        </div>

        {step === STEPS.RESULTS && (
          <div style={{ padding: "16px 24px", borderTop: "4px solid var(--nm-ink)", display: "flex", justifyContent: "flex-end", gap: "10px", flexShrink: 0 }}>
            <button
              onClick={() => { setStep(STEPS.TARGET_ROLE); setTargetRole(""); setAdditionalInfo(""); setResult(null); }}
              style={{ padding: "10px 16px", background: "var(--nm-surface)", color: "var(--nm-text-primary)", border: "3px solid var(--nm-ink)", boxShadow: "3px 3px 0 var(--nm-ink)", cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase" }}
            >
              New Analysis
            </button>
            <button
              onClick={onClose}
              style={{ padding: "10px 20px", background: "var(--nm-primary)", color: "#fff", border: "3px solid var(--nm-ink)", boxShadow: "3px 3px 0 var(--nm-ink)", cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "0.85rem", textTransform: "uppercase" }}
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ChatBubble({ type, children }) {
  const isBot = type === "bot";
  return (
    <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
      <div style={{
        width: 28, height: 28, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
        background: isBot ? "var(--nm-primary)" : "var(--nm-surface-high)",
        border: "3px solid var(--nm-ink)",
      }}>
        {isBot ? <Bot size={14} color="#fff" /> : <User size={14} />}
      </div>
      <div style={{
        flex: 1,
        padding: "12px 16px",
        background: isBot ? "var(--nm-surface-low)" : "var(--nm-surface-high)",
        border: isBot ? "2px solid var(--nm-ink)" : "3px solid var(--nm-ink)",
        fontFamily: "Manrope, sans-serif",
        fontSize: "0.9rem",
        color: "var(--nm-text-primary)",
      }}>
        {children}
      </div>
    </div>
  );
}

function ResultsView({ result, targetRole }) {
  const sections = result.sections || [];
  const overallMatch = result.overallMatch ?? null;
  const summary = result.summary || "";

  const getStatusColor = (severity) => {
    switch (severity) {
      case "critical": return { bg: "var(--nm-error-surface)", color: "var(--nm-error)", icon: <AlertTriangle size={18} /> };
      case "moderate": return { bg: "var(--nm-warning-surface)", color: "var(--nm-warning)", icon: <Lightbulb size={18} /> };
      case "good": return { bg: "var(--nm-success-surface)", color: "var(--nm-success)", icon: <CheckCircle2 size={18} /> };
      default: return { bg: "var(--nm-surface-low)", color: "var(--nm-text-primary)", icon: <CheckCircle2 size={18} /> };
    }
  };

  return (
    <>
      <ChatBubble type="bot">
        <p style={{ margin: 0, lineHeight: 1.6 }}>
          Analysis complete for <strong>{targetRole}</strong>. Here's what I found:
        </p>
      </ChatBubble>

      {overallMatch !== null && (
        <div style={{
          padding: "20px",
          background: "var(--nm-surface)",
          border: "4px solid var(--nm-ink)",
          boxShadow: "6px 6px 0 var(--nm-ink)",
          textAlign: "center",
        }}>
          <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "0.8rem", margin: 0, color: "var(--nm-text-tertiary)" }}>
            Current Match for {targetRole}
          </p>
          <p style={{ fontSize: "3rem", fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif", margin: "8px 0 0 0", lineHeight: 1 }}>
            {overallMatch}%
          </p>
        </div>
      )}

      {summary && (
        <ChatBubble type="bot">
          <p style={{ margin: 0, lineHeight: 1.7 }}>{summary}</p>
        </ChatBubble>
      )}

      {sections.map((section, idx) => {
        const sc = getStatusColor(section.severity);
        return (
          <div key={idx} style={{
            padding: "16px",
            background: sc.bg,
            border: `3px solid ${sc.color}`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: section.details ? "10px" : 0 }}>
              <div style={{ color: sc.color }}>{sc.icon}</div>
              <h4 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", fontSize: "0.85rem", margin: 0 }}>
                {section.title}
              </h4>
              {section.matchPercent != null && (
                <span style={{
                  marginLeft: "auto",
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 800,
                  fontSize: "0.8rem",
                  padding: "4px 10px",
                  background: sc.color,
                  color: "#fff",
                  border: `2px solid var(--nm-ink)`,
                }}>
                  {section.matchPercent}%
                </span>
              )}
            </div>
            {section.details && (
              <p style={{ margin: 0, fontSize: "0.85rem", lineHeight: 1.7, fontFamily: "Manrope, sans-serif", fontWeight: 500, paddingLeft: "28px" }}>
                {section.details}
              </p>
            )}
            {section.missingItems?.length > 0 && (
              <div style={{ marginTop: "8px", paddingLeft: "28px" }}>
                <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 6px 0", color: sc.color }}>
                  Missing / Weak:
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {section.missingItems.map((item, i) => (
                    <span key={i} style={{
                      padding: "4px 10px",
                      background: "var(--nm-bg)",
                      border: `2px solid ${sc.color}`,
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      color: sc.color,
                    }}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {section.recommendations?.length > 0 && (
              <div style={{ marginTop: "8px", paddingLeft: "28px" }}>
                <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 6px 0", color: "var(--nm-success)" }}>
                  Recommendations:
                </p>
                <ul style={{ margin: 0, paddingLeft: "14px", fontSize: "0.85rem", lineHeight: 1.7, fontFamily: "Manrope, sans-serif" }}>
                  {section.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                </ul>
              </div>
            )}
          </div>
        );
      })}

      {result.actionPlan?.length > 0 && (
        <div style={{ padding: "16px", background: "var(--nm-surface)", border: "3px solid var(--nm-primary)" }}>
          <h4 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "0.85rem", margin: "0 0 10px 0", color: "var(--nm-primary)" }}>
            Action Plan
          </h4>
          <ol style={{ margin: 0, paddingLeft: "18px", fontSize: "0.85rem", lineHeight: 1.8, fontFamily: "Manrope, sans-serif" }}>
            {result.actionPlan.map((step, i) => <li key={i}>{step}</li>)}
          </ol>
        </div>
      )}
    </>
  );
}
