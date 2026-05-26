import React from 'react';

export default function SectionLayout({ children, id, className = '', style = {}, bg = 'var(--bg)' }) {
  return (
    <section
      id={id}
      className={className}
      style={{
        backgroundColor: bg,
        padding: 'clamp(64px, 10vw, 120px) clamp(24px, 5vw, 48px)',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        ...style
      }}
    >
      <div
        className="w-full max-w-6xl mx-auto flex flex-col"
        style={{ gap: '48px' }}
      >
        {children}
      </div>
    </section>
  );
}
