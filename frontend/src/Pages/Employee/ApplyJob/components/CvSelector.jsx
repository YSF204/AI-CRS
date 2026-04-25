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
      <div style={{ padding: "1.5rem", background: "var(--nm-surface)", border: "4px solid var(--nm-ink)", boxShadow: "6px 6px 0 var(--nm-ink)", marginBottom: "1.5rem", borderRadius: "0px" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1rem", color: "var(--nm-text-primary)" }}>
          Select Your CV
        </h2>
        {cvs.length > 0 ? (
          <select
            value={selectedCvId}
            onChange={(e) => {
              setSelectedCvId(e.target.value);
              setMatchAnalysis(null);
            }}
            style={{ width: "100%", padding: "12px", border: "4px solid var(--nm-ink)", background: "var(--nm-bg)", color: "var(--nm-text-primary)", fontFamily: "var(--font-mono)", fontSize: "14px", outline: "none", cursor: "pointer", transition: "border-color 0.2s" }}
            onFocus={e => e.currentTarget.style.borderColor = "var(--nm-primary)"}
            onBlur={e => e.currentTarget.style.borderColor = "var(--nm-ink)"}
          >
            <option value="">Select a CV...</option>
            {cvs.map((cv) => (
              <option key={cv._id} value={cv._id}>
                {cv.jobTitle} ({new Date(cv.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })})
              </option>
            ))}
          </select>
        ) : (
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "14px", color: "var(--nm-error)" }}>
            No CVs available. Create one first.
          </p>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <button
          onClick={handleInstantSubmitApplication}
          disabled={!selectedCvId || submitting || (isEdit && !formHasChanged)}
          title={isEdit && !formHasChanged ? "No changes to submit" : "Apply instantly"}
          style={{
            background: "var(--nm-primary)",
            color: "#ffffff",
            padding: "16px",
            border: "4px solid var(--nm-ink)",
            boxShadow: "6px 6px 0 var(--nm-ink)",
            fontFamily: "var(--font-display)",
            fontWeight: 900,
            fontSize: "14px",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            cursor: (!selectedCvId || submitting || (isEdit && !formHasChanged)) ? "not-allowed" : "pointer",
            opacity: (!selectedCvId || submitting || (isEdit && !formHasChanged)) ? 0.6 : 1,
            transition: "transform 0.1s"
          }}
          onMouseDown={e => { if(!e.currentTarget.disabled) { e.currentTarget.style.transform = "translate(4px, 4px)"; e.currentTarget.style.boxShadow = "2px 2px 0 var(--nm-ink)"; } }}
          onMouseUp={e => { if(!e.currentTarget.disabled) { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "6px 6px 0 var(--nm-ink)"; } }}
          onMouseLeave={e => { if(!e.currentTarget.disabled) { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "6px 6px 0 var(--nm-ink)"; } }}
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
          title={isEdit && !formHasChanged ? "No changes to submit" : "Analyze before applying"}
          style={{
            background: "var(--nm-bg)",
            color: "var(--nm-text-primary)",
            padding: "16px",
            border: "4px solid var(--nm-ink)",
            boxShadow: "6px 6px 0 var(--nm-ink)",
            fontFamily: "var(--font-display)",
            fontWeight: 900,
            fontSize: "14px",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            cursor: (!selectedCvId || submitting || (isEdit && !formHasChanged)) ? "not-allowed" : "pointer",
            opacity: (!selectedCvId || submitting || (isEdit && !formHasChanged)) ? 0.6 : 1,
            transition: "transform 0.1s"
          }}
          onMouseDown={e => { if(!e.currentTarget.disabled) { e.currentTarget.style.transform = "translate(4px, 4px)"; e.currentTarget.style.boxShadow = "2px 2px 0 var(--nm-ink)"; } }}
          onMouseUp={e => { if(!e.currentTarget.disabled) { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "6px 6px 0 var(--nm-ink)"; } }}
          onMouseLeave={e => { if(!e.currentTarget.disabled) { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "6px 6px 0 var(--nm-ink)"; } }}
        >
          Analyze Before Applying
        </button>
      </div>
    </>
  );
}
