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
      <div className="brutal-card bg-[var(--card-bg)] p-6">
        <h2 className="font-['Space_Grotesk'] font-bold text-sm uppercase tracking-wider mb-4">
          Upload Your CV (PDF)
        </h2>
        <div
          className="border-2 border-dashed border-[var(--border-color)] p-8 text-center cursor-pointer hover:border-[var(--yellow)] transition-colors"
          onClick={() => document.getElementById("cvFile")?.click()}
        >
          <Upload size={32} className="mx-auto mb-3 text-[var(--fg-muted)]" />
          <p className="font-mono text-sm font-bold mb-1">
            {cvFile ? cvFile.name : "Click to upload or drag and drop"}
          </p>
          <p className="font-mono text-xs text-[var(--fg-muted)]">
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

      <div className="brutal-card bg-[rgba(78, 205, 196, 0.1)] border-4 border-[var(--teal)] p-6">
        <p className="font-mono text-sm text-[var(--fg-muted)]">
          Choose whether to submit instantly with the uploaded PDF or analyze it first.
        </p>
      </div>

      <div className="flex flex-col gap-4 mt-6">
        <button
          onClick={handleInstantSubmitApplication}
          disabled={!cvFile || submitting || (isEdit && !formHasChanged)}
          className="flex-1 brutal-btn px-4 py-3 font-bold uppercase tracking-wider disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ background: "var(--teal)", color: "#0a0a0a" }}
          title={
            isEdit && !formHasChanged
              ? "No changes to submit"
              : "Apply instantly with the uploaded PDF"
          }
        >
          {submitting ? (
            <>
              <Loader className="animate-spin" size={18} />
              Applying instantly...
            </>
          ) : (
            "Apply Instantly"
          )}
        </button>
        <button
          onClick={handleSubmitApplication}
          disabled={!cvFile || submitting || (isEdit && !formHasChanged)}
          className="flex-1 brutal-btn px-4 py-3 font-bold uppercase tracking-wider disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ background: "var(--yellow)", color: "#0a0a0a" }}
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
