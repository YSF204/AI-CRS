import React, { useRef } from "react";
import { Sparkles } from "lucide-react";
import { useTranslation } from "../../../context/LanguageContext";

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
  const { t } = useTranslation();

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      onValidationError?.(t("findJobByCv.unableToLoadCvs", {}, "Invalid File Format: PDF_REQUIRED"));
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
    <div className="jd-surface-stack p-6 bg-[var(--nm-surface-low)] border-4 border-[var(--nm-ink)] shadow-[6px_6px_0_var(--nm-ink)]">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 flex items-center justify-center bg-[var(--nm-ink)] text-white shadow-[4px_4px_0_var(--nm-primary)]">
          <Sparkles size={20} strokeWidth={2.5} />
        </div>
        <div>
          <p className="font-mono text-[9px] font-black text-[var(--nm-text-tertiary)] uppercase">{t("employeeJobs.aiMatching", {}, "AI Matching")}</p>
          <h2 className="font-[var(--font-display)] text-xl font-black uppercase tracking-tighter text-[var(--nm-text-primary)] leading-tight">
            {t("employeeJobs.findJobsByCv", {}, "Find Jobs by CV")}
          </h2>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-[var(--nm-error-surface)] border-4 border-[var(--nm-error)]">
          <div className="flex items-center gap-2 mb-1">
             <div className="w-2 h-2 bg-[var(--nm-error)]" />
             <span className="font-mono text-[10px] font-black uppercase text-[var(--nm-error)]">{t("common.error", {}, "Error")}</span>
          </div>
          <p className="text-sm text-[var(--nm-text-primary)] font-[var(--font-body)] font-bold">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        {hasCvs && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[10px] font-black text-[var(--nm-text-tertiary)] uppercase whitespace-nowrap">{t("employeeJobs.yourCvs", {}, "Your CVs")}</span>
              <div className="h-[2px] flex-1 bg-[var(--nm-ink)] opacity-10" />
            </div>
            
            <div className="relative">
              <label htmlFor="cv-select" className="sr-only">
                {t("findJobByCv.selectACv", {}, "Select a CV")}
              </label>
              <select
                id="cv-select"
                value={selectedCvId || ""}
                onChange={(e) => onCvSelect(e.target.value)}
                disabled={loading || uploading}
                className="jd-select w-full font-bold uppercase tracking-tight text-xs pr-10"
              >
                <option value="">{t("employeeJobs.selectCv", {}, "-- Select a CV --")}</option>
                {cvs.map((cv) => (
                  <option key={cv._id} value={cv._id}>
                    {cv.jobTitle ? cv.jobTitle.toUpperCase() : `${t("employeeJobs.untitledCv", {}, "My CV")} (${cv._id.substring(0, 6).toUpperCase()})`}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={onMatchWithCv}
              disabled={!selectedCvId || loading || uploading}
              className="jd-btn jd-btn-primary w-full py-4 font-black shadow-[4px_4px_0_var(--nm-ink)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]"
            >
              {loading ? t("employeeJobs.matching", {}, "Matching...") : t("employeeJobs.findMatches", {}, "Find Matches")}
            </button>
          </div>
        )}

        <div className="flex items-center gap-3 py-2">
          <div className="flex-1 h-[2px] bg-[var(--nm-ink)] opacity-20" />
          <span className="font-mono text-[10px] font-black text-[var(--nm-text-tertiary)] uppercase">{t("employeeJobs.or", {}, "OR")}</span>
          <div className="flex-1 h-[2px] bg-[var(--nm-ink)] opacity-20" />
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] font-black text-[var(--nm-text-tertiary)] uppercase whitespace-nowrap">{t("employeeJobs.uploadNew", {}, "Upload New")}</span>
            <div className="h-[2px] flex-1 bg-[var(--nm-ink)] opacity-10" />
          </div>

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
            className="jd-btn jd-btn-secondary w-full py-4 font-black border-dashed bg-transparent hover:bg-white shadow-[4px_4px_0_var(--nm-ink)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]"
          >
            {uploading ? t("employeeJobs.uploading", {}, "Uploading...") : t("employeeJobs.uploadPdfCv", {}, "Upload PDF CV")}
          </button>
          <p className="text-[10px] text-[var(--nm-text-tertiary)] font-[var(--font-body)] italic text-center">
            {t("employeeJobs.supportedFormat", {}, "Supported Format: PDF (Max 5MB)")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CvMatchPanel;
