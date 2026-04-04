import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function TagInput({ value = [], onChange, placeholder }) {
  const [draft, setDraft] = useState('');

  const add = (v) => {
    const t = v.trim();
    if (t && !value.includes(t)) onChange([...value, t]);
    setDraft('');
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(draft); }
    else if (e.key === 'Backspace' && !draft && value.length) onChange(value.slice(0, -1));
  };

  return (
    <div
      className="flex flex-wrap gap-1.5 p-2 border-2 border-[var(--border-color)] bg-[var(--bg)] min-h-[44px] cursor-text items-center"
      onClick={(e) => e.currentTarget.querySelector('input')?.focus()}
    >
      {value.map((tag) => (
        <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 bg-[var(--yellow)] text-[#0a0a0a] border-2 border-[#0a0a0a] font-mono text-[10px] font-bold uppercase tracking-wider">
          {tag}
          <button type="button" onClick={() => onChange(value.filter((t) => t !== tag))} className="flex items-center hover:opacity-70">
            <X size={9} />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKey}
        onBlur={() => draft.trim() && add(draft)}
        placeholder={value.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[60px] bg-transparent border-none outline-none font-mono text-sm text-[var(--fg)] placeholder:text-[var(--fg-muted)]"
      />
    </div>
  );
}
