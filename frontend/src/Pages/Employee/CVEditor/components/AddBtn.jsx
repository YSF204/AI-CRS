import React from 'react';
import { Plus } from 'lucide-react';

export default function AddBtn({ label, onClick }) {
  return (
    <button type="button" onClick={onClick}
      className="flex items-center justify-center gap-2 w-full py-2.5 border-2 border-dashed border-[var(--border-color)] text-[var(--fg-muted)] font-mono text-[11px] font-bold uppercase tracking-wider hover:border-[var(--fg)] hover:text-[var(--fg)] transition-colors bg-transparent">
      <Plus size={12} /> {label}
    </button>
  );
}
