import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Save, Eye, Download, Layers, Sparkles, Clock } from "lucide-react";

/**
 * ActionBar - Displays action buttons and auto-save status
 * Single Responsibility: Render action bar with save status
 */
export default function ActionBar({
  form,
  saving,
  isAutoSaving,
  lastSavedAt,
  analyzing,
  downloadingPdf,
  onSave,
  onPreview,
  onAnalyze,
  onDownloadPdf,
  onChangeTemplate,
  onBack,
  atsScore,
}) {
  // Format last saved time
  const formatLastSaved = (date) => {
    if (!date) return null;
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // seconds

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex-shrink-0 flex items-center gap-4 px-6 py-4 border-b-4 border-[var(--nm-ink)] bg-[var(--nm-surface)]">
      <button
        onClick={onBack}
        className="nm-btn"
        style={{
          padding: "8px 16px",
          minHeight: "40px",
          fontSize: "12px",
          background: "var(--nm-surface-high)"
        }}
      >
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

      {/* Auto-save status */}
      <div className="flex items-center gap-4 mr-4 flex-wrap">
        {atsScore !== undefined && atsScore !== null && (
          <div className="nm-chip nm-chip-primary" style={{ padding: "6px 12px", fontSize: "11px" }}>
            ATS QUALITY: {atsScore}%
          </div>
        )}
        <div className="flex items-center gap-2 font-mono text-[10px] text-[var(--nm-text-tertiary)] uppercase font-bold">
          <Clock size={12} className={isAutoSaving ? "animate-pulse" : ""} strokeWidth={2.5} />
          {isAutoSaving ? "Syncing..." : lastSavedAt ? `Last Sync: ${formatLastSaved(lastSavedAt)}` : "Not Synced"}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onAnalyze}
          disabled={analyzing}
          className="nm-btn"
          style={{
            padding: "8px 16px",
            minHeight: "40px",
            fontSize: "12px",
            background: "var(--nm-surface-high)"
          }}
        >
          <Sparkles size={14} strokeWidth={2.5} /> {analyzing ? "ANALYZING..." : "ANALYZE"}
        </button>
        <button
          onClick={onChangeTemplate}
          className="nm-btn"
          style={{
            padding: "8px 16px",
            minHeight: "40px",
            fontSize: "12px",
            background: "var(--nm-surface-high)"
          }}
        >
          <Layers size={14} strokeWidth={2.5} /> TEMPLATE
        </button>
        <button
          onClick={onPreview}
          className="nm-btn"
          style={{
            padding: "8px 16px",
            minHeight: "40px",
            fontSize: "12px",
            background: "var(--nm-surface-high)"
          }}
        >
          <Eye size={14} strokeWidth={2.5} /> PREVIEW
        </button>
        <button
          onClick={onDownloadPdf}
          disabled={downloadingPdf}
          className="nm-btn"
          style={{
            padding: "8px 16px",
            minHeight: "40px",
            fontSize: "12px",
            background: "var(--nm-surface-high)"
          }}
        >
          <Download size={14} strokeWidth={2.5} /> {downloadingPdf ? "EXPORTING..." : "PDF"}
        </button>
        <button
          onClick={onSave}
          disabled={saving}
          className="nm-btn nm-btn-primary"
          style={{
            padding: "8px 24px",
            minHeight: "40px",
            fontSize: "12px",
            boxShadow: "4px 4px 0 var(--nm-ink)"
          }}
        >
          <Save size={14} strokeWidth={2.5} /> {saving ? "WRITING..." : "SAVE CV"}
        </button>
      </div>
    </div>
  );
}
