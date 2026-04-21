import React, { useRef } from "react";
import { Sparkles } from "lucide-react";

const CvMatchPanel = ({
  cvs,
  selectedCvId,
  onCvSelect,
  onMatchWithCv,
  onUploadAndMatch,
  loading,
  uploading,
  error,
  onValidationError,
}) => {
  const fileInputRef = useRef(null);

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      onValidationError?.("Please upload a PDF file only.");
      return;
    }

    onValidationError?.("");

    onUploadAndMatch(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const hasCvs = cvs && cvs.length > 0;

  return (
    <div className="jd-surface-stack">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={20} className="text-[var(--jd-primary)]" />
        <h2 className="font-[var(--jd-font-display)] text-lg font-bold uppercase tracking-tight text-[var(--jd-text-primary)]">
          Match Jobs to Your CV
        </h2>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-[var(--jd-danger-light)] border-4 border-[var(--jd-danger)] rounded-none">
          <p className="text-sm text-[var(--jd-danger)] font-[var(--jd-font-body)]">{error}</p>
        </div>
      )}

      <div className="space-y-5">
        {hasCvs && (
          <div className="p-4 bg-[var(--jd-surface-hover)] border-4 border-[var(--jd-border)] rounded-none">
            <p className="jd-section-title mb-3">
              Use Saved CV
            </p>
            <label htmlFor="cv-select" className="sr-only">
              Select a CV
            </label>
            <select
              id="cv-select"
              value={selectedCvId || ""}
              onChange={(e) => onCvSelect(e.target.value)}
              disabled={loading || uploading}
              className="jd-select mb-2"
            >
              <option value="">Select a CV</option>
              {cvs.map((cv) => (
                <option key={cv._id} value={cv._id}>
                  {cv.jobTitle || `CV ${cv._id.substring(0, 6)}`}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={onMatchWithCv}
              disabled={!selectedCvId || loading || uploading}
              className="jd-btn jd-btn-primary w-full"
            >
              {loading ? "Matching with CV…" : "Find Jobs with Selected CV"}
            </button>
          </div>
        )}

        {hasCvs && (
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1 bg-[var(--jd-border)]" />
            <span className="text-xs uppercase text-[var(--jd-text-tertiary)] font-semibold tracking-[0.14em]">
              or
            </span>
            <div className="flex-1 h-1 bg-[var(--jd-border)]" />
          </div>
        )}

        <div className="p-4 bg-[var(--jd-surface-hover)] border-4 border-[var(--jd-border)] border-dashed rounded-none">
          <p className="jd-section-title mb-3">
            Upload New PDF
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading || loading}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || loading}
            className="jd-btn jd-btn-secondary w-full"
          >
            {uploading ? "Uploading and matching…" : "Upload PDF & Find Jobs"}
          </button>
          <p className="text-xs text-[var(--jd-text-tertiary)] mt-2 font-[var(--jd-font-body)]">
            Best for testing new resume versions quickly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CvMatchPanel;
