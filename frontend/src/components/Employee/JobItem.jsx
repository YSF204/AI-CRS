import React from 'react';
import { MapPin, Clock } from 'lucide-react';

const TYPE_COLORS = {
  'Full-time': 'var(--mint)',
  'Part-time': 'var(--yellow)',
  'Contract':  'var(--coral)',
};

/**
 * JobItem — renders a single job row inside AnimatedList.
 * Receives (job, index, isSelected) from AnimatedList's renderItem prop.
 */
export default function JobItem({ job, isSelected, onApply }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4">
      {/* Left: job details */}
      <div>
        <p
          className="font-bold font-['Space_Grotesk'] text-base uppercase tracking-tight"
          style={{ color: isSelected ? '#0a0a0a' : 'var(--fg)' }}
        >
          {job.title}
        </p>
        <p className="font-mono text-xs mt-0.5" style={{ color: isSelected ? '#0a0a0a99' : 'var(--fg-muted)' }}>
          {job.company}
        </p>
        <div
          className="flex items-center gap-4 mt-1.5 font-mono text-xs"
          style={{ color: isSelected ? '#0a0a0a99' : 'var(--fg-muted)' }}
        >
          <span className="flex items-center gap-1"><MapPin size={11} />{job.location}</span>
          <span className="flex items-center gap-1"><Clock size={11} />{job.posted}</span>
        </div>
      </div>

      {/* Right: type badge + apply button */}
      <div className="flex items-center gap-2 shrink-0">
        <span
          className="px-3 py-1 text-xs font-bold font-mono border-2 border-black"
          style={{
            background: isSelected ? 'rgba(255,255,255,0.35)' : TYPE_COLORS[job.type],
            color: '#0a0a0a',
          }}
        >
          {job.type}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); onApply?.(job); }}
          className="brutal-btn px-3 py-1.5 text-xs font-bold"
          style={{ background: isSelected ? '#ffe630' : 'var(--teal)', color: '#0a0a0a' }}
        >
          APPLY
        </button>
      </div>
    </div>
  );
}
