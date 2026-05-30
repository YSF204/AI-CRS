import React, { useState, useRef, useEffect } from "react";
import {
  ArrowLeft, Save, Eye, Download, Layers, Sparkles,
  Clock, ChevronDown, Brain, Target, MoreHorizontal, Menu
} from "lucide-react";

/* ─── Mobile Action Bar ──────────────────────────────────────────────────── */
function MobileActionBar({
  form,
  saving,
  isAutoSaving,
  lastSavedAt,
  analyzing,
  downloadingPdf,
  atsScore,
  onSave,
  onAnalyze,
  onSkillGap,
  onPreview,
  onDownloadPdf,
  onChangeTemplate,
  onBack,
}) {
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);

  // Close "More" menu when clicking outside
  useEffect(() => {
    if (!moreOpen) return;
    const handler = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [moreOpen]);

  const formatLastSaved = (date) => {
    if (!date) return null;
    const diff = Math.floor((new Date() - date) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return date.toLocaleDateString();
  };

  const moreItems = [
    {
      icon: Brain,
      label: "CV Analysis",
      sub: "Review & improve",
      action: () => { setMoreOpen(false); onAnalyze(); },
      disabled: analyzing,
    },
    {
      icon: Target,
      label: "Skill Gap",
      sub: "Find missing skills",
      action: () => { setMoreOpen(false); onSkillGap(); },
      disabled: false,
    },
    {
      icon: Layers,
      label: "Template",
      sub: "Change CV template",
      action: () => { setMoreOpen(false); onChangeTemplate(); },
      disabled: false,
    },
    {
      icon: Download,
      label: downloadingPdf ? "Exporting…" : "Download PDF",
      sub: "Save as PDF file",
      action: () => { setMoreOpen(false); onDownloadPdf(); },
      disabled: downloadingPdf,
    },
  ];

  return (
    <div className="cv-mobile-action-bar" ref={moreRef}>
      {/* Back */}
      <button
        onClick={onBack}
        className="nm-btn"
        style={{ padding: "8px 10px", minHeight: 36, fontSize: 11, flexShrink: 0 }}
        aria-label="Back"
      >
        <ArrowLeft size={14} strokeWidth={3} />
      </button>

      {/* Title + autosave */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 900,
            fontSize: 12,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "var(--nm-text-primary)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {form.jobTitle || "UNTITLED CV"}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            marginTop: 1,
          }}
        >
          {atsScore !== undefined && atsScore !== null && (
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 700,
                fontSize: 8,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--nm-primary)",
                background: "var(--nm-surface-high)",
                padding: "1px 5px",
                border: "1.5px solid var(--nm-primary)",
                flexShrink: 0,
              }}
            >
              ATS {atsScore}%
            </span>
          )}
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 600,
              fontSize: 8,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "var(--nm-text-tertiary)",
              display: "flex",
              alignItems: "center",
              gap: 3,
            }}
          >
            <Clock size={8} strokeWidth={2.5} className={isAutoSaving ? "animate-pulse" : ""} />
            {isAutoSaving
              ? "Syncing…"
              : lastSavedAt
              ? formatLastSaved(lastSavedAt)
              : "Unsaved"}
          </span>
        </div>
      </div>

      {/* ⋯ More */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <button
          onClick={() => setMoreOpen((v) => !v)}
          className="nm-btn"
          style={{ padding: "8px 10px", minHeight: 36, fontSize: 11 }}
          aria-label="More options"
          aria-expanded={moreOpen}
        >
          <MoreHorizontal size={16} strokeWidth={2.5} />
        </button>

        {/* Dropdown — fixed so it always appears full-width below the bar */}
        {moreOpen && (
          <div
            style={{
              position: "fixed",
              top: 56,
              left: 0,
              right: 0,
              background: "var(--nm-bg)",
              border: "4px solid var(--nm-ink)",
              borderTop: "none",
              boxShadow: "0 8px 0 var(--nm-ink)",
              zIndex: 9999,
              overflow: "hidden",
            }}
          >
            {moreItems.map(({ icon: Icon, label, sub, action, disabled }) => (
              <button
                key={label}
                type="button"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  width: "100%",
                  padding: "14px 18px",
                  background: "transparent",
                  border: "none",
                  borderBottom: "2px solid var(--nm-ink)",
                  cursor: disabled ? "not-allowed" : "pointer",
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--nm-text-primary)",
                  opacity: disabled ? 0.4 : 1,
                  textAlign: "left",
                }}
                onClick={disabled ? undefined : action}
                disabled={disabled}
              >
                <Icon size={16} strokeWidth={2.5} style={{ color: "var(--nm-primary)", flexShrink: 0 }} />
                <div>
                  <div>{label}</div>
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 500,
                      color: "var(--nm-text-tertiary)",
                      textTransform: "none",
                      letterSpacing: 0,
                      marginTop: 2,
                    }}
                  >
                    {sub}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Save */}
      <button
        onClick={onSave}
        disabled={saving}
        className="nm-btn nm-btn-primary"
        style={{ padding: "8px 14px", minHeight: 36, fontSize: 11, flexShrink: 0 }}
      >
        <Save size={13} strokeWidth={2.5} />
        {saving ? "…" : "Save"}
      </button>
    </div>
  );
}

/* ─── Desktop Action Bar (unchanged) ────────────────────────────────────── */
function DesktopActionBar({
  form,
  saving,
  isAutoSaving,
  lastSavedAt,
  analyzing,
  downloadingPdf,
  atsScore,
  onSave,
  onAnalyze,
  onSkillGap,
  onPreview,
  onDownloadPdf,
  onChangeTemplate,
  onBack,
}) {
  const [aiMenuOpen, setAiMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!aiMenuOpen) return;
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setAiMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [aiMenuOpen]);

  const formatLastSaved = (date) => {
    if (!date) return null;
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return date.toLocaleDateString();
  };

  const btnStyle = {
    padding: "8px 16px",
    minHeight: "40px",
    fontSize: "12px",
    background: "var(--nm-surface-high)",
  };

  return (
    <div
      className="flex-shrink-0 flex items-center gap-4 px-6 py-4 border-b-4 border-[var(--nm-ink)] bg-[var(--nm-surface)] relative"
      style={{ zIndex: 9999 }}
    >
      <button onClick={onBack} className="nm-btn" style={btnStyle}>
        <ArrowLeft size={14} strokeWidth={3} /> Back
      </button>
      <div className="flex-1">
        <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--nm-text-tertiary)] font-bold">
          Active Workspace
        </div>
        <div className="font-[var(--font-display)] font-black text-lg tracking-tight text-[var(--nm-text-primary)] uppercase">
          {form.jobTitle || "UNTITLED_CV.DRF"}
        </div>
      </div>

      <div className="flex items-center gap-4 mr-4 flex-wrap">
        {atsScore !== undefined && atsScore !== null && (
          <div className="nm-chip nm-chip-primary" style={{ padding: "6px 12px", fontSize: "11px" }}>
            ATS QUALITY: {atsScore}%
          </div>
        )}
        <div className="flex items-center gap-2 font-mono text-[10px] text-[var(--nm-text-tertiary)] uppercase font-bold">
          <Clock size={12} className={isAutoSaving ? "animate-pulse" : ""} strokeWidth={2.5} />
          {isAutoSaving
            ? "Syncing..."
            : lastSavedAt
            ? `Last Sync: ${formatLastSaved(lastSavedAt)}`
            : "Not Synced"}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative" style={{ zIndex: 9999 }} ref={menuRef}>
          <button
            onClick={() => setAiMenuOpen((v) => !v)}
            disabled={analyzing}
            className="nm-btn flex items-center gap-2"
            style={btnStyle}
          >
            <Sparkles size={14} strokeWidth={2.5} />
            <span>AI TOOLS</span>
            <ChevronDown
              size={14}
              strokeWidth={2.5}
              style={{
                transition: "transform 0.2s ease",
                transform: aiMenuOpen ? "rotate(180deg)" : "rotate(0deg)",
              }}
            />
          </button>

          <div
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              right: 0,
              minWidth: "220px",
              background: "var(--nm-bg)",
              border: "4px solid var(--nm-ink)",
              boxShadow: "6px 6px 0 var(--nm-ink)",
              zIndex: 10000,
              overflow: "hidden",
              transformOrigin: "top right",
              transform: aiMenuOpen ? "scaleY(1) translateY(0)" : "scaleY(0) translateY(-4px)",
              opacity: aiMenuOpen ? 1 : 0,
              transition: "transform 0.18s cubic-bezier(0.2, 0, 0, 1), opacity 0.15s ease",
            }}
          >
            <button
              onClick={() => { setAiMenuOpen(false); onAnalyze(); }}
              style={{
                display: "flex", alignItems: "center", gap: "10px",
                width: "100%", padding: "12px 16px",
                background: "transparent", border: "none",
                borderBottom: "3px solid var(--nm-ink)", cursor: "pointer",
                fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700,
                fontSize: "0.8rem", textTransform: "uppercase",
                letterSpacing: "0.06em", color: "var(--nm-text-primary)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--nm-surface-high)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              <Brain size={16} strokeWidth={2.5} />
              <div style={{ textAlign: "left" }}>
                <div>CV Analysis</div>
                <div style={{ fontSize: "0.65rem", fontWeight: 500, color: "var(--nm-text-tertiary)", textTransform: "none" }}>
                  Review &amp; improve your CV
                </div>
              </div>
            </button>
            <button
              onClick={() => { setAiMenuOpen(false); onSkillGap(); }}
              style={{
                display: "flex", alignItems: "center", gap: "10px",
                width: "100%", padding: "12px 16px",
                background: "transparent", border: "none",
                cursor: "pointer",
                fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700,
                fontSize: "0.8rem", textTransform: "uppercase",
                letterSpacing: "0.06em", color: "var(--nm-text-primary)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--nm-surface-high)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              <Target size={16} strokeWidth={2.5} />
              <div style={{ textAlign: "left" }}>
                <div>Skill Gap Analysis</div>
                <div style={{ fontSize: "0.65rem", fontWeight: 500, color: "var(--nm-text-tertiary)", textTransform: "none" }}>
                  Find missing skills for a role
                </div>
              </div>
            </button>
          </div>
        </div>

        <button onClick={onChangeTemplate} className="nm-btn" style={btnStyle}>
          <Layers size={14} strokeWidth={2.5} /> TEMPLATE
        </button>
        <button onClick={onPreview} className="nm-btn" style={btnStyle}>
          <Eye size={14} strokeWidth={2.5} /> PREVIEW
        </button>
        <button
          onClick={onDownloadPdf}
          disabled={downloadingPdf}
          className="nm-btn"
          style={btnStyle}
        >
          <Download size={14} strokeWidth={2.5} />{" "}
          {downloadingPdf ? "EXPORTING..." : "PDF"}
        </button>
        <button
          onClick={onSave}
          disabled={saving}
          className="nm-btn nm-btn-primary"
          style={{ padding: "8px 24px", minHeight: "40px", fontSize: "12px", boxShadow: "4px 4px 0 var(--nm-ink)" }}
        >
          <Save size={14} strokeWidth={2.5} /> {saving ? "WRITING..." : "SAVE CV"}
        </button>
      </div>
    </div>
  );
}

/* ─── Exported wrapper — picks mobile or desktop ─────────────────────────── */
export default function ActionBar({ isMobile, ...props }) {
  if (isMobile) return <MobileActionBar {...props} />;
  return <DesktopActionBar {...props} />;
}
