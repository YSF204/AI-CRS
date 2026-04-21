import React from 'react';
import { cn } from '../../utils/cn';

export const ActionButton = React.forwardRef(({ variant = 'prism', size, children, icon, className, ...props }, ref) => {
  const isAiGold = variant === 'ai-gold';

  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 border-4 border-[var(--nm-ink)] px-5 py-3 font-bold uppercase tracking-[0.12em] transition-all duration-200",
        "disabled:cursor-not-allowed disabled:opacity-60",
        isAiGold
          ? "bg-[linear-gradient(135deg,#fef08a_0%,#f59e0b_55%,#d97706_100%)] text-[#1b1c15] shadow-[3px_3px_0_var(--nm-ink)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_var(--nm-ink)]"
          : "bg-[var(--nm-surface)] text-[var(--nm-text-primary)] shadow-[3px_3px_0_var(--nm-ink)] hover:bg-[var(--nm-surface-high)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_var(--nm-ink)]",
        className,
      )}
      {...props}
    >
      {icon && <span className="inline-flex items-center">{icon}</span>}
      {children}
    </button>
  );
});

ActionButton.displayName = 'ActionButton';
export default ActionButton;
