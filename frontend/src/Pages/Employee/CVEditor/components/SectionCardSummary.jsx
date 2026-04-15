import React from "react";
import SuggestionBox from "./SuggestionBox";

export default function SummarySection({
  form,
  handlers,
  fetchSingleSummarySuggestion,
  isLoadingSuggestions,
  suggestions,
  handleSuggestionSelect,
}) {
  const { setForm } = handlers;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <textarea
          className="min-h-[100px] w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
          value={form.summary}
          onChange={(e) => {
            setForm((f) => ({ ...f, summary: e.target.value }));
          }}
          placeholder="Results-driven engineer with 3+ years..."
          rows={4}
        />
        <button
          type="button"
          onClick={fetchSingleSummarySuggestion}
          disabled={!form.jobTitle}
          className="absolute top-2 right-2 px-3 py-1.5 text-[10px] font-bold text-gray-600 hover:text-gray-800 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 transition-colors"
          title="Get AI suggestion"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-4v-4H6.5a2 2 0 0 0-4 4v.5h1m6 4v-1.7a2 2 0 0 0-4 4z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M16 6v-2c0-2-2-2-2-2s-2 0-2 2v2"
            />
          </svg>
        </button>
        <SuggestionBox
          suggestions={suggestions?.['summary-single']}
          onSelect={(val) => handleSuggestionSelect("summary-single", val)}
          isLoading={isLoadingSuggestions['summary-single']}
          single={true} // Single suggestion mode
        />
      </div>
    </div>
  );
}
