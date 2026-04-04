import React, { useMemo } from 'react';
import { getTemplateById } from '../../../../Features/CVManagement/index.js';

const MemoizedTemplate = React.memo(({ Component, userName, formData }) => {
  if (!Component) return null;
  return <Component userName={userName} cvData={formData} />;
});

export default function LivePreview({ formData, userName, templateId }) {
  const template = getTemplateById(templateId);
  const TemplateComponent = template?.component;
  const ZOOM = 0.52;
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
           marginBottom: `${(ZOOM - 1) * 1123}px`,
           height: 'max-content'
        }}>
           <div data-cv-content style={{
             width: '794px',
             minHeight: '1123px',
             background: '#fff',
             boxShadow: '0 6px 32px rgba(0,0,0,0.28)',
             pointerEvents: 'none',
             userSelect: 'none',
           }}>
             <MemoizedTemplate Component={TemplateComponent} userName={userName} formData={formData} />
           </div>
        </div>
      </div>
    </div>
  );
}
