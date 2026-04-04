import React, { useMemo } from 'react';
import { Download, X } from 'lucide-react';
import { getTemplateById } from '../../../../Features/CVManagement/index.js';

export default function PreviewModal({ show, onClose, userName, getFilteredFormData, templateId, downloadingPdf, onDownloadPdf }) {
  if (!show) return null;

  const template = getTemplateById(templateId);
  const TemplateComponent = template?.component;

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(245,245,245,0.97)',
        backdropFilter: 'blur(6px)',
        zIndex: 9000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflow: 'hidden',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Floating action bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 20px',
        background: 'rgba(10,10,10,0.92)',
        backdropFilter: 'blur(8px)',
        borderBottom: '2px solid #333',
        width: '100%',
        flexShrink: 0,
        justifyContent: 'center',
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

      {/* Pure CV — centered, no container */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        justifyContent: 'center',
        padding: '32px 16px',
        width: '100%',
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(0,0,0,0.15) transparent',
      }}>
        <div style={{
          width: '794px',
          flexShrink: 0,
          background: '#fff',
          boxShadow: '0 2px 20px rgba(0,0,0,0.10)',
          alignSelf: 'flex-start',
        }}>
          {TemplateComponent ? <TemplateComponent userName={userName} cvData={getFilteredFormData()} /> : null}
        </div>
      </div>
    </div>
  );
}
