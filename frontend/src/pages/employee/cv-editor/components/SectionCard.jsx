import React from "react";
import SectionCardHeader from "./SectionCardHeader";
import SectionCardBody from "./SectionCardBody";

export default function SectionCard({
  sectionKey,
  form,
  handlers,
  onRemove,
  collapsed,
  onToggleCollapse,
  onAnalyzeSection,
}) {
  return (
    <div className="nm-card" style={{ padding: 0, overflow: "hidden" }}>
      <SectionCardHeader
        sectionKey={sectionKey}
        collapsed={collapsed}
        onToggleCollapse={onToggleCollapse}
        onRemove={onRemove}
        onAnalyzeSection={onAnalyzeSection}
      />
      <div
        style={{
          maxHeight: collapsed ? 0 : 1200,
          overflow: "hidden",
          transition: "max-height 0.3s ease-out",
          background: "var(--nm-bg)",
        }}
      >
        <div className="p-6">
          <SectionCardBody sectionKey={sectionKey} form={form} handlers={handlers} />
        </div>
      </div>
    </div>
  );
}
