import React from "react";
import { PanelLeftClose, Check } from "lucide-react";
import { ALL_SECTIONS } from "../constants";

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  activeSections,
  toggleSection,
}) {
  return (
    <div
      className="cv-editor-sidebar"
      style={{
        width: sidebarOpen ? 224 : 64,
        background: "var(--nm-surface)",
        borderRight: "4px solid var(--nm-ink)",
      }}
    >
      {/* Sidebar header */}
      <div
        className="flex items-center border-b-4 border-[var(--nm-ink)] flex-shrink-0 overflow-hidden"
        style={{ minHeight: 64 }}
      >
        {sidebarOpen && (
          <div className="px-5 flex-1 overflow-hidden">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--nm-text-tertiary)] whitespace-nowrap font-bold opacity-70">
              CV Editor
            </p>
            <p className="font-[var(--font-display)] font-black text-[11px] mt-0.5 whitespace-nowrap uppercase tracking-wider text-[var(--nm-text-primary)]">
              Available Sections
            </p>
          </div>
        )}
        {/* Expand / collapse toggle */}
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          className="flex-shrink-0 w-[64px] h-[60px] flex items-center justify-center hover:bg-[var(--nm-surface-high)] transition-colors"
          style={{
            borderLeft: sidebarOpen ? "4px solid var(--nm-ink)" : "none",
          }}
        >
          <div
            style={{
              transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)",
              transform: sidebarOpen ? "none" : "rotate(180deg)",
            }}
          >
            <PanelLeftClose
              size={18}
              className="text-[var(--nm-text-tertiary)]"
              strokeWidth={2.5}
            />
          </div>
        </button>
      </div>

      {/* Section list */}
      <div
        className="flex-1 overflow-y-auto py-4"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(0,0,0,0.2) transparent",
        }}
      >
        {ALL_SECTIONS.map(({ key, label, icon: Icon, accent, textColor }) => {
          const active = activeSections.includes(key);
          return (
            <button
              key={key}
              type="button"
              onClick={() => toggleSection(key)}
              title={sidebarOpen ? undefined : label}
              className="w-full flex items-center text-left transition-all relative"
              style={{
                gap: sidebarOpen ? 12 : 0,
                padding: sidebarOpen ? "12px 20px" : "16px 0",
                justifyContent: sidebarOpen ? "flex-start" : "center",
                background: active ? accent : "transparent",
                borderLeft:
                  active && sidebarOpen
                    ? "6px solid var(--nm-ink)"
                    : "6px solid transparent",
                marginBottom: "2px",
              }}
              onMouseEnter={(e) => {
                if (!active)
                  e.currentTarget.style.background = "var(--nm-surface-high)";
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.background = "transparent";
              }}
            >
              {/* Active indicator — collapsed only */}
              {!sidebarOpen && active && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-[var(--nm-ink)]" />
              )}
              <Icon
                size={16}
                style={{
                  color: active ? textColor : "var(--nm-text-tertiary)",
                  flexShrink: 0,
                }}
                strokeWidth={2.5}
              />
              {sidebarOpen && (
                <>
                  <span
                    className="font-mono text-[11px] font-bold uppercase tracking-wider flex-1 whitespace-nowrap overflow-hidden"
                    style={{
                      color: active ? textColor : "var(--nm-text-primary)",
                    }}
                  >
                    {label}
                  </span>
                  {active && (
                    <div className="w-5 h-5 flex items-center justify-center bg-[var(--nm-ink)] flex-shrink-0">
                      <Check size={10} color="#fff" strokeWidth={4} />
                    </div>
                  )}
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* Sidebar footer */}
      {sidebarOpen && (
        <div className="px-5 py-4 border-t-4 border-[var(--nm-ink)] flex-shrink-0 bg-[var(--nm-surface-low)]">
          <p className="font-mono text-[10px] text-[var(--nm-text-tertiary)] whitespace-nowrap uppercase font-bold">
            <span className="font-black text-[var(--nm-text-primary)]">
              {activeSections.length}
            </span>{" "}
            / {ALL_SECTIONS.length} Active Sections
          </p>
        </div>
      )}
    </div>
  );
}
