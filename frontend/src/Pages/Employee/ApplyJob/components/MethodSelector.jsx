import React from "react";

export default function MethodSelector({ applicationMethod, handleSwitchMethod, setSelectedCvId }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Option 1: Existing CV */}
      <button
        onClick={() => {
          handleSwitchMethod("existingCv");
          setSelectedCvId("");
        }}
        className={`brutal-card p-8 flex flex-col items-center justify-center min-h-[280px] transition-all border-4 ${
          applicationMethod === "existingCv"
            ? "border-black scale-105"
            : "border-[var(--border-color)] hover:border-black"
        }`}
        style={{
          background:
            applicationMethod === "existingCv" ? "var(--yellow)" : "var(--card-bg)",
        }}
      >
        <div className="text-6xl mb-4">📄</div>
        <h3
          className={`font-['Space_Grotesk'] font-bold text-lg uppercase tracking-wider mb-2 ${
            applicationMethod === "existingCv" ? "text-black" : "text-[var(--fg)]"
          }`}
        >
          Use Existing CV
        </h3>
        <p
          className={`font-mono text-sm text-center ${
            applicationMethod === "existingCv" ? "text-black" : "text-[var(--fg-muted)]"
          }`}
        >
          Select from your saved CVs
        </p>
      </button>

      {/* Option 2: Upload PDF */}
      <button
        onClick={() => handleSwitchMethod("uploadPdf")}
        className={`brutal-card p-8 flex flex-col items-center justify-center min-h-[280px] transition-all border-4 ${
          applicationMethod === "uploadPdf"
            ? "border-black scale-105"
            : "border-[var(--border-color)] hover:border-black"
        }`}
        style={{
          background:
            applicationMethod === "uploadPdf" ? "var(--teal)" : "var(--card-bg)",
        }}
      >
        <div className="text-6xl mb-4">📤</div>
        <h3
          className={`font-['Space_Grotesk'] font-bold text-lg uppercase tracking-wider mb-2 ${
            applicationMethod === "uploadPdf" ? "text-black" : "text-[var(--fg)]"
          }`}
        >
          Upload PDF
        </h3>
        <p
          className={`font-mono text-sm text-center ${
            applicationMethod === "uploadPdf" ? "text-black" : "text-[var(--fg-muted)]"
          }`}
        >
          Upload a PDF resume
        </p>
      </button>

      {/* Option 3: Fill Manually */}
      <button
        onClick={() => handleSwitchMethod("manual")}
        className={`brutal-card p-8 flex flex-col items-center justify-center min-h-[280px] transition-all border-4 ${
          applicationMethod === "manual"
            ? "border-black scale-105"
            : "border-[var(--border-color)] hover:border-black"
        }`}
        style={{
          background:
            applicationMethod === "manual" ? "var(--mint)" : "var(--card-bg)",
        }}
      >
        <div className="text-6xl mb-4">✏️</div>
        <h3
          className={`font-['Space_Grotesk'] font-bold text-lg uppercase tracking-wider mb-2 ${
            applicationMethod === "manual" ? "text-black" : "text-[var(--fg)]"
          }`}
        >
          Fill Manually
        </h3>
        <p
          className={`font-mono text-sm text-center ${
            applicationMethod === "manual" ? "text-black" : "text-[var(--fg-muted)]"
          }`}
        >
          Enter your details
        </p>
      </button>
    </div>
  );
}
