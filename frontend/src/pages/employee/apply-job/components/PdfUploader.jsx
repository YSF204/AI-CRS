import React from "react";
import { Loader, Upload } from "lucide-react";

export default function PdfUploader({
  cvFile,
  handleFileUpload,
  handleSubmitApplication,
  handleInstantSubmitApplication,
  submitting,
  isEdit,
  formHasChanged, // FIX #6: Added form change detection
}) {
  return (
    <>
      <div className="p-5 bg-[var(--nm-surface)] border-4 border-[var(--nm-ink)]">
        <h2 className="font-['Space_Grotesk'] font-bold text-sm uppercase tracking-wider mb-4">
          Upload Your CV (PDF)
        </h2>
        <div
          className="border-4 border-dashed border-[var(--nm-ink)] p-8 text-center cursor-pointer hover:border-[var(--nm-primary)] transition-colors"
          onClick={() => document.getElementById("cvFile")?.click()}
        >
          <Upload size={32} className="mx-auto mb-3 text-[var(--nm-text-secondary)]" />
          <p className="font-['Space_Grotesk'] text-sm font-bold mb-1">
            {cvFile ? cvFile.name : "Click to upload or drag and drop"}
          </p>
          <p className="font-['Manrope'] text-xs text-[var(--nm-text-secondary)]">
            PDF only, max 5MB
          </p>
        </div>
        <input
          id="cvFile"
          type="file"
          accept=".pdf"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      <div className="p-5 bg-[var(--nm-surface-high)] border-4 border-[var(--nm-primary)]">
        <p className="font-['Manrope'] text-sm text-[var(--nm-text-secondary)]">
          Choose whether to submit instantly with the uploaded PDF or analyze it first.
        </p>
      </div>

      <div className="flex flex-col gap-4 mt-6">
        <button
          onClick={handleInstantSubmitApplication}
          disabled={!cvFile || submitting || (isEdit && !formHasChanged)}
          className="jd-btn jd-btn-primary w-full py-4 font-black shadow-[4px_4px_0_var(--nm-ink)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]"
          title={
            isEdit && !formHasChanged
              ? "No changes to submit"
              : "Apply instantly with the uploaded PDF"
          }
        >
          {submitting ? (
            <>
              <Loader className="animate-spin" size={18} />
              Applying...
            </>
          ) : (
            "Apply Instantly"
          )}
        </button>
        <button
          onClick={handleSubmitApplication}
          disabled={!cvFile || submitting || (isEdit && !formHasChanged)}
          className="jd-btn jd-btn-secondary w-full py-4 font-black shadow-[4px_4px_0_var(--nm-ink)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]"
          title={
            isEdit && !formHasChanged
              ? "No changes to submit"
              : "Analyze before applying"
          }
        >
          Analyze Before Applying
        </button>
      </div>
    </>
  );
}
