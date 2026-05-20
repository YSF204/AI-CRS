import React from "react";
import { X, Check } from "lucide-react";
import { ALL_SECTIONS } from "../constants";

/**
 * Slide-up bottom sheet for picking/toggling CV sections on mobile.
 * Opens when the user taps "Add Section" in the Sections tab or Editor tab FAB.
 */
export default function MobileBottomSheet({ open, onClose, activeSections, toggleSection }) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="cv-bottom-sheet-backdrop"
        data-open={open}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet panel */}
      <div
        className="cv-bottom-sheet"
        data-open={open}
        role="dialog"
        aria-modal="true"
        aria-label="Add CV Sections"
      >
        {/* Drag handle */}
        <div className="cv-bottom-sheet-handle" />

        {/* Header */}
        <div className="cv-bottom-sheet-header">
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              fontSize: 12,
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              color: "var(--nm-text-primary)",
              flex: 1,
            }}
          >
            Add Sections
          </span>
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--nm-text-tertiary)",
            }}
          >
            {activeSections.length} / {ALL_SECTIONS.length} active
          </span>
          <button
            type="button"
            onClick={onClose}
            className="nm-btn"
            style={{ padding: "6px 10px", minHeight: 32, fontSize: 10 }}
            aria-label="Close"
          >
            <X size={14} strokeWidth={3} />
          </button>
        </div>

        {/* Section grid */}
        <div className="cv-bottom-sheet-body">
          <div className="cv-section-picker-grid">
            {ALL_SECTIONS.map(({ key, label, icon: Icon, accent }) => {
              const active = activeSections.includes(key);
              return (
                <button
                  key={key}
                  type="button"
                  className="cv-section-picker-item"
                  data-active={active}
                  onClick={() => toggleSection(key)}
                  aria-pressed={active}
                  aria-label={label}
                >
                  {active && (
                    <span className="cv-section-picker-check">
                      <Check size={8} color="#fff" strokeWidth={4} />
                    </span>
                  )}
                  <Icon
                    size={20}
                    strokeWidth={2.5}
                    style={{ color: active ? "#fff" : accent }}
                  />
                  <span className="cv-section-picker-label">{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer — Done button */}
        <div className="cv-bottom-sheet-footer">
          <button
            type="button"
            onClick={onClose}
            className="nm-btn nm-btn-primary"
            style={{ width: "100%", fontSize: 12, minHeight: 44 }}
          >
            Done — {activeSections.length} section{activeSections.length !== 1 ? "s" : ""} active
          </button>
        </div>
      </div>
    </>
  );
}
