import React from 'react';

/**
 * StatsBar — reusable horizontal stats grid with Paper design system.
 *
 * @param {{ label: string, value: string|number, color: string }[]} stats
 * @param {string} [className]
 */
export default function StatsBar({ stats = [], className = '' }) {
  return (
    <div className={`grid gap-4 mb-8 ${className}`} style={{ gridTemplateColumns: `repeat(${stats.length}, 1fr)` }}>
      {stats.map((s) => (
        <div key={s.label} className="kpi-card p-4 bg-[var(--card-bg)] flex flex-col items-center hover-lift">
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
