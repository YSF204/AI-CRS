import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getTemplateById } from '../../../../Features/CVManagement/index.js';

const MemoizedTemplate = React.memo(({ Component, userName, formData }) => {
  if (!Component) return null;
  return <Component userName={userName} cvData={formData} />;
});

// ── A4 page constants ──
const A4_WIDTH = 794;
const A4_HEIGHT = 1123;
const FOOTER_ZONE = 60;  // dead space at bottom of every page
const HEADER_ZONE = 70;  // dead space at top of page 2+
const PUSH_BUFFER = 60;  // extra safety buffer when pushing content

export default function LivePreview({ formData, userName, templateId }) {
  const template = getTemplateById(templateId);
  const TemplateComponent = template?.component;

  const ZOOM = 0.52;

  const contentRef = useRef(null);
  const [pages, setPages] = useState(1);

  const paginate = useCallback(() => {
    const container = contentRef.current;
    if (!container) return;

    // ── Find blocks to paginate ──
    // Use "leaf" break-inside-avoid elements: the most granular blocks.
    // - For sections with entries (experience, education, custom): individual entries
    // - For atomic sections (summary, skills, languages): the section itself
    const allBreakAvoid = container.querySelectorAll('.break-inside-avoid');
    const leafBlocks = Array.from(allBreakAvoid).filter(el =>
      !el.querySelector('.break-inside-avoid')
    );

    // Also include <section> tags without break-inside-avoid that we might miss
    const standaloneSections = Array.from(container.querySelectorAll('section')).filter(s =>
      !s.classList.contains('break-inside-avoid') && !s.querySelector('.break-inside-avoid')
    );

    const blocks = [...leafBlocks, ...standaloneSections];

    if (!blocks.length) {
      setPages(Math.max(1, Math.ceil(container.scrollHeight / A4_HEIGHT)));
      return;
    }

    // Sort by DOM order (top to bottom)
    blocks.sort((a, b) => {
      const pos = a.compareDocumentPosition(b);
      return pos & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
    });

    // ① Reset all margins
    blocks.forEach((b) => { b.style.marginTop = ''; });
    void container.offsetHeight; // force reflow

    // ② Measure all in one pass
    const containerRect = container.getBoundingClientRect();
    const measurements = blocks.map((block) => {
      const rect = block.getBoundingClientRect();
      return {
        element: block,
        top: (rect.top - containerRect.top) / ZOOM,
        height: block.offsetHeight,
      };
    });

    // ③ Compute margins with cumulative shift
    let cumulativeShift = 0;
    const margins = [];

    for (const m of measurements) {
      const adjustedTop = m.top + cumulativeShift;
      const adjustedBottom = adjustedTop + m.height;

      // Which page is the top on?
      const page = Math.floor(adjustedTop / A4_HEIGHT);

      // Usable area ends FOOTER_ZONE px before next page
      const pageUsableEnd = (page + 1) * A4_HEIGHT - FOOTER_ZONE;

      // Does this block's bottom cross into the footer zone?
      if (adjustedBottom > pageUsableEnd) {
        // Only push if block can fit on one page
        const maxUsable = A4_HEIGHT - FOOTER_ZONE - HEADER_ZONE;
        if (m.height <= maxUsable) {
          // Push to next page's usable start + buffer
          const nextPageStart = (page + 1) * A4_HEIGHT + HEADER_ZONE + PUSH_BUFFER;
          const pushAmount = nextPageStart - adjustedTop;

          if (pushAmount > 0) {
            margins.push({ element: m.element, margin: pushAmount });
            cumulativeShift += pushAmount;
          }
        }
      }
    }

    // ④ Apply all margins
    for (const { element, margin } of margins) {
      element.style.marginTop = `${margin}px`;
    }

    // ⑤ Final page count
    void container.offsetHeight;
    setPages(Math.max(1, Math.ceil(container.scrollHeight / A4_HEIGHT)));
  }, []);

  useEffect(() => {
    if (!contentRef.current) return;

    const run = () => requestAnimationFrame(paginate);

    const ro = new ResizeObserver(run);
    ro.observe(contentRef.current);

    const mo = new MutationObserver(run);
    mo.observe(contentRef.current, { childList: true, subtree: true, characterData: true });

    setTimeout(run, 100);
    return () => { ro.disconnect(); mo.disconnect(); };
  }, [paginate, formData, userName, templateId]);

  if (!TemplateComponent) return null;

  const totalHeight = pages * A4_HEIGHT;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Title bar */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-[3px] border-[var(--border-color)] border-b-2 bg-[var(--nav-bg)] flex-shrink-0">
        <div className="flex gap-1.5">
          {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
            <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c, border: '1.5px solid rgba(0,0,0,0.18)' }} />
          ))}
        </div>
        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--fg-muted)] ml-1 flex-1">
          Preview — {template.name}
        </span>
        <span className="font-mono text-[9px] text-[var(--fg-muted)]">A4 · {Math.round(ZOOM * 100)}%</span>
      </div>

      {/* Preview viewport */}
      <div className="flex-1 overflow-auto flex justify-center p-4 border-[3px] border-[var(--border-color)] border-t-0"
        style={{ background: 'var(--bg, #0a0a0a)', scrollbarWidth: 'thin', scrollbarColor: 'rgba(0,0,0,0.2) transparent' }}>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          transformOrigin: 'top center',
          transform: `scale(${ZOOM})`,
          marginBottom: `${(ZOOM - 1) * totalHeight}px`,
          height: 'max-content'
        }}>
          <div style={{ position: 'relative', width: `${A4_WIDTH}px` }}>

            {/* White page backgrounds */}
            {Array.from({ length: pages }).map((_, i) => (
              <div key={`bg-${i}`} style={{
                position: 'absolute',
                top: `${i * A4_HEIGHT}px`,
                left: 0, width: '100%', height: `${A4_HEIGHT}px`,
                background: '#fff',
                boxShadow: '0 6px 32px rgba(0,0,0,0.28)',
                zIndex: 0, pointerEvents: 'none',
              }} />
            ))}

            {/* Page break separator in the dead zone between pages */}
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
                    background: 'var(--bg, #0a0a0a)',
                    borderTop: '2px dashed #444',
                    borderBottom: '2px dashed #444',
                  }} />
                  <span style={{ position: 'relative', color: '#666', fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.15em' }}>
                    — PAGE {i + 2} —
                  </span>
                </div>
              );
            })}

            {/* Content layer */}
            <div data-cv-content ref={contentRef} style={{
              width: '100%',
              position: 'relative',
              zIndex: 5,
              pointerEvents: 'none',
              userSelect: 'none',
              minHeight: `${totalHeight}px`,
            }}>
              <MemoizedTemplate Component={TemplateComponent} userName={userName} formData={formData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
