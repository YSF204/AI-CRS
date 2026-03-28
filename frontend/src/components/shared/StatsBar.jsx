import React from 'react';

/**
 * StatsBar — reusable horizontal stats grid.
 *
 * @param {{ label: string, value: string|number, color: string }[]} stats
 * @param {string} [className]
 */
export default function StatsBar({ stats = [], className = '' }) {
  return (
    <div className={`grid gap-4 mb-8 ${className}`} style={{ gridTemplateColumns: `repeat(${stats.length}, 1fr)` }}>
      {stats.map((s) => (
        <div key={s.label} className="brutal-card p-4 bg-(--card-bg) flex flex-col items-center">
          <span className="text-2xl font-bold font-['Space_Grotesk']" style={{ color: s.color }}>
            {s.value}
          </span>
          <span className="text-xs font-mono text-(--fg-muted) uppercase tracking-wider mt-1">
            {s.label}
          </span>
        </div>
      ))}
    </div>
  );
}
