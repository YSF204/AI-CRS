import React from 'react';

export default function Footer() {
  return (
    <footer
      id="contact"
      className="w-full"
      style={{
        borderTop: '4px solid var(--nm-ink)',
        backgroundColor: 'var(--nm-bg)',
      }}
    >
      <div
        className="flex flex-col md:flex-row items-center justify-between w-full"
        style={{
          padding: 'clamp(2rem, 4%, 3rem) clamp(1.5rem, 5%, 4rem)',
          gap: '1.5rem',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1rem, 1.5vw, 1.25rem)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: 'var(--nm-text-primary)',
              textTransform: 'uppercase'
            }}
          >
            AI-CRS
          </span>
          <span
            style={{
              width: 8,
              height: 8,
              backgroundColor: 'var(--nm-primary)',
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
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(0.75rem, 1vw, 0.85rem)',
                fontWeight: 700,
                letterSpacing: '0.12em',
                color: 'var(--nm-text-secondary)',
                textDecoration: 'none',
                textTransform: 'uppercase',
                transition: 'color 0.2s ease',
              }}
              className="hover:text-[var(--nm-primary)]"
            >
              {link}
            </a>
          ))}
        </div>

        {/* University */}
        <p
          className="text-center md:text-right"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'clamp(0.65rem, 0.8vw, 0.75rem)',
            letterSpacing: '0.05em',
            color: 'var(--nm-text-tertiary)',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}
        >
          Palestine Polytechnic University · Hebron · 2025–2026
        </p>
      </div>
    </footer>
  );
}
