import React from 'react';

export default function Field({ label, hint, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
        {label}{hint && <span className="normal-case tracking-normal font-normal ml-1">— {hint}</span>}
      </label>
      {children}
    </div>
  );
}
