import React, { useEffect, useRef, useState } from 'react';
import api from '../../services/api';
import { getTemplateById } from '../../features/cv-management';
import { normalizeCvForTemplate, buildFileUrl } from './ViewerContent';

const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;

export default function CVPreviewFit({ application, cv, loadingCv }) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(0.5);

  const method = application.applicationMethod;
  const fileUrl = buildFileUrl(application.cvFile);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;

    const updateScale = () => {
      const { width, height } = el.getBoundingClientRect();
      if (!width || !height) return;
      const padding = 12;
      const s = Math.min(
        (width - padding * 2) / A4_WIDTH_PX,
        (height - padding * 2) / A4_HEIGHT_PX,
      );
      setScale(Math.max(s, 0.1));
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const template = getTemplateById(cv?.templateId || 1);
  const TemplateComponent = template?.component;
  const templateCvData = normalizeCvForTemplate(cv);

  if (method === 'manual' && !cv && fileUrl) {
    return (
      <div ref={containerRef} style={{ width: '100%', height: '100%', overflow: 'auto' }}>
        <iframe
          src={fileUrl}
          title="CV PDF"
          sandbox="allow-same-origin"
          style={{ width: '100%', height: '100%', minHeight: 500, border: 'none' }}
        />
      </div>
    );
  }

  if (loadingCv) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        fontFamily: 'var(--font-display)',
        fontWeight: 900,
        fontSize: 14,
        color: 'var(--nm-text-tertiary)',
        textTransform: 'uppercase',
      }}>
        Loading CV...
      </div>
    );
  }

  if (!cv) return null;

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
        background: 'var(--nm-bg)',
      }}
    >
      <div
        style={{
          width: `${A4_WIDTH_PX}px`,
          height: `${A4_HEIGHT_PX}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          background: '#fff',
          boxShadow: '4px 4px 0 var(--nm-ink)',
          border: '3px solid var(--nm-ink)',
        }}
      >
        {TemplateComponent ? (
          <TemplateComponent
            userName={cv.fullName || 'Candidate'}
            cvData={templateCvData}
          />
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            fontFamily: 'var(--font-display)',
            fontSize: 14,
            color: 'var(--nm-text-tertiary)',
            textTransform: 'uppercase',
          }}>
            Preview Unavailable
          </div>
        )}
      </div>
    </div>
  );
}
