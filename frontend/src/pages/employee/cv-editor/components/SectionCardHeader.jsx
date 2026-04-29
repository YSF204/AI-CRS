import React from "react";
import { GripVertical, ChevronDown, X, Sparkles } from "lucide-react";
import { getSectionMeta } from "../constants";

export default function SectionCardHeader({
  sectionKey,
  collapsed,
  onToggleCollapse,
  onRemove,
  onAnalyzeSection,
}) {
  const meta = getSectionMeta(sectionKey);
  const Icon = meta.icon;

  return (
    <div
      className="flex items-center gap-3 px-5 py-4 border-b-4 border-[var(--nm-ink)]"
      style={{ background: meta.accent }}
    >
      <div
        style={{
          cursor: "grab",
          opacity: 0.6,
          display: "flex",
          alignItems: "center",
        }}
      >
        <GripVertical size={18} color={meta.textColor} strokeWidth={2.5} />
      </div>
      <Icon size={18} style={{ color: meta.textColor }} strokeWidth={2.5} />
      <span
        className="font-[var(--font-display)] font-black text-xs uppercase tracking-[0.15em] flex-1"
        style={{ color: meta.textColor }}
      >
        {meta.label}
      </span>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAnalyzeSection(sectionKey);
          }}
          title={`Analyze ${meta.label}`}
          className="nm-btn"
          style={{
            padding: "6px 12px",
            minHeight: "32px",
            background: "rgba(0,0,0,0.1)",
            borderColor: meta.textColor,
            color: meta.textColor,
            fontSize: "10px",
            borderWidth: "2px",
          }}
        >
          <Sparkles size={12} strokeWidth={3} /> REVIEW
        </button>
        <button
          type="button"
          onClick={onToggleCollapse}
          title={collapsed ? "EXPAND_SECTION" : "COLLAPSE_SECTION"}
          className="nm-btn"
          style={{
            padding: "6px",
            minHeight: "32px",
            background: "rgba(0,0,0,0.1)",
            borderColor: meta.textColor,
            color: meta.textColor,
            borderWidth: "2px",
          }}
        >
          <ChevronDown
            size={14}
            strokeWidth={3}
            style={{
              transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)",
              transition: "transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          />
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="nm-btn"
          style={{
            padding: "6px 12px",
            minHeight: "32px",
            background: "rgba(0,0,0,0.1)",
            borderColor: meta.textColor,
            color: meta.textColor,
            fontSize: "10px",
            borderWidth: "2px",
          }}
        >
          <X size={12} strokeWidth={3} /> REMOVE
        </button>
      </div>
    </div>
  );
}
