import React from 'react';

const team = [
  { name: 'Yousef AL Bakri', role: 'Full Stack', initials: 'YA', color: 'bg-brutal-yellow' },
  { name: 'Bashar AL-Ajalin', role: 'Frontend', initials: 'BA', color: 'bg-brutal-coral' },
  { name: 'Ismail Jboor', role: 'Backend', initials: 'IJ', color: 'bg-brutal-teal' },
  { name: 'Azeez Abu Queider', role: 'AI Integration', initials: 'AA', color: 'bg-brutal-mint' },
];

export default function TeamSection() {
  return (
    <section
      id="about"
      className="w-full"
      style={{ padding: 'clamp(4rem, 10%, 8rem) clamp(1.5rem, 5%, 4rem)' }}
    >
      {/* Title */}
      <div className="text-center" style={{ marginBottom: 'clamp(2.5rem, 5%, 4rem)' }}>
        <span
          className="inline-block bg-brutal-teal text-black uppercase font-bold"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 'clamp(0.6rem, 0.85vw, 0.75rem)',
            letterSpacing: '0.12em',
            padding: '0.2em 0.6em',
            marginBottom: 'clamp(0.75rem, 1.5%, 1.25rem)',
            border: '2px solid #0a0a0a',
            boxShadow: '3px 3px 0 #0a0a0a',
          }}
        >
          THE CREW
        </span>
        <h2
          style={{
            fontSize: 'clamp(1.8rem, 4.5vw, 4rem)',
            letterSpacing: '-0.03em',
            lineHeight: 1,
            marginTop: 'clamp(0.75rem, 1.5%, 1.25rem)',
            color: 'var(--fg)',
          }}
        >
          MEET THE <span className="text-brutal-teal">TEAM</span>
        </h2>
      </div>

      {/* Team cards */}
      <div
        className="flex flex-wrap items-stretch justify-center w-full max-w-5xl mx-auto"
        style={{ gap: 'clamp(1rem, 2%, 1.5rem)' }}
      >
        {team.map((member, i) => (
          <div
            key={i}
            className="brutal-card flex flex-col items-center text-center"
            style={{
              padding: 'clamp(1.5rem, 3%, 2.5rem) clamp(1.25rem, 2.5%, 2rem)',
              width: 'clamp(180px, 22vw, 250px)',
            }}
          >
            {/* Initials block */}
            <div
              className={`${member.color} text-black font-bold flex items-center justify-center`}
              style={{
                width: 'clamp(3.5rem, 5vw, 5rem)',
                height: 'clamp(3.5rem, 5vw, 5rem)',
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 'clamp(1.1rem, 1.6vw, 1.5rem)',
                marginBottom: 'clamp(0.75rem, 2%, 1.25rem)',
                border: '3px solid #0a0a0a',
                boxShadow: '4px 4px 0 #0a0a0a',
              }}
            >
              {member.initials}
            </div>

            <h3
              className="uppercase"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 'clamp(0.8rem, 1.1vw, 1rem)',
                letterSpacing: '-0.01em',
                marginBottom: 'clamp(0.15rem, 0.4%, 0.25rem)',
                color: 'var(--fg)',
              }}
            >
              {member.name}
            </h3>
            <p
              className="uppercase tracking-widest"
              style={{
                fontSize: 'clamp(0.55rem, 0.8vw, 0.7rem)',
                letterSpacing: '0.15em',
                color: 'var(--fg-muted)',
              }}
            >
              {member.role}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
