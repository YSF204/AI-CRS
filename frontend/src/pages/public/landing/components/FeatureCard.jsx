import React from 'react';
import { Heading, Text } from './Typography';

export default function FeatureCard({ Icon, title, description, accent = 'var(--accent)' }) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: 'var(--card-bg)',
        borderRadius: '12px',
        padding: '1.75rem',
        border: '1px solid var(--border-color)',
        boxShadow: isHovered ? 'var(--shadow-hover)' : 'var(--shadow-md)',
        transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
        borderColor: isHovered ? 'var(--warm)' : 'var(--border-color)',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        cursor: 'default',
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '10px',
          backgroundColor: `${accent}10`,
          color: accent,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon size={22} strokeWidth={2} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <Heading level={3} style={{ fontSize: '1.15rem' }}>{title}</Heading>
        <Text muted size="0.92rem">{description}</Text>
      </div>
    </div>
  );
}
