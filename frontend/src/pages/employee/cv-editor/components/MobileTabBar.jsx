import React from "react";
import { LayoutGrid, Edit3, Eye } from "lucide-react";

/**
 * Fixed bottom tab bar for mobile CV editor.
 * Tabs: Sections | Editor | Preview
 */
export default function MobileTabBar({ activeTab, onChange, activeSections }) {
  const tabs = [
    { id: "sections", label: "Sections", icon: LayoutGrid },
    { id: "editor",   label: "Editor",   icon: Edit3 },
    { id: "preview",  label: "Preview",  icon: Eye },
  ];

  return (
    <div className="cv-mobile-tab-bar">
      {tabs.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          className="cv-mobile-tab-btn"
          data-active={activeTab === id}
          onClick={() => onChange(id)}
          aria-label={label}
          aria-current={activeTab === id ? "page" : undefined}
        >
          {/* Badge on Sections tab showing active count */}
          {id === "sections" && activeSections.length > 0 && (
            <span className="cv-mobile-tab-badge">
              {activeSections.length}
            </span>
          )}
          <Icon
            size={18}
            strokeWidth={2.5}
            style={{ color: activeTab === id ? "#fff" : "var(--nm-text-secondary)" }}
          />
          <span className="cv-mobile-tab-label">{label}</span>
        </button>
      ))}
    </div>
  );
}
