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
      className="overflow-hidden transition-all duration-200"
      style={{
        minHeight: hasContent ? '60px' : '0px',
        maxHeight: isLoading ? '40px' : 'none',
      }}
    >
      {isLoading && (
        <div className="text-xs text-gray-500 italic animate-pulse py-2">
          Loading suggestions...
        </div>
      )}

      {!isLoading && hasContent && (
        <div className="border-t border-gray-300 pt-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
            {isSingle ? 'Suggestion' : 'Suggestions'}
          </div>
          <div className="max-h-32 overflow-y-auto">
            {isSingle ? (
              // Single suggestion mode - show one suggestion with Apply button
              <div className="relative">
                <div className="mb-2 px-3 py-2 bg-white border border-gray-200 rounded shadow-sm">
                  <p className="text-xs text-gray-700 leading-relaxed mb-2">
                    {suggestions}
                  </p>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onSelect(suggestions)}
                      className="px-3 py-1.5 bg-[var(--yellow)] text-black font-bold text-xs uppercase tracking-wider rounded hover:bg-[rgba(255,230,48,0.12)] transition-colors"
                    >
                      Apply
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelect('')} // Empty selection to dismiss
                      className="px-3 py-1.5 bg-gray-100 text-gray-600 font-bold text-xs uppercase tracking-wider rounded hover:bg-gray-200 transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // Multiple suggestions mode - show list without Apply button
              <div className="max-h-32 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={`${suggestion}-${index}`}
                    onClick={() => onSelect(suggestion)}
                    className="text-xs text-gray-700 cursor-pointer hover:text-black hover:bg-gray-100 px-2 py-1.5 rounded transition-all whitespace-normal"
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

