import React from "react";

export default function MethodSelector({
  applicationMethod,
  handleSwitchMethod,
  setSelectedCvId,
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" }}>
      {/* Option 1: Existing CV */}
      <button
        onClick={() => {
          handleSwitchMethod("existingCv");
          setSelectedCvId("");
        }}
        style={{
          padding: "2rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "280px",
          border: "4px solid var(--nm-ink)",
          background: applicationMethod === "existingCv" ? "var(--nm-primary)" : "var(--nm-surface)",
          color: applicationMethod === "existingCv" ? "#ffffff" : "var(--nm-text-primary)",
          boxShadow: applicationMethod === "existingCv" ? "inset 4px 4px 0 rgba(0,0,0,0.2)" : "6px 6px 0 var(--nm-ink)",
          transform: applicationMethod === "existingCv" ? "translate(2px, 2px)" : "none",
          transition: "all 0.2s",
          cursor: "pointer"
        }}
      >
        <div style={{ fontSize: "3.75rem", marginBottom: "1rem" }}>📄</div>
        <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "1.125rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>
          Use Existing CV
        </h3>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "14px", textAlign: "center", opacity: 0.8 }}>
          Select from your saved CVs
        </p>
      </button>

      {/* Option 2: Upload PDF */}
      <button
        onClick={() => handleSwitchMethod("uploadPdf")}
        style={{
          padding: "2rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "280px",
          border: "4px solid var(--nm-ink)",
          background: applicationMethod === "uploadPdf" ? "var(--nm-primary)" : "var(--nm-surface)",
          color: applicationMethod === "uploadPdf" ? "#ffffff" : "var(--nm-text-primary)",
          boxShadow: applicationMethod === "uploadPdf" ? "inset 4px 4px 0 rgba(0,0,0,0.2)" : "6px 6px 0 var(--nm-ink)",
          transform: applicationMethod === "uploadPdf" ? "translate(2px, 2px)" : "none",
          transition: "all 0.2s",
          cursor: "pointer"
        }}
      >
        <div style={{ fontSize: "3.75rem", marginBottom: "1rem" }}>📤</div>
        <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "1.125rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>
          Upload PDF
        </h3>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "14px", textAlign: "center", opacity: 0.8 }}>
          Upload a PDF resume
        </p>
      </button>
    </div>
  );
}
