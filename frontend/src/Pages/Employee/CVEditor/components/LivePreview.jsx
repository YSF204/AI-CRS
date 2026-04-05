
import React, { useState, useEffect, useRef } from 'react';
import { getTemplateById } from '../../../../Features/CVManagement/index.js';

const MemoizedTemplate = React.memo(({ Component, userName, formData }) => {
  if (!Component) return null;
  return <Component userName={userName} cvData={formData} />;
});

export default function LivePreview({ formData, userName, templateId }) {
  const template = getTemplateById(templateId);
  const TemplateComponent = template?.component;
  const ZOOM = 0.52;
  const A4_HEIGHT = 1123;
  
  const contentRef = useRef(null);
  const [pages, setPages] = useState(1);

  // Measure natural content height to draw necessary page lines
  useEffect(() => {
    if (!contentRef.current) return;
    
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // We measure the direct scroll height of the inner container
        const h = entry.target.scrollHeight;
        const requiredPages = Math.max(1, Math.ceil(h / A4_HEIGHT));
        if (requiredPages !== pages) setPages(requiredPages);
      }
    });

    observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, [pages]);

  if (!TemplateComponent) return null;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Title bar */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-[3px] border-[var(--border-color)] border-b-2 bg-[var(--nav-bg)] flex-shrink-0">
        <div className="flex gap-1.5">
          {['#ff5f57','#febc2e','#28c840'].map((c) => (
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
        
        {/* Container that acts as the scaled A4 wrapper */}
        <div style={{
           display: 'flex',
           justifyContent: 'center',
           transformOrigin: 'top center',
           transform: `scale(${ZOOM})`,
           marginBottom: `${(ZOOM - 1) * (pages * A4_HEIGHT)}px`,
           height: 'max-content'
        }}>
           
           {/* Wrapping Context for Pages Overlay */}
           <div style={{ position: 'relative' }}>
             
             {/* Visual Page Separators */}
             {pages > 1 && Array.from({ length: pages - 1 }).map((_, i) => (
               <div key={i} className="print:hidden" style={{
                 position: 'absolute',
                 top: `${(i + 1) * A4_HEIGHT - 20}px`, // Center the 40px line on the cut
                 left: '-16px',
                 right: '-16px',
                 height: '40px',
                 background: 'var(--bg, #0a0a0a)',
                 borderTop: '2px dashed #444',
                 borderBottom: '2px dashed #444',
                 zIndex: 50,
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 opacity: 0.95,
                 pointerEvents: 'none'
               }}>
                 <span style={{ color: '#888', fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.2em' }}>PAGE {i + 2}</span>
               </div>
             ))}

             {/* Actual White Document Background Container */}
             <div data-cv-content style={{
               width: '794px',
               minHeight: `${pages * A4_HEIGHT}px`,
               background: '#fff',
               boxShadow: '0 6px 32px rgba(0,0,0,0.28)',
               pointerEvents: 'none',
               userSelect: 'none',
             }}>
               {/* Inner Content Measure Container */}
               <div ref={contentRef} style={{ width: '100%' }}>
                 <MemoizedTemplate Component={TemplateComponent} userName={userName} formData={formData} />
               </div>
             </div>

           </div>
        </div>
      </div>
    </div>
  );
}
