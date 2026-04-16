import React from 'react';

export const Heading = ({ level = 2, children, className = '', style = {} }) => {
  const Tag = `h${level}`;
  
  const sizes = {
    1: 'clamp(2.5rem, 5vw, 4rem)',
    2: 'clamp(2rem, 4vw, 3rem)',
    3: 'clamp(1.5rem, 3vw, 2rem)',
    4: 'clamp(1.25rem, 2vw, 1.5rem)',
    5: '1.25rem',
    6: '1rem',
  };

  const weights = {
    1: 700,
    2: 700,
    3: 600,
    4: 600,
    5: 600,
    6: 600,
  };

  const baseStyle = {
    fontFamily: "'Libre Bodoni', serif",
    fontSize: sizes[level],
    fontWeight: weights[level],
    lineHeight: 1.15,
    letterSpacing: '-0.02em',
    color: 'var(--fg)',
    margin: 0,
    ...style,
  };

  return (
    <Tag className={className} style={baseStyle}>
      {children}
    </Tag>
  );
};

export const Text = ({ children, className = '', muted = false, size = '16px', style = {} }) => {
  return (
    <p
      className={className}
      style={{
        fontFamily: "'Public Sans', sans-serif",
        fontSize: size,
        lineHeight: 1.65,
        color: muted ? 'var(--fg-muted)' : 'var(--fg)',
        margin: 0,
        ...style,
      }}
    >
      {children}
    </p>
  );
};
