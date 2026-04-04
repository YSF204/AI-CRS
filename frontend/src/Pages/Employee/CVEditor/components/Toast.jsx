import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

export default function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div
      className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-2.5 px-4 py-3 border-[3px] border-[#0a0a0a] font-['Space_Grotesk'] font-bold text-sm text-[#0a0a0a] ${
        toast.type === 'success' ? 'bg-[var(--mint)]' : 'bg-[var(--coral)]'
      }`}
      style={{ boxShadow: '5px 5px 0 #0a0a0a' }}
    >
      {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
      {toast.msg}
    </div>
  );
}
