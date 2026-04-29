import React from 'react';

export default function Button({
  children,
  variant = 'primary',
  className = '',
  style = {},
  ...props
}) {
  const [isHovered, setIsHovered] = React.useState(false);

  const baseStyle = {
    fontFamily: "'Public Sans', sans-serif",
    fontWeight: 600,
    fontSize: '0.9rem',
    letterSpacing: '0.01em',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    border: 'none',
    boxSizing: 'border-box',
    minHeight: '44px',
    lineHeight: 1,
  };

  const variants = {
    primary: {
      backgroundColor: 'var(--accent)',
      color: 'var(--accent-text)',
      boxShadow: '0 2px 8px rgba(26, 107, 90, 0.2)',
    },
    outline: {
      backgroundColor: 'transparent',
      color: 'var(--fg)',
      border: '1.5px solid var(--border-color)',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--fg)',
    },
  };

  const hoverStyles = {
    primary: {
      backgroundColor: 'var(--accent-hover)',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 16px rgba(26, 107, 90, 0.3)',
    },
    outline: {
      borderColor: 'var(--accent)',
      color: 'var(--accent)',
      backgroundColor: 'var(--accent-light)',
      transform: 'translateY(-1px)',
    },
    ghost: {
      backgroundColor: 'var(--bg-alt)',
    },
  };

  return (
    <button
      className={`paper-btn-component ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        ...baseStyle,
        ...variants[variant],
        ...(isHovered ? hoverStyles[variant] : {}),
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}
