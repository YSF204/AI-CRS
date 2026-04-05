import React from "react";
import { Loader } from "lucide-react";

export default function CvSelector({ cvs, selectedCvId, setSelectedCvId, setMatchAnalysis, handleAnalyzeCv, analyzing }) {
  return (
    <>
      <div className="brutal-card bg-[var(--card-bg)] p-6">
        <h2 className="font-['Space_Grotesk'] font-bold text-sm uppercase tracking-wider mb-4">
          Select Your CV
        </h2>
        {cvs.length > 0 ? (
          <select
            value={selectedCvId}
            onChange={(e) => {
              setSelectedCvId(e.target.value);
              setMatchAnalysis(null);
            }}
            className="w-full border-2 border-[var(--border-color)] bg-[var(--bg)] text-[var(--fg)] px-3 py-2 font-mono text-sm outline-none focus:border-[var(--yellow)]"
          >
            <option value="">Select a CV...</option>
            {cvs.map((cv) => (
              <option key={cv._id} value={cv._id}>
                {cv.jobTitle} ({new Date(cv.updatedAt).toLocaleDateString()})
              </option>
            ))}
          </select>
        ) : (
          <p className="font-mono text-sm text-[var(--coral)]">
            No CVs available. Create one first.
          </p>
        )}
      </div>

      <div className="brutal-card bg-[rgba(78, 205, 196, 0.1)] border-4 border-[var(--teal)] p-6">
        <p className="font-mono text-sm text-[var(--fg-muted)]">
          Our AI will analyze your CV and compare it with the job requirements. You'll see your match score, strengths, and areas to improve before applying.
        </p>
      </div>

      <button
        onClick={handleAnalyzeCv}
        disabled={analyzing || !selectedCvId}
        className="w-full brutal-btn px-6 py-4 font-bold uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
        style={{
          background: analyzing || !selectedCvId ? "--fg-muted" : "var(--yellow)",
          color: "#0a0a0a",
        }}
      >
        {analyzing && <Loader size={16} className="animate-spin" />}
        {analyzing ? "Analyzing..." : "Analyze & Preview Match"}
      </button>
    </>
  );
}
