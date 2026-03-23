import React from 'react';

export default function Footer() {
  return (
    <footer
      id="contact"
      className="w-full"
      style={{
        borderTop: '3px solid var(--border-color)',
        backgroundColor: 'var(--bg)',
      }}
    >
      <div
        className="flex flex-col md:flex-row items-center justify-between w-full"
        style={{
          padding: 'clamp(1.25rem, 3%, 2rem) clamp(1.5rem, 4%, 3rem)',
          gap: 'clamp(1rem, 2%, 1.5rem)',
        }}
      >
        {/* Logo */}
        <span
          className="bg-brutal-yellow text-black font-bold inline-block shrink-0"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 'clamp(0.9rem, 1.5vw, 1.2rem)',
            padding: '0.15em 0.4em',
            letterSpacing: '-0.03em',
          }}
        >
          AI-CRS
        </span>

        {/* Links */}
        <div className="flex items-center" style={{ gap: 'clamp(1rem, 2%, 2rem)' }}>
          {['Features', 'About', 'Contact'].map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="no-underline uppercase font-bold transition-colors duration-200 hover:text-brutal-yellow"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 'clamp(0.6rem, 0.85vw, 0.75rem)',
                letterSpacing: '0.1em',
                color: 'var(--fg-muted)',
              }}
            >
              {link}
            </a>
          ))}
        </div>

        {/* University */}
        <p
          className="text-center md:text-right"
          style={{
            fontSize: 'clamp(0.55rem, 0.8vw, 0.7rem)',
            letterSpacing: '0.05em',
            color: 'var(--fg-muted)',
            opacity: 0.6,
          }}
        >
          Palestine Polytechnic University · Hebron · 2025–2026
        </p>
      </div>
    </footer>
  );
}
