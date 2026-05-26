import React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  Bot,
  User,
} from "lucide-react";

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

export { ChatBubble };

export default function SkillGapResults({ result, targetRole }) {
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
