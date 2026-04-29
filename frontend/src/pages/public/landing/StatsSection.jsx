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
      {/* Scrolling marquee strip — industrial ticker */}
      <div
        className="w-full overflow-hidden whitespace-nowrap"
        style={{
          borderTop: '4px solid var(--nm-ink)',
          borderBottom: '4px solid var(--nm-ink)',
          background: 'var(--nm-bg)',
          padding: 'clamp(0.75rem, 1.5%, 1rem) 0',
        }}
      >
        <div className="marquee-track inline-flex" style={{ gap: 'clamp(3rem, 6%, 4rem)' }}>
          {[...Array(4)].map((_, rep) => (
            <React.Fragment key={rep}>
              {stats.map((s, i) => (
                <span
                  key={`${rep}-${i}`}
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(0.8rem, 1.2vw, 1rem)',
                    fontWeight: 700,
                    letterSpacing: '0.15em',
                    color: 'var(--nm-text-primary)',
                    textTransform: 'uppercase',
                    paddingRight: 'clamp(3rem, 6%, 4rem)',
                  }}
                >
                  <span style={{ color: 'var(--nm-primary)', marginRight: '0.6rem' }}>{s.icon}</span>
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
          gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(200px, 25vw, 300px), 1fr))',
          background: 'var(--nm-ink)',
          gap: '4px', // Creates the "border" between cells
          borderBottom: '4px solid var(--nm-ink)',
        }}
      >
        {stats.map((stat, i) => (
          <div
            key={i}
            className="flex flex-col items-center justify-center text-center group"
            style={{
              padding: 'clamp(3rem, 6%, 5rem) clamp(1rem, 2%, 2rem)',
              background: 'var(--nm-surface)',
              transition: 'background-color 0.2s ease',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                fontWeight: 800,
                lineHeight: 1,
                marginBottom: '0.75rem',
                color: 'var(--nm-text-primary)',
                letterSpacing: '-0.04em',
              }}
            >
              {stat.value}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(0.7rem, 1vw, 0.9rem)',
                fontWeight: 700,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--nm-text-secondary)',
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
