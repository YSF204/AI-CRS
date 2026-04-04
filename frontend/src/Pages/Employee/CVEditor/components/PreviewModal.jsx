import React, { useState, useEffect, useRef } from 'react';
import { Download, X } from 'lucide-react';
import { getTemplateById } from '../../../../Features/CVManagement/index.js';

export default function PreviewModal({ show, onClose, userName, getFilteredFormData, templateId, downloadingPdf, onDownloadPdf }) {
  const contentRef = useRef(null);
  const [pages, setPages] = useState(1);
  const A4_HEIGHT = 1123;

  useEffect(() => {
    if (!show || !contentRef.current) return;
    
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const h = entry.target.scrollHeight;
        const requiredPages = Math.max(1, Math.ceil(h / A4_HEIGHT));
        if (requiredPages !== pages) setPages(requiredPages);
      }
    });

    observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, [show, pages]);

  if (!show) return null;

  const template = getTemplateById(templateId);
  const TemplateComponent = template?.component;

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(10,10,10,0.55)',
        backdropFilter: 'blur(6px)',
        zIndex: 9000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Modal popup */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        maxWidth: '900px',
        maxHeight: '85vh',
        background: '#fafafa',
        borderRadius: '12px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
        overflow: 'hidden',
      }}>
        {/* Top bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '10px 20px',
          background: 'rgba(10,10,10,0.92)',
          borderBottom: '2px solid #333',
          flexShrink: 0,
        }}>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 900, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#fff', marginRight: 'auto' }}>
            Preview — {template?.name || 'CV'}
          </span>
          <button onClick={onDownloadPdf} disabled={downloadingPdf}
            className="flex items-center gap-2 font-['Space_Grotesk'] font-bold text-xs uppercase tracking-wider px-4 py-2 bg-transparent text-white border-2 border-gray-600 hover:border-white transition-colors">
            <Download size={12} /> {downloadingPdf ? 'Generating…' : 'Download PDF'}
          </button>
          <button onClick={onClose}
            className="flex items-center gap-1 font-['Space_Grotesk'] font-bold text-xs uppercase tracking-wider px-4 py-2 bg-[#ffe630] text-[#0a0a0a] border-2 border-[#0a0a0a]">
            <X size={12} /> Close
          </button>
        </div>

        {/* Scrollable CV area */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          justifyContent: 'center',
          padding: '40px 16px',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(0,0,0,0.15) transparent',
        }}>
          
          <div style={{ position: 'relative' }}>
            {/* Visual Page Separators */}
            {pages > 1 && Array.from({ length: pages - 1 }).map((_, i) => (
              <div key={i} className="print:hidden" style={{
                position: 'absolute',
                top: `${(i + 1) * A4_HEIGHT - 20}px`, // Center the 40px line on the cut
                left: '-16px',
                right: '-16px',
                height: '40px',
                background: '#fafafa',
                borderTop: '2px dashed #bbb',
                borderBottom: '2px dashed #bbb',
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
              boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
              alignSelf: 'flex-start',
              position: 'relative'
            }}>
              {/* Inner Content Measure Container */}
              <div ref={contentRef} style={{ width: '100%' }}>
                 {TemplateComponent ? <TemplateComponent userName={userName} cvData={getFilteredFormData()} /> : null}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
