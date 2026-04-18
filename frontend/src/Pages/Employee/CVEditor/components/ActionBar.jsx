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
    <div className="flex-shrink-0 flex items-center gap-3 px-5 py-2.5 border-t-2 border-b-[3px] border-[var(--border-color)] bg-[var(--bg)]">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--fg-muted)] px-3 py-1.5 border-2 border-[var(--border-color)] bg-[var(--card-bg)] hover:text-[var(--fg)] transition-colors no-underline"
      >
        <ArrowLeft size={12} /> Back
      </button>
      <div className="flex-1">
        <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--fg-muted)]">
          Editing
        </div>
        <div className="font-['Space_Grotesk'] font-black text-sm tracking-tight text-[var(--fg)]">
          {form.jobTitle || "Untitled CV"}
        </div>
      </div>

      {/* Auto-save status */}
      <div className="flex items-center gap-2 mr-4 flex-wrap">
        {atsScore !== undefined && atsScore !== null && (
          <div className="flex items-center gap-2 font-mono text-[11px] font-bold text-[var(--fg)] px-3 py-1 bg-[var(--yellow)] border-2 border-[#0a0a0a] mr-2">
            ATS Score: {atsScore}/100
          </div>
        )}
        {isAutoSaving ? (
          <div className="flex items-center gap-2 font-mono text-[10px] text-[var(--fg-muted)]">
            <Clock size={12} className="animate-pulse" />
            Auto-saving...
          </div>
        ) : lastSavedAt ? (
          <div className="flex items-center gap-2 font-mono text-[10px] text-[var(--fg-muted)]">
            <Clock size={12} />
            Auto-saved {formatLastSaved(lastSavedAt)}
          </div>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        {/* Analyze button */}
        <button
          onClick={onAnalyze}
          disabled={analyzing}
          className="flex items-center gap-2 font-['Space_Grotesk'] font-black text-xs uppercase tracking-wider px-4 py-2.5 bg-[var(--card-bg)] text-[var(--fg)] border-[3px] border-[var(--border-color)] transition-all hover:border-[var(--fg)] hover:translate-x-0.5 hover:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            boxShadow: analyzing ? "none" : "3px 3px 0 var(--border-color)",
          }}
        >
          <Sparkles size={13} /> {analyzing ? "Analyzing…" : "Analyze"}
        </button>
        {/* Change Template button */}
        <button
          onClick={onChangeTemplate}
          className="flex items-center gap-2 font-['Space_Grotesk'] font-black text-xs uppercase tracking-wider px-4 py-2.5 bg-[var(--card-bg)] text-[var(--fg)] border-[3px] border-[var(--border-color)] transition-all hover:border-[var(--fg)] hover:translate-x-0.5 hover:translate-y-0.5"
          style={{ boxShadow: "3px 3px 0 var(--border-color)" }}
        >
          <Layers size={13} /> Change Template
        </button>
        {/* Preview button */}
        <button
          onClick={onPreview}
          className="flex items-center gap-2 font-['Space_Grotesk'] font-black text-xs uppercase tracking-wider px-4 py-2.5 bg-[var(--card-bg)] text-[var(--fg)] border-[3px] border-[var(--border-color)] transition-all hover:border-[var(--fg)] hover:translate-x-0.5 hover:translate-y-0.5"
          style={{ boxShadow: "3px 3px 0 var(--border-color)" }}
        >
          <Eye size={13} /> Preview
        </button>
        {/* Download PDF button */}
        <button
          onClick={onDownloadPdf}
          disabled={downloadingPdf}
          className="flex items-center gap-2 font-['Space_Grotesk'] font-black text-xs uppercase tracking-wider px-4 py-2.5 bg-[var(--card-bg)] text-[var(--fg)] border-[3px] border-[var(--border-color)] transition-all hover:border-[var(--fg)] hover:translate-x-0.5 hover:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            boxShadow: downloadingPdf
              ? "none"
              : "3px 3px 0 var(--border-color)",
          }}
        >
          <Download size={13} />{" "}
          {downloadingPdf ? "Generating…" : "Download PDF"}
        </button>
        {/* Save CV button */}
        <button
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-2 font-['Space_Grotesk'] font-black text-xs uppercase tracking-wider px-5 py-2.5 bg-[var(--yellow)] text-[#0a0a0a] border-[3px] border-[#0a0a0a] transition-all hover:translate-x-0.5 hover:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ boxShadow: saving ? "none" : "4px 4px 0 #0a0a0a" }}
        >
          <Save size={13} /> {saving ? "Saving…" : "Save CV"}
        </button>
      </div>
    </div>
  );
}
