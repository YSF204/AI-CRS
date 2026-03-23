import React from 'react';

const stats = [
  { value: '500+', label: 'CVs Built', color: 'bg-brutal-yellow' },
  { value: '98%', label: 'ATS Pass Rate', color: 'bg-brutal-coral' },
  { value: '4', label: 'Developers', color: 'bg-brutal-teal' },
  { value: '3', label: 'AI Models', color: 'bg-brutal-mint' },
];

export default function StatsSection() {
  return (
    <section
      className="w-full overflow-hidden"
      style={{ borderTop: '3px solid var(--border-color)', borderBottom: '3px solid var(--border-color)' }}
    >
      {/* Scrolling marquee strip */}
      <div
        className="w-full bg-brutal-yellow text-black overflow-hidden whitespace-nowrap"
        style={{ padding: 'clamp(0.4rem, 0.8%, 0.6rem) 0' }}
      >
        <div className="marquee-track inline-flex" style={{ gap: 'clamp(2rem, 4%, 3rem)' }}>
          {[...Array(3)].map((_, rep) => (
            <React.Fragment key={rep}>
              {stats.map((s, i) => (
                <span
                  key={`${rep}-${i}`}
                  className="uppercase font-bold"
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 'clamp(0.7rem, 1vw, 0.9rem)',
                    letterSpacing: '0.08em',
                    paddingRight: 'clamp(2rem, 4%, 3rem)',
                  }}
                >
                  ★ {s.value} {s.label}
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
            className={`${stat.color} text-black flex flex-col items-center justify-center text-center`}
            style={{
              padding: 'clamp(1.5rem, 3%, 2.5rem) clamp(1rem, 2%, 1.5rem)',
              borderRight: i < stats.length - 1 ? '3px solid #0a0a0a' : 'none',
            }}
          >
            <div
              className="font-bold"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 'clamp(2rem, 4vw, 3.5rem)',
                lineHeight: 1,
                marginBottom: '0.25rem',
              }}
            >
              {stat.value}
            </div>
            <div
              className="uppercase tracking-widest font-medium opacity-70"
              style={{
                fontSize: 'clamp(0.55rem, 0.8vw, 0.7rem)',
                letterSpacing: '0.15em',
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
