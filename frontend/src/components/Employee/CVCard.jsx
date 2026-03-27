import React from 'react';
import { FileText, Edit2, Trash2 } from 'lucide-react';

/**
 * CVCard — renders a single CV card with edit / delete actions.
 */
export default function CVCard({ cv, onDelete, onEdit }) {
  return (
    <div className="brutal-card bg-[var(--card-bg)] flex flex-col overflow-hidden">
      {/* Coloured accent strip */}
      <div className="h-2 w-full" style={{ background: cv.color }} />

      {/* Card body */}
      <div className="flex flex-col flex-1 p-5 gap-4">
        {/* Icon + name */}
        <div className="flex items-start gap-3">
          <div className="p-2 border-2 border-black shrink-0" style={{ background: cv.color }}>
            <FileText size={20} color="#0a0a0a" />
          </div>
          <div>
            <h2 className="font-bold font-['Space_Grotesk'] text-base uppercase tracking-tight leading-tight">
              {cv.name}
            </h2>
            <p className="font-mono text-xs text-[var(--fg-muted)] mt-1">Updated {cv.updated}</p>
          </div>
        </div>

        {/* Skill tags */}
        <div className="flex flex-wrap gap-1.5">
          {cv.skills.map((skill) => (
            <span
              key={skill}
              className="px-2 py-0.5 text-xs font-mono font-bold border-2 border-black"
              style={{ background: 'var(--mint)', color: '#0a0a0a' }}
            >
              {skill}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-auto pt-2 border-t-2 border-black border-dashed">
          <button
            onClick={() => onEdit?.(cv)}
            className="brutal-btn flex-1 py-2 flex items-center justify-center gap-2 text-xs font-bold"
            style={{ background: 'var(--teal)', color: '#0a0a0a' }}
          >
            <Edit2 size={13} />
            EDIT
          </button>
          <button
            onClick={() => onDelete?.(cv.id)}
            className="brutal-btn px-4 py-2 flex items-center justify-center gap-2 text-xs font-bold"
            style={{ background: 'var(--coral)', color: '#0a0a0a' }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
