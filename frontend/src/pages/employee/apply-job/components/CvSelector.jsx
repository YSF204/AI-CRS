import React from "react";
import { Loader, Sparkles } from "lucide-react";

export default function CvSelector({
  cvs,
  selectedCvId,
  setSelectedCvId,
  setMatchAnalysis,
  handleSubmitApplication,
  handleInstantSubmitApplication,
  submitting,
  isEdit,
  formHasChanged,
}) {
  return (
    <>
      <div className="p-5 bg-[var(--nm-surface)] border-4 border-[var(--nm-ink)]">
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
            className="w-full border-4 border-[var(--nm-ink)] bg-[var(--nm-bg)] text-[var(--nm-text-primary)] px-3 py-3 font-['Manrope'] text-sm outline-none focus:border-[var(--nm-primary)]"
          >
            <option value="">Select a CV...</option>
            {cvs.map((cv) => (
              <option key={cv._id} value={cv._id}>
                {cv.jobTitle} ({new Date(cv.updatedAt).toLocaleDateString()})
              </option>
            ))}
          </select>
        ) : (
          <p className="font-['Manrope'] text-sm text-[var(--nm-error)]">
            No CVs available. Create one first.
          </p>
        )}
      </div>

      <div className="p-4 bg-[var(--nm-surface-high)] border-4 border-[var(--nm-primary)]">
        <p className="font-['Manrope'] text-sm text-[var(--nm-text-secondary)]">
          <strong>Analyze First</strong> to see how well your CV fits this job before applying, or <strong>Apply Instantly</strong> to submit without analysis.
        </p>
      </div>

      <div className="flex flex-col gap-4 mt-6">
        {/* Analyze → shows results → user decides to apply */}
        <button
          onClick={handleSubmitApplication}
          disabled={!selectedCvId || submitting || (isEdit && !formHasChanged)}
          className="jd-btn jd-btn-primary w-full py-4 font-black shadow-[4px_4px_0_var(--nm-ink)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] flex items-center justify-center gap-2"
          title={
            isEdit && !formHasChanged
              ? "No changes to submit"
              : "Analyze your CV fit for this job"
          }
        >
          {submitting ? (
            <>
              <Loader className="animate-spin" size={18} />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles size={18} />
              Analyze My Fit
            </>
          )}
        </button>

        {/* Apply instantly without analysis */}
        <button
          onClick={handleInstantSubmitApplication}
          disabled={!selectedCvId || submitting || (isEdit && !formHasChanged)}
          className="jd-btn jd-btn-secondary w-full py-4 font-black shadow-[4px_4px_0_var(--nm-ink)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]"
          title={
            isEdit && !formHasChanged
              ? "No changes to submit"
              : "Apply instantly with the selected CV"
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
      </div>
    </>
  );
}

