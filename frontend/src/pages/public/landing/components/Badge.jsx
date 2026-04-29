import React from 'react';

export default function Badge({ children, className = '', style = {} }) {
  return (
    <div
      className={`paper-badge ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
