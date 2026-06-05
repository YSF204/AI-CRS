import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getTemplateById } from '../../../../features/cv-management/index.js';

const MemoizedTemplate = React.memo(({ Component, userName, formData, highlights }) => {
  if (!Component) return null;
  return <Component userName={userName} cvData={formData} highlights={highlights} />;
});

// ── A4 page constants (needed by MobilePreviewTab too) ──
const A4_WIDTH  = 794;
const A4_HEIGHT = 1123;
const FOOTER_ZONE = 60;
const HEADER_ZONE = 0;
const PUSH_BUFFER = 19;

/**
 * Mobile Preview Tab — shows the full CV with all pages and page-break
 * separators, dynamically scaled to fit the mobile screen width.
 * Uses ResizeObserver for scale and the same pagination algorithm as
 * the desktop LivePreview.
 */
function MobilePreviewTab({ formData, userName, TemplateComponent, highlights, template }) {
  const outerRef  = useRef(null);
  const contentRef = useRef(null);
  const [scale, setScale] = useState(0.43);
  const [pages, setPages] = useState(1);

  // ── Calculate scale from container width ─────────────────────────────
  useEffect(() => {
    const measure = () => {
      if (outerRef.current) {
        const w = outerRef.current.offsetWidth - 32; // 16px padding each side
        setScale(Math.min(1, Math.max(0.3, w / A4_WIDTH)));
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (outerRef.current) ro.observe(outerRef.current);
    return () => ro.disconnect();
  }, []);

  // ── Paginate: same algorithm as desktop LivePreview ───────────────────
  const paginate = useCallback((currentScale) => {
    const container = contentRef.current;
    if (!container) return;

    const allBreakAvoid = container.querySelectorAll('.break-inside-avoid');
    const leafBlocks = Array.from(allBreakAvoid).filter(
      el => !el.querySelector('.break-inside-avoid')
    );
    const standaloneSections = Array.from(container.querySelectorAll('section')).filter(
      s => !s.classList.contains('break-inside-avoid') && !s.querySelector('.break-inside-avoid')
    );
    const blocks = [...leafBlocks, ...standaloneSections];

    if (!blocks.length) {
      setPages(Math.max(1, Math.ceil(container.scrollHeight / A4_HEIGHT)));
      return;
    }

    const getGroupTarget = (block) => {
      const group = block.closest('.cv-page-group');
      if (group && container.contains(group)) return group;
      return block;
    };
    const targetByBlock = new Map();
    blocks.forEach(block => targetByBlock.set(block, getGroupTarget(block)));

    const elementsToMeasure = new Set();
    blocks.forEach(block => {
      elementsToMeasure.add(block);
      elementsToMeasure.add(targetByBlock.get(block));
    });

    blocks.sort((a, b) => {
      const pos = a.compareDocumentPosition(b);
      return pos & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
    });

    // ① Reset margins
    elementsToMeasure.forEach(el => {
      el.style.paddingTop = '';
      el.removeAttribute('data-pagination-margin');
    });
    void container.offsetHeight;

    // ② Measure (divide by scale to convert screen coords → document coords)
    const containerRect = container.getBoundingClientRect();
    const measurements = new Map();
    elementsToMeasure.forEach(block => {
      const rect = block.getBoundingClientRect();
      measurements.set(block, {
        top:    (rect.top - containerRect.top) / currentScale,
        height: block.offsetHeight,
      });
    });

    // ③ Compute & apply push margins
    let cumulativeShift = 0;
    const margins = [];
    const movedTargets = new Set();

    for (const block of blocks) {
      const bm = measurements.get(block);
      if (!bm) continue;
      const adjTop    = bm.top + cumulativeShift;
      const adjBottom = adjTop + bm.height;
      const page      = Math.floor(adjTop / A4_HEIGHT);
      const pageEnd   = (page + 1) * A4_HEIGHT - FOOTER_ZONE;

      if (adjBottom > pageEnd) {
        const maxUsable = A4_HEIGHT - FOOTER_ZONE - HEADER_ZONE;
        const target    = targetByBlock.get(block) || block;
        const tm        = measurements.get(target) || bm;
        let pushTarget  = target;
        let pushTop     = tm.top;
        let pushHeight  = tm.height;

        if (pushHeight > maxUsable) {
          pushTarget = block;
          pushTop    = bm.top;
          pushHeight = bm.height;
        }

        if (pushHeight <= maxUsable && !movedTargets.has(pushTarget)) {
          const adjTargetTop = pushTop + cumulativeShift;
          const targetPage   = Math.floor(adjTargetTop / A4_HEIGHT);
          const nextPageStart = (targetPage + 1) * A4_HEIGHT + HEADER_ZONE + PUSH_BUFFER;
          const pushAmount   = nextPageStart - adjTargetTop;
          if (pushAmount > 0) {
            margins.push({ element: pushTarget, margin: pushAmount });
            movedTargets.add(pushTarget);
            cumulativeShift += pushAmount;
          }
        }
      }
    }

    for (const { element, margin } of margins) {
      element.style.paddingTop = `${margin}px`;
      element.setAttribute('data-pagination-margin', 'true');
    }

    void container.offsetHeight;
    setPages(Math.max(1, Math.ceil(container.scrollHeight / A4_HEIGHT)));
  }, []);

  // ── Run pagination whenever content or scale changes ──────────────────
  useEffect(() => {
    if (!contentRef.current) return;
    const run = () => requestAnimationFrame(() => paginate(scale));
    const ro = new ResizeObserver(run);
    ro.observe(contentRef.current);
    const mo = new MutationObserver(run);
    mo.observe(contentRef.current, { childList: true, subtree: true, characterData: true });
    setTimeout(run, 120);
    return () => { ro.disconnect(); mo.disconnect(); };
  }, [paginate, scale, formData, userName]);

  const totalHeight      = pages * A4_HEIGHT;          // unscaled
  const scaledHeight     = Math.round(totalHeight * scale); // what the wrapper shows

  return (
    <div className="cv-mobile-preview-tab" ref={outerRef}>

      {/* ── Info banner ── */}
      <div
        style={{
          width: '100%',
          padding: '8px 12px',
          background: 'var(--nm-surface)',
          border: '2px solid var(--nm-ink)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 9,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--nm-text-tertiary)',
          }}
        >
          {template?.name} · {pages} page{pages !== 1 ? 's' : ''} · {Math.round(scale * 100)}% — switch to Editor to make changes
        </span>
      </div>

      {/* ── Scaled CV area: width=containerWidth, height=scaledHeight ── */}
      <div
        style={{
          width: '100%',
          height: scaledHeight,
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0,
          border: '3px solid var(--nm-ink)',
          boxShadow: '4px 4px 0 var(--nm-ink)',
        }}
      >
        {/* The inner scaled universe: 794px wide, transforms to fit */}
        <div
          style={{
            width: A4_WIDTH,
            position: 'absolute',
            top: 0,
            left: 0,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          {/* Page white backgrounds */}
          {Array.from({ length: pages }).map((_, i) => (
            <div
              key={`bg-${i}`}
              style={{
                position: 'absolute',
                top: i * A4_HEIGHT,
                left: 0,
                width: '100%',
                height: A4_HEIGHT,
                background: '#fff',
                boxShadow: '0 4px 24px rgba(0,0,0,0.22)',
                zIndex: 0,
                pointerEvents: 'none',
              }}
            />
          ))}

          {/* Page-break separators */}
          {pages > 1 && Array.from({ length: pages - 1 }).map((_, i) => {
            const breakY      = (i + 1) * A4_HEIGHT - FOOTER_ZONE;
            const breakHeight = FOOTER_ZONE + HEADER_ZONE;
            return (
              <div
                key={`sep-${i}`}
                style={{
                  position: 'absolute',
                  top: breakY,
                  left: -20,
                  right: -20,
                  height: breakHeight,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 60,
                  pointerEvents: 'none',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: '#d0d0d0',
                    borderTop: '2px dashed #888',
                    borderBottom: '2px dashed #888',
                  }}
                />
                <span
                  style={{
                    position: 'relative',
                    color: '#666',
                    fontSize: 10,
                    fontWeight: 'bold',
                    letterSpacing: '0.15em',
                  }}
                >
                  — PAGE {i + 2} —
                </span>
              </div>
            );
          })}

          {/* CV content */}
          <div
            data-cv-content
            ref={contentRef}
            style={{
              width: '100%',
              position: 'relative',
              zIndex: 5,
              pointerEvents: 'none',
              userSelect: 'none',
              minHeight: totalHeight,
            }}
          >
            <MemoizedTemplate
              Component={TemplateComponent}
              userName={userName}
              formData={formData}
              highlights={highlights}
            />
          </div>
        </div>
      </div>
    </div>
  );
}


// (A4 constants defined at top of file)

/**
 * LivePreview renders the CV template at a scaled size.
 *
 * Props:
 *  formData    — filtered CV form data
 *  userName    — display name
 *  templateId  — which template to render
 *  highlights  — optional highlight markers
 *  zoom        — override default zoom (desktop only)
 *  isMobileTab — when true, renders as a full-width scaled preview for the mobile Preview tab
 */
export default function LivePreview({ formData, userName, templateId, highlights, zoom: zoomProp, isMobileTab }) {

  const template = getTemplateById(templateId);
  const TemplateComponent = template?.component;

  const ZOOM = zoomProp || 0.52;

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

    const getGroupTarget = (block) => {
      const group = block.closest('.cv-page-group');
      if (group && container.contains(group)) return group;
      return block;
    };

    const targetByBlock = new Map();
    blocks.forEach((block) => {
      targetByBlock.set(block, getGroupTarget(block));
    });

    const elementsToMeasure = new Set();
    blocks.forEach((block) => {
      elementsToMeasure.add(block);
      elementsToMeasure.add(targetByBlock.get(block));
    });

    // Sort by DOM order (top to bottom)
    blocks.sort((a, b) => {
      const pos = a.compareDocumentPosition(b);
      return pos & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
    });

    // ① Reset all margins
    elementsToMeasure.forEach((el) => {
      el.style.paddingTop = '';
      el.removeAttribute('data-pagination-margin');
    });
    void container.offsetHeight; // force reflow

    // ② Measure all in one pass
    const containerRect = container.getBoundingClientRect();
    const measurements = new Map();
    elementsToMeasure.forEach((block) => {
      const rect = block.getBoundingClientRect();
      measurements.set(block, {
        element: block,
        top: (rect.top - containerRect.top) / ZOOM,
        height: block.offsetHeight,
      });
    });

    // ③ Compute margins with cumulative shift
    let cumulativeShift = 0;
    const margins = [];

    const movedTargets = new Set();

    for (const block of blocks) {
      const blockMetrics = measurements.get(block);
      if (!blockMetrics) continue;

      const adjustedTop = blockMetrics.top + cumulativeShift;
      const adjustedBottom = adjustedTop + blockMetrics.height;

      // Which page is the top on?
      const page = Math.floor(adjustedTop / A4_HEIGHT);

      // Usable area ends FOOTER_ZONE px before next page
      const pageUsableEnd = (page + 1) * A4_HEIGHT - FOOTER_ZONE;

      // Does this block's bottom cross into the footer zone?
      if (adjustedBottom > pageUsableEnd) {
        const maxUsable = A4_HEIGHT - FOOTER_ZONE - HEADER_ZONE;
        const target = targetByBlock.get(block) || block;
        const targetMetrics = measurements.get(target) || blockMetrics;

        let pushTarget = target;
        let pushTop = targetMetrics.top;
        let pushHeight = targetMetrics.height;

        if (pushHeight > maxUsable) {
          pushTarget = block;
          pushTop = blockMetrics.top;
          pushHeight = blockMetrics.height;
        }

        if (pushHeight <= maxUsable && !movedTargets.has(pushTarget)) {
          const adjustedTargetTop = pushTop + cumulativeShift;
          const targetPage = Math.floor(adjustedTargetTop / A4_HEIGHT);
          const nextPageStart = (targetPage + 1) * A4_HEIGHT + HEADER_ZONE + PUSH_BUFFER;
          const pushAmount = nextPageStart - adjustedTargetTop;

          if (pushAmount > 0) {
            margins.push({ element: pushTarget, margin: pushAmount });
            movedTargets.add(pushTarget);
            cumulativeShift += pushAmount;
          }
        }
      }
    }

    // ④ Apply all margins
    for (const { element, margin } of margins) {
      element.style.paddingTop = `${margin}px`;
      element.setAttribute('data-pagination-margin', 'true');
    }

    // ⑤ Final page count
    void container.offsetHeight;
    setPages(Math.max(1, Math.ceil(container.scrollHeight / A4_HEIGHT)));
  }, [ZOOM]);

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

  // ── Mobile Preview Tab ─────────────────────────────────────────────────────
  if (isMobileTab) {
    return <MobilePreviewTab formData={formData} userName={userName} TemplateComponent={TemplateComponent} highlights={highlights} template={template} />;
  }

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
              <MemoizedTemplate Component={TemplateComponent} userName={userName} formData={formData} highlights={highlights} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
