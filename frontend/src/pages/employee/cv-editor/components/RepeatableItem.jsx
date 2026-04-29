import React from 'react';
import { ChevronUp, ChevronDown, Trash2 } from 'lucide-react';

export default function RepeatableItem({ children, onDelete, onMoveUp, onMoveDown, canUp, canDown }) {
  return (
    <div className="border-2 border-[var(--border-color)] bg-[var(--bg)] p-3 flex flex-col gap-2">
      {children}
      <div className="flex items-center justify-between pt-2 mt-1 border-t border-dashed border-[var(--border-color)]">
        <div className="flex gap-1">
          {[{ fn: onMoveUp, Icon: ChevronUp, ok: canUp }, { fn: onMoveDown, Icon: ChevronDown, ok: canDown }].map(({ fn, Icon, ok }, i) => (
            <button key={i} type="button" onClick={fn} disabled={!ok}
              className={`border-2 border-[var(--border-color)] p-1 flex items-center ${ok ? 'cursor-pointer hover:bg-[var(--card-bg)]' : 'opacity-30 cursor-not-allowed'}`}>
              <Icon size={12} />
            </button>
          ))}
        </div>
        <button type="button" onClick={onDelete}
          className="flex items-center gap-1 border-2 border-red-500 text-red-500 font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 hover:bg-red-500 hover:text-white transition-colors">
          <Trash2 size={10} /> Remove
        </button>
      </div>
    </div>
  );
}
