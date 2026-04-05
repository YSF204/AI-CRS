import React from "react";
import { Loader, Upload } from "lucide-react";

export default function PdfUploader({ cvFile, handleFileUpload, handleAnalyzeCv, analyzing }) {
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
          Our AI will analyze your CV and compare it with the job requirements. You'll see your match score, strengths, and areas to improve before applying.
        </p>
      </div>

      <button
        onClick={handleAnalyzeCv}
        disabled={analyzing || !cvFile}
        className="w-full brutal-btn px-6 py-4 font-bold uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
        style={{
          background: analyzing || !cvFile ? "--fg-muted" : "var(--yellow)",
          color: "#0a0a0a",
        }}
      >
        {analyzing && <Loader size={16} className="animate-spin" />}
        {analyzing ? "Analyzing..." : "Analyze & Preview Match"}
      </button>
    </>
  );
}
