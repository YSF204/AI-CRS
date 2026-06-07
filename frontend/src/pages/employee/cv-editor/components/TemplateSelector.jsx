import React, { useRef, useState, useEffect } from "react";


function TemplatePreviewCard({
  tmpl,
  isActive,
  onClick,
  disabled,
  userName,
  cvData,
}) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(0.35);

  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        const w = containerRef.current.offsetWidth;
        setScale(w / 794); // A4 width = 794px
      }
    };

    measure();

    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Card preview height follows the A4 aspect ratio
  const containerHeight = Math.round(scale * 1123);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      data-active={isActive}
      className="template-selector-card"
      style={{ width: "100%" }}
    >
      {/* CV preview area — dynamically scaled */}
      <div
        ref={containerRef}
        className="template-preview-container"
        style={{ height: containerHeight }}
      >
        <div
          className="template-preview-inner"
          style={{ transform: `scale(${scale})` }}
        >
          <tmpl.component userName={userName} cvData={cvData} />
        </div>
      </div>

      {/* Template name */}
      <span className="template-card-label">
        {isActive ? `✓ ${tmpl.name}` : tmpl.name}
      </span>
    </button>
  );
}


export default function TemplateSelector({
  show,
  onClose,
  templates,
  currentTemplateId,
  onSelect,
  saving,
  userName,
  getFilteredFormData,
}) {
  if (!show) return null;

  const cvData = getFilteredFormData();

  return (
    <div
      className="template-selector-backdrop"
      onClick={onClose}
    >
      {/* Modal box — stopPropagation prevents backdrop click from closing */}
      <div
        className="template-selector-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "16px 24px",
            background: "var(--nm-ink)",
            borderBottom: "4px solid var(--nm-ink)",
            flexShrink: 0,
          }}
        >
          <div style={{ flex: 1 }}>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                fontSize: 13,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                color: "#fff",
              }}
            >
              Select Template
            </span>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 600,
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "rgba(255,255,255,0.55)",
                margin: "3px 0 0",
              }}
            >
              {templates.length} templates available
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="nm-btn"
            style={{
              padding: "10px 20px",
              background: "var(--nm-error)",
              color: "#fff",
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              fontSize: 11,
              textTransform: "uppercase",
              border: "3px solid rgba(255,255,255,0.3)",
              boxShadow: "none",
            }}
          >
            ✕ Close
          </button>
        </div>

        {/* ── Responsive template grid ── */}
        <div className="template-selector-grid">
          {templates.map((tmpl) => {
            const isActive = currentTemplateId === tmpl.id;
            return (
              <TemplatePreviewCard
                key={tmpl.id}
                tmpl={tmpl}
                isActive={isActive}
                onClick={() => !isActive && !saving && onSelect(tmpl.id)}
                disabled={saving || isActive}
                userName={userName}
                cvData={cvData}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
