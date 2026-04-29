import React from 'react';

export const Heading = ({ level = 2, children, className = '', style = {} }) => {
  const Tag = `h${level}`;
  
  const sizes = {
    1: 'clamp(2.5rem, 7vw, 5rem)',
    2: 'clamp(2rem, 5vw, 3.5rem)',
    3: 'clamp(1.5rem, 3.5vw, 2.5rem)',
    4: 'clamp(1.25rem, 2.5vw, 1.75rem)',
    5: '1.25rem',
    6: '1rem',
  };

  const weights = {
    1: 800,
    2: 800,
    3: 700,
    4: 700,
    5: 700,
    6: 700,
  };

  const baseStyle = {
    fontFamily: 'var(--font-display)',
    fontSize: sizes[level],
    fontWeight: weights[level],
    lineHeight: 1.1,
    letterSpacing: '-0.03em',
    color: 'var(--nm-text-primary)',
    textTransform: 'uppercase',
    margin: 0,
    ...style,
  };

  return (
    <Tag className={className} style={baseStyle}>
      {children}
    </Tag>
  );
};

export const Text = ({ children, className = '', muted = false, size = '1rem', style = {} }) => {
  return (
    <p
      className={className}
      style={{
        fontFamily: 'var(--font-body)',
        fontSize: size,
        lineHeight: 1.7,
        color: muted ? 'var(--nm-text-secondary)' : 'var(--nm-text-primary)',
        margin: 0,
        ...style,
      }}
    >
      {children}
    </p>
  );
};
