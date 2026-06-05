import React from "react";
import { Sparkles } from "lucide-react";
import SuggestionBox from "./SuggestionBox";

export default function SummarySection({
  form,
  handlers,
  fetchSingleSummarySuggestion,
  isLoadingSuggestions,
  suggestions,
  handleSuggestionSelect,
}) {
  const { updateField } = handlers;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <label htmlFor="summary-textarea" className="font-mono text-[11px] uppercase font-bold tracking-widest text-[var(--nm-text-primary)]">
          Professional Narrative
        </label>
        <button
          type="button"
          onClick={() => fetchSingleSummarySuggestion()}
          disabled={isLoadingSuggestions?.["summary-single"]}
          className="nm-btn flex items-center gap-2"
          style={{
            padding: "6px 14px",
            fontSize: "10px",
            background: "var(--nm-primary)",
            color: "#fff",
            borderColor: "var(--nm-ink)",
            borderWidth: "2px",
            fontWeight: "900",
            letterSpacing: "0.05em",
          }}
        >
          {isLoadingSuggestions?.["summary-single"] ? (
            <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <Sparkles size={12} strokeWidth={3} />
          )}
          GENERATE WITH AI
        </button>
      </div>

      <div className="relative">
        <textarea
          id="summary-textarea"
          className="min-h-[120px] w-full p-4 nm-input font-sans text-sm leading-relaxed"
          value={form.summary}
          onChange={(e) => {
            handlers.updateField("summary", e.target.value);
          }}
          placeholder="Results-driven engineer with 3+ years experience in building high-performance systems..."
          rows={5}
        />
        <SuggestionBox
          suggestions={suggestions?.["summary-single"] || []}
          onSelect={(val) => handleSuggestionSelect("summary-single", val)}
          isLoading={isLoadingSuggestions?.["summary-single"] || false}
          single={true}
        />
      </div>
    </div>
  );
}
