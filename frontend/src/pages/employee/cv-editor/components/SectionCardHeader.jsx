import React from "react";
import { GripVertical, ChevronDown, X, ArrowUp, ArrowDown } from "lucide-react";
import { getSectionMeta } from "../constants";

export default function SectionCardHeader({
  sectionKey,
  collapsed,
  onToggleCollapse,
  onRemove,
  isMobile,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}) {
  const meta = getSectionMeta(sectionKey);
  const Icon = meta.icon;

  return (
    <div
      className="flex items-center gap-3 px-5 py-4 border-b-4 border-[var(--nm-ink)] cursor-pointer select-none transition-colors hover:brightness-95"
      style={{ background: meta.accent }}
      onClick={onToggleCollapse}
    >
      {/* Desktop: drag grip / Mobile: up-down arrows */}
      {isMobile ? (
        <div
          className="cv-reorder-arrows"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="cv-reorder-btn"
            style={{ color: meta.textColor }}
            disabled={isFirst}
            onClick={(e) => { e.stopPropagation(); onMoveUp && onMoveUp(); }}
            aria-label="Move section up"
          >
            <ArrowUp size={10} strokeWidth={3} />
          </button>
          <button
            type="button"
            className="cv-reorder-btn"
            style={{ color: meta.textColor }}
            disabled={isLast}
            onClick={(e) => { e.stopPropagation(); onMoveDown && onMoveDown(); }}
            aria-label="Move section down"
          >
            <ArrowDown size={10} strokeWidth={3} />
          </button>
        </div>
      ) : (
        <div
          style={{
            cursor: "grab",
            opacity: 0.6,
            display: "flex",
            alignItems: "center",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={18} color={meta.textColor} strokeWidth={2.5} />
        </div>
      )}

      <Icon size={18} style={{ color: meta.textColor }} strokeWidth={2.5} />
      <span
        className="font-[var(--font-display)] font-black text-xs uppercase tracking-[0.15em] flex-1"
        style={{ color: meta.textColor }}
      >
        {meta.label}
      </span>

      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          draggable={false}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onToggleCollapse();
          }}
          title={collapsed ? "Expand Section" : "Collapse Section"}
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
          draggable={false}
          onMouseDown={(e) => e.stopPropagation()}
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
          <X size={12} strokeWidth={3} /> {!isMobile && "REMOVE"}
        </button>
      </div>
    </div>
  );
}
