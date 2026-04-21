import React from 'react';

/**
 * StatsBar — reusable horizontal stats grid with Paper design system.
 *
 * @param {{ label: string, value: string|number, color: string }[]} stats
 * @param {string} [className]
 */
export default function StatsBar({ stats = [], className = '', mode = 'compact' }) {
  if (mode === 'compact') {
    return (
      <div className={`flex flex-wrap items-center gap-6 mb-6 px-4 py-3 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg ${className}`}>
        {stats.map((s, idx) => (
          <div key={s.label} className="flex items-center gap-2">
            <span className="text-lg font-bold font-['Montserrat']" style={{ color: s.color }}>
              {s.value}
            </span>
            <span className="text-mono text-xs text-[var(--color-text-secondary)] uppercase tracking-wider">
              {s.label}
            </span>
            {idx < stats.length - 1 && (
              <div className="hidden sm:block w-px h-6 bg-[var(--border-color)] ml-6"></div>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid gap-4 mb-8 ${className}`} style={{ gridTemplateColumns: `repeat(${stats.length}, 1fr)` }}>
      {stats.map((s) => (
        <div key={s.label} className="kpi-card p-4 bg-[var(--card-bg)] flex flex-col items-center hover-lift border border-[var(--border-color)] rounded-lg shadow-sm">
          <span className="text-display-lg font-bold font-['Montserrat']" style={{ color: s.color }}>
            {s.value}
          </span>
          <span className="text-mono text-xs text-[var(--color-text-secondary)] uppercase tracking-wider mt-1">
            {s.label}
          </span>
        </div>
      ))}
    </div>
  );
}
