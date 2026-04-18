import React from 'react';

const stats = [
  { value: '500+', label: 'CVs Built', icon: '◆' },
  { value: '98%', label: 'ATS Pass Rate', icon: '◆' },
  { value: '4', label: 'Developers', icon: '◆' },
  { value: '3', label: 'AI Models', icon: '◆' },
];

export default function StatsSection() {
  return (
    <section className="w-full">
      {/* Scrolling marquee strip — editorial ticker */}
      <div
        className="w-full overflow-hidden whitespace-nowrap"
        style={{
          borderTop: '1px solid var(--border-color)',
          borderBottom: '1px solid var(--border-color)',
          background: 'var(--bg-alt)',
          padding: 'clamp(0.5rem, 1%, 0.7rem) 0',
        }}
      >
        <div className="marquee-track inline-flex" style={{ gap: 'clamp(2rem, 4%, 3rem)' }}>
          {[...Array(3)].map((_, rep) => (
            <React.Fragment key={rep}>
              {stats.map((s, i) => (
                <span
                  key={`${rep}-${i}`}
                  style={{
                    fontFamily: "'Public Sans', sans-serif",
                    fontSize: 'clamp(0.7rem, 1vw, 0.85rem)',
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                    color: 'var(--fg-muted)',
                    paddingRight: 'clamp(2rem, 4%, 3rem)',
                  }}
                >
                  <span style={{ color: 'var(--accent)', marginRight: '0.4rem' }}>{s.icon}</span>
                  {s.value} {s.label}
                </span>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Main stat blocks */}
      <div
        className="grid w-full"
        style={{
          gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(140px, 20vw, 200px), 1fr))',
        }}
      >
        {stats.map((stat, i) => (
          <div
            key={i}
            className="flex flex-col items-center justify-center text-center"
            style={{
              padding: 'clamp(2rem, 4%, 3.5rem) clamp(1rem, 2%, 1.5rem)',
              borderRight: i < stats.length - 1 ? '1px solid var(--border-color)' : 'none',
              background: `var(--stat-${i + 1})`,
              transition: 'background-color 0.3s ease',
            }}
          >
            <div
              style={{
                fontFamily: "'Libre Bodoni', serif",
                fontSize: 'clamp(2.2rem, 4.5vw, 3.5rem)',
                fontWeight: 700,
                lineHeight: 1,
                marginBottom: '0.35rem',
                color: 'var(--fg)',
                letterSpacing: '-0.02em',
              }}
            >
              {stat.value}
            </div>
            <div
              style={{
                fontFamily: "'Public Sans', sans-serif",
                fontSize: 'clamp(0.6rem, 0.85vw, 0.75rem)',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--fg-muted)',
              }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
