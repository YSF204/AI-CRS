import React from "react";
import { X, Plus, ArrowUpDown } from "lucide-react";
import { ALL_SECTIONS, getSectionMeta } from "../constants";


export default function MobileSectionsTab({
  activeSections,
  toggleSection,
  onOpenSheet,
  form,
}) {
  return (
    <div className="cv-sections-tab">
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 4,
        }}
      >
        <div>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              fontSize: 13,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--nm-text-primary)",
            }}
          >
            Active Sections
          </p>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--nm-text-tertiary)",
              marginTop: 2,
            }}
          >
            {activeSections.length} / {ALL_SECTIONS.filter((s) => s.key !== "customSections").length}+ selected
          </p>
        </div>

        {/* Add button */}
        <button
          type="button"
          onClick={onOpenSheet}
          className="nm-btn nm-btn-primary"
          style={{ padding: "8px 16px", fontSize: 11, minHeight: 36 }}
        >
          <Plus size={13} strokeWidth={3} />
          Add Section
        </button>
      </div>

      {/* Reorder hint */}
      {activeSections.length > 1 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 12px",
            background: "var(--nm-surface)",
            border: "2px solid var(--nm-ink)",
          }}
        >
          <ArrowUpDown size={12} strokeWidth={2.5} style={{ color: "var(--nm-text-tertiary)", flexShrink: 0 }} />
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              fontSize: 9,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "var(--nm-text-tertiary)",
              margin: 0,
            }}
          >
            Use ↑↓ arrows in the Editor tab to reorder sections
          </p>
        </div>
      )}

      {/* Active section chips */}
      {activeSections.length === 0 ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            padding: "40px 20px",
            border: "3px dashed var(--nm-ink)",
            opacity: 0.5,
          }}
        >
          <Plus size={28} strokeWidth={2} style={{ color: "var(--nm-text-tertiary)" }} />
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--nm-text-tertiary)",
              textAlign: "center",
            }}
          >
            No sections yet.{"\n"}Tap "Add Section" to begin.
          </p>
        </div>
      ) : (
        activeSections.map((key) => {
          const meta = getSectionMeta(key, form);
          const Icon = meta.icon;
          return (
            <div
              key={key}
              className="cv-active-section-chip"
              style={{ borderLeftColor: meta.accent, borderLeftWidth: 6 }}
            >
              <Icon size={14} strokeWidth={2.5} style={{ color: meta.accent, flexShrink: 0 }} />
              <span className="cv-active-section-chip-label">{meta.label}</span>
              <button
                type="button"
                onClick={() => toggleSection(key)}
                style={{
                  background: "transparent",
                  border: "2px solid var(--nm-ink)",
                  padding: "3px 6px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  flexShrink: 0,
                }}
                aria-label={`Remove ${meta.label}`}
              >
                <X size={12} strokeWidth={3} style={{ color: "var(--nm-text-primary)" }} />
              </button>
            </div>
          );
        })
      )}
    </div>
  );
}
