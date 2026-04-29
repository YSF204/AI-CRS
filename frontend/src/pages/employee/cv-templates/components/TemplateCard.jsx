import React, { useEffect, useRef, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import {
  MOCK_CV_DATA,
  MOCK_USER_NAME,
} from "../../../../features/cv-management/mockCvData.js";

const TAG_COLORS = {
  Popular: { bg: "#facc15", text: "#0a0a0a" },
  Clean: { bg: "#a7f3d0", text: "#0a0a0a" },
  Premium: { bg: "#2563eb", text: "#ffffff" },
  Corporate: { bg: "#14b8a6", text: "#0a0a0a" },
  Creative: { bg: "#f97316", text: "#0a0a0a" },
  Formal: { bg: "#c4b89a", text: "#0a0a0a" },
  Elegant: { bg: "#a0a0b0", text: "#0a0a0a" },
};

const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;
const PREVIEW_PADDING = 12;

function TemplatePreview({ template }) {
  const viewportRef = useRef(null);
  const [scale, setScale] = useState(0.28);
  const TemplateComponent = template.component;

  useEffect(() => {
    const viewportEl = viewportRef.current;
    if (!viewportEl) return undefined;

    const updateScale = () => {
      const { width, height } = viewportEl.getBoundingClientRect();
      if (!width || !height) return;

      const nextScale = Math.min(
        (width - PREVIEW_PADDING * 2) / A4_WIDTH_PX,
        (height - PREVIEW_PADDING * 2) / A4_HEIGHT_PX,
      );

      setScale(Math.max(nextScale, 0.1));
    };

    updateScale();

    const observer = new ResizeObserver(updateScale);
    observer.observe(viewportEl);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={viewportRef}
      className="ats-preview-viewport"
      style={{
        aspectRatio: "0.81",
      }}
    >
      <div
        className="ats-preview-scaler"
        style={{
          width: `${A4_WIDTH_PX}px`,
          height: `${A4_HEIGHT_PX}px`,
          transform: `translate(-50%, -50%) scale(${scale})`,
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        <TemplateComponent userName={MOCK_USER_NAME} cvData={MOCK_CV_DATA} />
      </div>
    </div>
  );
}

export default function TemplateCard({ template, isSelected, onSelect }) {
  const tagStyle = TAG_COLORS[template.tag] || {
    bg: "var(--card-bg)",
    text: "var(--fg)",
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onSelect(template)}
      onClick={() => onSelect(template)}
      className="ats-preview-card cursor-pointer"
      style={{
        borderColor: isSelected ? template.accent : "var(--border-color)",
        boxShadow: isSelected
          ? `6px 6px 0 ${template.accent}`
          : "4px 4px 0 var(--nm-ink)",
        transform: isSelected ? "translate(-2px, -2px)" : undefined,
        transition:
          "transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease",
        outline: "none",
      }}
    >
      <div style={{ position: "relative" }}>
        <TemplatePreview template={template} />

        {isSelected && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `${template.accent}22`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CheckCircle2
              size={48}
              style={{
                color: template.accent,
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
              }}
            />
          </div>
        )}
      </div>

      <div className="ats-card-content">
        <div
          className="ats-card-header"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <h3
            className="ats-card-title"
            style={{ textAlign: "center", marginBottom: 0 }}
          >
            {template.name}
          </h3>
        </div>
      </div>
    </div>
  );
}
