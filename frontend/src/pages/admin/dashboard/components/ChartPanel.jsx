import React from 'react';

export default function ChartPanel({ title, eyebrow, children, note }) {
  return (
    <div className="nm-card" style={{ background: 'var(--nm-surface)', padding: 'var(--spacing-6)' }}>
      <div style={{
        marginBottom: 'var(--spacing-5)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-3)'
      }}>
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: 'var(--font-body)',
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            color: 'var(--nm-text-secondary)',
            marginBottom: 'var(--spacing-2)'
          }}>
            {eyebrow}
          </div>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-2xl)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
            margin: 0,
            color: 'var(--nm-text-primary)'
          }}>
            {title}
          </h2>
        </div>
        <div style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-sm)',
          color: 'var(--nm-text-secondary)'
        }}>
          {note}
        </div>
      </div>
      {children}
    </div>
  );
}
