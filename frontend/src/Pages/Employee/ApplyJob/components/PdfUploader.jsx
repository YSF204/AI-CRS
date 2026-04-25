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
      <div style={{ padding: "1.5rem", background: "var(--nm-surface)", border: "4px solid var(--nm-ink)", boxShadow: "6px 6px 0 var(--nm-ink)", marginBottom: "1.5rem", borderRadius: "0px" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1rem", color: "var(--nm-text-primary)" }}>
          Upload Your CV (PDF)
        </h2>
        <div
          onClick={() => document.getElementById("cvFile")?.click()}
          style={{ border: "2px dashed var(--nm-ink)", padding: "2rem", textAlign: "center", cursor: "pointer", background: "var(--nm-bg)", transition: "all 0.2s" }}
          onMouseEnter={e => e.currentTarget.style.borderColor = "var(--nm-primary)"}
          onMouseLeave={e => e.currentTarget.style.borderColor = "var(--nm-ink)"}
        >
          <Upload size={32} color="var(--nm-ink)" style={{ margin: "0 auto 0.75rem auto" }} />
          <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", fontWeight: 700, color: "var(--nm-text-primary)", marginBottom: "4px" }}>
            {cvFile ? cvFile.name : "Click to upload or drag and drop"}
          </p>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "var(--nm-text-secondary)" }}>
            PDF only, max 5MB
          </p>
        </div>
        <input
          id="cvFile"
          type="file"
          accept=".pdf"
          onChange={handleFileUpload}
          style={{ display: "none" }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <button
          onClick={handleInstantSubmitApplication}
          disabled={!cvFile || submitting || (isEdit && !formHasChanged)}
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
            cursor: (!cvFile || submitting || (isEdit && !formHasChanged)) ? "not-allowed" : "pointer",
            opacity: (!cvFile || submitting || (isEdit && !formHasChanged)) ? 0.6 : 1,
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
          disabled={!cvFile || submitting || (isEdit && !formHasChanged)}
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
            cursor: (!cvFile || submitting || (isEdit && !formHasChanged)) ? "not-allowed" : "pointer",
            opacity: (!cvFile || submitting || (isEdit && !formHasChanged)) ? 0.6 : 1,
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
