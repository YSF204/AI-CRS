import React from "react";
import ActionButton from "../../../../components/shared/ActionButton";

export default function CVSelector({
  cvs,
  cvsLoading,
  selectedCvId,
  selectedCv,
  onCvChange,
  loading,
  uploading,
  onFindWithExisting,
  onUploadAndFind,
  fileInputRef,
}) {
  return (
    <div className="space-y-6">
      <div className="brutal-card p-6 border-4 border-black bg-(--card-bg)">
        <h2 className="font-['Space_Grotesk'] font-bold uppercase text-lg mb-4">
          Choose Resume Source
        </h2>

        <div className="space-y-5">
          <div className="brutal-card p-4 border-2 border-(--border-color) bg-(--bg)">
            <p className="font-bold uppercase text-sm mb-3">
              Use Saved CV
            </p>
            {cvsLoading ? (
              <p className="font-mono text-sm text-(--fg-muted)">
                Loading CVs...
              </p>
            ) : cvs.length === 0 ? (
              <p className="font-mono text-sm text-(--coral)">
                No CVs available. Create or upload one first.
              </p>
            ) : (
              <>
                <select
                  value={selectedCvId}
                  onChange={(e) => onCvChange(e.target.value)}
                  className="w-full border-2 border-[var(--border-color)] bg-[var(--bg)] text-[var(--fg)] px-3 py-2 font-mono text-sm outline-none focus:border-[var(--yellow)]"
                >
                  <option value="">Select a CV</option>
                  {cvs.map((cv) => (
                    <option key={cv._id} value={cv._id}>
                      {cv.jobTitle || `CV ${cv._id.substring(0, 6)}`}
                    </option>
                  ))}
                </select>

                {selectedCv && (
                  <p className="font-mono text-xs text-(--fg-muted) mt-2">
                    Selected: {selectedCv.jobTitle || "Untitled CV"}
                  </p>
                )}
              </>
            )}

            <ActionButton
              type="button"
              variant="ai-gold"
              onClick={onFindWithExisting}
              disabled={!selectedCvId || loading || uploading}
              className="mt-3 px-5 py-3 font-bold w-full"
            >
              {loading
                ? "Matching with selected CV..."
                : "Find jobs with selected CV"}
            </ActionButton>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-[2px] bg-(--border-color) flex-1" />
            <span className="font-mono text-xs uppercase text-(--fg-muted)">
              or
            </span>
            <div className="h-[2px] bg-(--border-color) flex-1" />
          </div>

          <div className="brutal-card p-4 border-2 border-(--border-color) bg-(--bg)">
            <p className="font-bold uppercase text-sm mb-3">
              Upload New PDF
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={onUploadAndFind}
              className="hidden"
              disabled={uploading || loading}
            />

            <ActionButton
              type="button"
              variant="ai-gold"
              className="px-5 py-5 font-bold w-full"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || loading}
            >
              {uploading
                ? "Uploading and matching..."
                : "Upload PDF and find jobs"}
            </ActionButton>

            <p className="font-mono text-xs text-(--fg-muted) mt-2">
              Best when testing a new resume version quickly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
