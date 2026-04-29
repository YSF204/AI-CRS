import React from "react";
import { Loader } from "lucide-react";

export default function CvSelector({
  cvs,
  selectedCvId,
  setSelectedCvId,
  setMatchAnalysis,
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
          Choose whether to submit instantly with the selected CV or analyze it first.
        </p>
      </div>

      <div className="flex flex-col gap-4 mt-6">
        <button
          onClick={handleInstantSubmitApplication}
          disabled={!selectedCvId || submitting || (isEdit && !formHasChanged)}
          className="flex-1 brutal-btn px-4 py-3 font-bold uppercase tracking-wider disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ background: "var(--teal)", color: "#0a0a0a" }}
          title={
            isEdit && !formHasChanged
              ? "No changes to submit"
              : "Apply instantly with the selected CV"
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
          disabled={!selectedCvId || submitting || (isEdit && !formHasChanged)}
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
