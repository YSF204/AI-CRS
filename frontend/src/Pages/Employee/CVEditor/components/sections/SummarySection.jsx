import React from "react";

export default function SummarySection({ form, handlers }) {
  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="pb-4 border-b-2 border-[var(--border-color)]">
        <h2 className="text-2xl font-bold font-['Space_Grotesk'] uppercase mb-2">
          Professional Summary
        </h2>
        <p className="font-mono text-sm text-[var(--fg-muted)]">
          Write a compelling summary of your professional background and career
          goals.
        </p>
      </div>

      {/* Full Name Field */}
      <div className="brutal-card bg-[var(--nav-bg)] border-2 border-[var(--border-color)] p-4">
        <label className="block font-mono text-xs font-bold mb-3 uppercase tracking-wider text-[var(--fg)]">
          Full Name *
        </label>
        <input
          type="text"
          value={form.fullName || ""}
          onChange={(e) => handlers.updateField("fullName", e.target.value)}
          className="brutal-input w-full"
          placeholder="Enter your full name"
        />
      </div>

      {/* Summary Field */}
      <div className="brutal-card bg-[var(--nav-bg)] border-2 border-[var(--border-color)] p-4">
        <label className="block font-mono text-xs font-bold mb-3 uppercase tracking-wider text-[var(--fg)]">
          Professional Summary *
        </label>
        <textarea
          value={form.summary || ""}
          onChange={(e) => handlers.updateField("summary", e.target.value)}
          className="brutal-input w-full h-32 resize-none"
          placeholder="Describe your professional background, key achievements, and career objectives..."
        />
      </div>
    </div>
  );
}
