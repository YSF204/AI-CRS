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
        <SuggestionBox
          suggestions={suggestions?.["summary-single"]}
          onSelect={(val) => handleSuggestionSelect("summary-single", val)}
          isLoading={isLoadingSuggestions["summary-single"]}
          single={true}
        />
      </div>
    </div>
  );
}
