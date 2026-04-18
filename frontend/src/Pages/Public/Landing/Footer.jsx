import React from 'react';

export default function Footer() {
  return (
    <footer
      id="contact"
      className="w-full"
      style={{
        borderTop: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg)',
      }}
    >
      <div
        className="flex flex-col md:flex-row items-center justify-between w-full"
        style={{
          padding: 'clamp(1.5rem, 3%, 2.5rem) clamp(1.5rem, 5%, 4rem)',
          gap: 'clamp(1rem, 2%, 1.5rem)',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span
            style={{
              fontFamily: "'Libre Bodoni', serif",
              fontSize: 'clamp(1rem, 1.5vw, 1.2rem)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'var(--fg)',
            }}
          >
            AI-CRS
          </span>
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              backgroundColor: 'var(--accent)',
              display: 'inline-block',
            }}
          />
        </div>

        {/* Links */}
        <div className="flex items-center" style={{ gap: 'clamp(1.5rem, 3%, 2.5rem)' }}>
          {['Features', 'About', 'Contact'].map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              style={{
                fontFamily: "'Public Sans', sans-serif",
                fontSize: 'clamp(0.72rem, 0.9vw, 0.82rem)',
                fontWeight: 600,
                letterSpacing: '0.04em',
                color: 'var(--fg-muted)',
                textDecoration: 'none',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => (e.target.style.color = 'var(--accent)')}
              onMouseLeave={(e) => (e.target.style.color = 'var(--fg-muted)')}
            >
              {link}
            </a>
          ))}
        </div>

        {/* University */}
        <p
          className="text-center md:text-right"
          style={{
            fontFamily: "'Public Sans', sans-serif",
            fontSize: 'clamp(0.6rem, 0.8vw, 0.72rem)',
            letterSpacing: '0.03em',
            color: 'var(--fg-subtle)',
          }}
        >
          Palestine Polytechnic University · Hebron · 2025–2026
        </p>
      </div>
    </footer>
  );
}
