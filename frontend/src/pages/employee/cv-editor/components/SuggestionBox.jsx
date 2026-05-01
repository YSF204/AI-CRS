import React from 'react';

/**
 * SuggestionBox - Displays AI-powered suggestions below form fields
 * Single Responsibility: Render suggestion list and handle selection
 */
const SuggestionBox = ({ suggestions, onSelect, isLoading, single = false }) => {
  // Always render the container to prevent flickering
  const hasContent = (suggestions && suggestions.length > 0) || isLoading;

  // In single mode, suggestions is a single string, not an array
  const isSingle = single && typeof suggestions === 'string';

  return (
    <div
      className="overflow-hidden transition-all duration-300"
      style={{
        minHeight: hasContent ? '80px' : '0px',
        maxHeight: isLoading ? '60px' : 'none',
      }}
    >
      {isLoading && (
        <div className="flex items-center gap-3 py-4">
          <div className="animate-spin h-4 w-4 border-2 border-[var(--nm-primary)] border-t-transparent" />
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[var(--nm-text-tertiary)] italic">
            Synthesizing intelligence...
          </span>
        </div>
      )}

      {!isLoading && hasContent && (
        <div className="border-t-2 border-[var(--nm-ink)] mt-4 pt-4">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--nm-text-tertiary)] mb-3">
            {isSingle ? 'AI COMPOSITION' : 'AI SUGGESTIONS'}
          </div>
          <div className="max-h-48 overflow-y-auto pr-2 custom-scrollbar">
            {isSingle ? (
              <div className="nm-card bg-[var(--nm-surface-low)] border-2 p-4 mb-4">
                <p className="font-sans text-xs leading-relaxed text-[var(--nm-text-primary)] mb-4">
                  {suggestions}
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => onSelect('')}
                    className="nm-btn px-4 py-2 text-[10px] font-bold uppercase tracking-wider bg-transparent border-2 border-[var(--nm-ink)] text-[var(--nm-text-secondary)]"
                  >
                    DISCARD
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelect(suggestions)}
                    className="nm-btn px-6 py-2 text-[10px] font-black uppercase tracking-widest bg-[var(--nm-primary)] border-2 border-[var(--nm-ink)] text-white shadow-[2px_2px_0px_var(--nm-ink)] active:shadow-none translate-x-[-2px] translate-y-[-2px] active:translate-x-0 active:translate-y-0 transition-all"
                  >
                    APPLY NARRATIVE
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={`${suggestion}-${index}`}
                    onClick={() => onSelect(suggestion)}
                    className="p-3 text-xs text-[var(--nm-text-primary)] cursor-pointer hover:bg-[var(--nm-primary)] hover:text-white border-2 border-transparent hover:border-[var(--nm-ink)] transition-all whitespace-normal font-medium leading-relaxed bg-[var(--nm-surface)]"
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(SuggestionBox);

