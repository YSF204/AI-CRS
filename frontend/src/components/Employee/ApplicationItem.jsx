import React from 'react';
import { CheckCircle, Clock, XCircle } from 'lucide-react';

export const STATUS_CONFIG = {
  'Under Review': { bg: 'var(--yellow)', Icon: Clock        },
  'Shortlisted':  { bg: 'var(--mint)',   Icon: CheckCircle  },
  'Rejected':     { bg: 'var(--coral)',  Icon: XCircle      },
};

/**
 * ApplicationItem — renders a single application row inside AnimatedList.
 * Receives (app, index, isSelected) from AnimatedList's renderItem prop.
 */
export default function ApplicationItem({ app, isSelected }) {
  const { bg, Icon } = STATUS_CONFIG[app.status];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4">
      {/* Left: role details */}
      <div>
        <p
          className="font-bold font-['Space_Grotesk'] text-base uppercase tracking-tight"
          style={{ color: isSelected ? '#0a0a0a' : 'var(--fg)' }}
        >
          {app.role}
        </p>
        <p className="font-mono text-xs mt-0.5" style={{ color: isSelected ? '#0a0a0a99' : 'var(--fg-muted)' }}>
          {app.company}
        </p>
        <p className="font-mono text-xs mt-1" style={{ color: isSelected ? '#0a0a0a99' : 'var(--fg-muted)' }}>
          {app.date}
        </p>
      </div>

      {/* Right: status badge */}
      <span
        className="flex items-center gap-2 px-3 py-1.5 font-bold text-xs font-mono border-2 border-black self-start sm:self-auto shrink-0"
        style={{
          background: isSelected ? 'rgba(255,255,255,0.35)' : bg,
          color: '#0a0a0a',
        }}
      >
        <Icon size={12} />
        {app.status}
      </span>
    </div>
  );
}
