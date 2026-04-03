import React, { useState } from 'react';
import { Trash2, FileText, ChevronRight } from 'lucide-react';
import { getTemplateById } from '../../Features/CVManagement';

/**
 * CVCard — Brutalist neo-card for displaying a single CV.
 * Shows template badge, job title, last updated, skill chips, and delete action.
 */
export default function CVCard({ cv, onDelete }) {
  const [confirming, setConfirming] = useState(false);
  const template = getTemplateById(cv.templateId || 1);

  const handleDeleteClick = () => {
    if (confirming) {
      onDelete(cv.id);
      setConfirming(false);
    } else {
      setConfirming(true);
      // Auto-cancel confirm after 3 seconds
      setTimeout(() => setConfirming(false), 3000);
    }
  };

  const accent = cv.color || template.accent || 'var(--teal)';

  return (
    <div
      className="brutal-card flex flex-col gap-0 overflow-hidden"
      style={{ borderColor: 'var(--border-color)' }}
    >
      {/* Colored top accent bar */}
      <div
        style={{ background: accent, height: 6 }}
        aria-hidden="true"
      />

      <div className="p-5 flex flex-col flex-1 gap-3">
        {/* Template badge + title */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            <span
              className="font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 w-fit"
              style={{
                background: accent,
                color: '#0a0a0a',
                border: '2px solid #0a0a0a',
              }}
            >
              {template.name}
            </span>
            <h3
              className="text-base font-bold leading-tight mt-1"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {cv.name || 'Untitled CV'}
            </h3>
          </div>
          <FileText
            size={20}
            className="shrink-0 mt-1"
            style={{ color: 'var(--fg-muted)' }}
          />
        </div>

        {/* Last updated */}
        <p className="font-mono text-xs" style={{ color: 'var(--fg-muted)' }}>
          Updated {cv.updated}
        </p>

        {/* Skills chips */}
        {cv.skills?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-auto">
            {cv.skills.slice(0, 4).map((skill) => (
              <span
                key={skill}
                className="font-mono text-[10px] px-2 py-0.5 uppercase tracking-wide"
                style={{
                  border: '1.5px solid var(--border-color)',
                  background: 'var(--bg)',
                  color: 'var(--fg)',
                }}
              >
                {skill}
              </span>
            ))}
            {cv.skills.length > 4 && (
              <span
                className="font-mono text-[10px] px-2 py-0.5 uppercase tracking-wide"
                style={{ color: 'var(--fg-muted)' }}
              >
                +{cv.skills.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderTop: '2px solid var(--border-color)', background: 'var(--card-bg)' }}
      >
        <button
          onClick={handleDeleteClick}
          className="font-mono text-xs uppercase tracking-wide flex items-center gap-1.5 transition-colors"
          style={{
            color: confirming ? '#dc2626' : 'var(--fg-muted)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
          title={confirming ? 'Click again to confirm delete' : 'Delete CV'}
          aria-label={`Delete ${cv.name}`}
        >
          <Trash2 size={13} />
          {confirming ? 'Confirm?' : 'Delete'}
        </button>

        <button
          className="font-mono text-xs uppercase tracking-wide flex items-center gap-1"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'default',
            color: 'var(--fg-muted)',
            padding: 0,
          }}
          aria-hidden="true"
          tabIndex={-1}
        >
          View <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
}
