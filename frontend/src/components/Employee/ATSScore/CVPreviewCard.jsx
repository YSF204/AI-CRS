import React, { useEffect, useRef, useState } from 'react';
import { Calendar, Zap, LayoutTemplate, Loader2 } from 'lucide-react';
import { getTemplateById } from '../../../Features/CVManagement/index.js';

const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;
const PREVIEW_PADDING = 16;

const normalizeCvForTemplate = (cv) => ({
  fullName: cv?.fullName || 'Candidate',
  jobTitle: cv?.jobTitle || '',
  summary: cv?.summary || '',
  contact: {
    phone: cv?.contact?.phone || '',
    email: cv?.contact?.email || '',
    github: cv?.contact?.github || '',
    linkedin: cv?.contact?.linkedin || '',
  },
  address: {
    city: cv?.address?.city || '',
    street: cv?.address?.street || '',
  },
  experience: cv?.experience || [],
  education: cv?.education || [],
  technicalSkills: cv?.technicalSkills || [],
  softSkills: cv?.softSkills || [],
  language: cv?.language || [],
  customSections: cv?.customSections || [],
  profileImage: cv?.profileImage || '',
  layout: {
    ...(cv?.layout || {}),
    sectionOrder:
      Array.isArray(cv?.layout?.sectionOrder) && cv.layout.sectionOrder.length > 0
        ? cv.layout.sectionOrder
        : [
          'summary',
          'experience',
          'education',
          'customSections',
          'technicalSkills',
          'softSkills',
          'language',
        ],
  },
});

export default function CVPreviewCard({ cv, loading, analyzingId, onAnalyze }) {
  const viewportRef = useRef(null);
  const [scale, setScale] = useState(0.28);
  const createdDate = new Date(cv.updatedAt || cv.createdAt).toLocaleDateString();
  const templateObj = getTemplateById(cv.templateId || 1);
  const TemplateComponent = templateObj.component;
  const templateCvData = normalizeCvForTemplate(cv);

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
    <div className="ats-preview-card">
      <div ref={viewportRef} className="ats-preview-viewport">
        <div
          className="ats-preview-scaler"
          style={{
            width: `${A4_WIDTH_PX}px`,
            height: `${A4_HEIGHT_PX}px`,
            transform: `translate(-50%, -50%) scale(${scale})`,
          }}
        >
          {TemplateComponent ? (
            <TemplateComponent
              userName={cv.fullName || "Candidate"}
              cvData={templateCvData}
            />
          ) : (
            <div className="ats-preview-fallback">
              <LayoutTemplate size={24} />
              <span>Preview Unavailable</span>
            </div>
          )}
        </div>
      </div>

      <div className="ats-card-content">
        <div className="ats-card-header">
          <h3 className="ats-card-title truncate" title={cv.jobTitle || 'Untitled CV'}>
            {cv.jobTitle || 'Untitled CV'}
          </h3>
          <div className="ats-card-meta">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} /> {createdDate}
            </span>
            <span className="flex items-center gap-1.5 ml-auto text-[var(--nm-text-tertiary)]">
              <LayoutTemplate size={14} /> {templateObj.name}
            </span>
          </div>
        </div>

        <button
          onClick={() => onAnalyze(cv._id)}
          disabled={loading}
          className="jd-btn jd-btn-primary w-full"
          aria-live="polite"
        >
          {analyzingId === cv._id ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={16} className="animate-spin" /> Analyzing...
            </span>
          ) : loading ? (
            <span className="flex items-center justify-center gap-2 opacity-60">
              <Zap size={16} /> Analyze This CV
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Zap size={16} /> Analyze This CV
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
