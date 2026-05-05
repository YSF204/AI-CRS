import React from 'react';

export default function StatsBar({ stats = [], className = '', mode = 'compact' }) {
  if (mode === 'compact') {
    return (
      <div className={`flex flex-wrap items-center gap-4 sm:gap-6 mb-6 px-3 sm:px-4 py-3 bg-[var(--nm-surface)] border-4 border-[var(--nm-ink)] min-w-0 ${className}`}>
        {stats.map((s, idx) => (
          <div key={s.label} className="flex items-center gap-2 min-w-0">
            <span className="text-base sm:text-lg font-bold font-['Space_Grotesk']" style={{ color: s.color }}>
              {s.value}
            </span>
            <span className="font-['DM_Mono'] text-[10px] sm:text-xs text-[var(--nm-text-tertiary)] uppercase tracking-wider truncate">
              {s.label}
            </span>
            {idx < stats.length - 1 && (
              <div className="hidden sm:block w-px h-6 bg-[var(--nm-ink)] ml-4 sm:ml-6"></div>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid-metrics mb-8 min-w-0 ${className}`}>
      {stats.map((s) => (
        <div key={s.label} className="p-4 bg-[var(--nm-surface)] flex flex-col items-center border-4 border-[var(--nm-ink)] shadow-[4px_4px_0_var(--nm-ink)] min-w-0 hover-lift">
          <span className="text-2xl sm:text-3xl font-bold font-['Space_Grotesk']" style={{ color: s.color }}>
            {s.value}
          </span>
          <span className="font-['DM_Mono'] text-[10px] sm:text-xs text-[var(--nm-text-tertiary)] uppercase tracking-wider mt-1 truncate">
            {s.label}
          </span>
        </div>
      ))}
    </div>
  );
}
