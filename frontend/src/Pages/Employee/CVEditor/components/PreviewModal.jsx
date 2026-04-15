import React, { useState, useEffect, useRef, useCallback } from "react";
import { Download, X } from "lucide-react";
import { getTemplateById } from "../../../../Features/CVManagement/index.js";

// ── A4 page constants (must match LivePreview) ──
const A4_WIDTH = 794;
const A4_HEIGHT = 1123;
const FOOTER_ZONE = 60;
const HEADER_ZONE = 60;
const PUSH_BUFFER = 8;

export default function PreviewModal({
  show,
  onClose,
  userName,
  getFilteredFormData,
  templateId,
  downloadingPdf,
  onDownloadPdf,
}) {
  const contentRef = useRef(null);
  const [pages, setPages] = useState(1);

  const paginate = useCallback(() => {
    const container = contentRef.current;
    if (!container) return;

    // Leaf break-inside-avoid blocks (most granular)
    const allBreakAvoid = container.querySelectorAll('.break-inside-avoid');
    const leafBlocks = Array.from(allBreakAvoid).filter(el =>
      !el.querySelector('.break-inside-avoid')
    );

    const standaloneSections = Array.from(container.querySelectorAll('section')).filter(s =>
      !s.classList.contains('break-inside-avoid') && !s.querySelector('.break-inside-avoid')
    );

    const blocks = [...leafBlocks, ...standaloneSections];

    if (!blocks.length) {
      setPages(Math.max(1, Math.ceil(container.scrollHeight / A4_HEIGHT)));
      return;
    }

    blocks.sort((a, b) => {
      const pos = a.compareDocumentPosition(b);
      return pos & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
    });

    // Reset
    blocks.forEach((b) => { b.style.marginTop = ''; });
    void container.offsetHeight;

    // Measure (no scale in modal)
    const containerRect = container.getBoundingClientRect();
    const measurements = blocks.map((block) => {
      const rect = block.getBoundingClientRect();
      return {
        element: block,
        top: rect.top - containerRect.top,
        height: block.offsetHeight,
      };
    });

    // Compute
    let cumulativeShift = 0;
    const margins = [];

    for (const m of measurements) {
      const adjustedTop = m.top + cumulativeShift;
      const adjustedBottom = adjustedTop + m.height;

      const page = Math.floor(adjustedTop / A4_HEIGHT);
      const pageUsableEnd = (page + 1) * A4_HEIGHT - FOOTER_ZONE;

      if (adjustedBottom > pageUsableEnd) {
        const maxUsable = A4_HEIGHT - FOOTER_ZONE - HEADER_ZONE;
        if (m.height <= maxUsable) {
          const nextPageStart = (page + 1) * A4_HEIGHT + HEADER_ZONE + PUSH_BUFFER;
          const pushAmount = nextPageStart - adjustedTop;

          if (pushAmount > 0) {
            margins.push({ element: m.element, margin: pushAmount });
            cumulativeShift += pushAmount;
          }
        }
      }
    }

    // Apply
    for (const { element, margin } of margins) {
      element.style.marginTop = `${margin}px`;
    }

    void container.offsetHeight;
    setPages(Math.max(1, Math.ceil(container.scrollHeight / A4_HEIGHT)));
  }, []);

  useEffect(() => {
    if (!show || !contentRef.current) return;

    const run = () => requestAnimationFrame(paginate);

    const ro = new ResizeObserver(run);
    ro.observe(contentRef.current);

    const mo = new MutationObserver(run);
    mo.observe(contentRef.current, { childList: true, subtree: true, characterData: true });

    setTimeout(run, 100);
    return () => { ro.disconnect(); mo.disconnect(); };
  }, [show, paginate]);

  if (!show) return null;

  const template = getTemplateById(templateId);
  const TemplateComponent = template?.component;
  const totalHeight = pages * A4_HEIGHT;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(10,10,10,0.55)",
        backdropFilter: "blur(6px)",
        zIndex: 9000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          maxWidth: "900px",
          maxHeight: "85vh",
          background: "#fafafa",
          borderRadius: "12px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
          overflow: "hidden",
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "10px 20px",
            background: "rgba(10,10,10,0.92)",
            borderBottom: "2px solid #333",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 900,
              fontSize: "13px",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "#fff",
              marginRight: "auto",
            }}
          >
            Preview — {template?.name || "CV"}
          </span>
          <button
            onClick={onDownloadPdf}
            disabled={downloadingPdf}
            className="flex items-center gap-2 font-['Space_Grotesk'] font-bold text-xs uppercase tracking-wider px-4 py-2 bg-transparent text-white border-2 border-gray-600 hover:border-white transition-colors"
          >
            <Download size={12} />{" "}
            {downloadingPdf ? "Generating…" : "Download PDF"}
          </button>
          <button
            onClick={onClose}
            className="flex items-center gap-1 font-['Space_Grotesk'] font-bold text-xs uppercase tracking-wider px-4 py-2 bg-[#ffe630] text-[#0a0a0a] border-2 border-[#0a0a0a]"
          >
            <X size={12} /> Close
          </button>
        </div>

        {/* Scrollable CV area */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            display: "flex",
            justifyContent: "center",
            padding: "40px 16px",
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(0,0,0,0.15) transparent",
          }}
        >
          <div style={{ position: "relative", width: `${A4_WIDTH}px`, minHeight: `${totalHeight}px` }}>

            {/* White page backgrounds */}
            {Array.from({ length: pages }).map((_, i) => (
              <div key={`bg-${i}`} style={{
                position: 'absolute',
                top: `${i * A4_HEIGHT}px`,
                left: 0, width: '100%', height: `${A4_HEIGHT}px`,
                background: '#fff',
                boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
                zIndex: 0, pointerEvents: 'none',
              }} />
            ))}

            {/* Page break separator */}
            {pages > 1 && Array.from({ length: pages - 1 }).map((_, i) => {
              const breakY = (i + 1) * A4_HEIGHT - FOOTER_ZONE;
              const breakHeight = FOOTER_ZONE + HEADER_ZONE;
              return (
                <div key={`sep-${i}`} className="print:hidden" style={{
                  position: 'absolute',
                  top: `${breakY}px`,
                  left: '-20px', right: '-20px',
                  height: `${breakHeight}px`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  zIndex: 60, pointerEvents: 'none',
                }}>
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: '#fafafa',
                    borderTop: '2px dashed #bbb',
                    borderBottom: '2px dashed #bbb',
                  }} />
                  <span style={{ position: 'relative', color: '#888', fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.15em' }}>
                    — PAGE {i + 2} —
                  </span>
                </div>
              );
            })}

            {/* Content layer */}
            <div
              data-cv-content
              ref={contentRef}
              style={{
                width: "100%",
                position: "relative",
                zIndex: 5,
                minHeight: `${totalHeight}px`,
              }}
            >
              {TemplateComponent ? (
                <TemplateComponent
                  userName={userName}
                  cvData={getFilteredFormData()}
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
