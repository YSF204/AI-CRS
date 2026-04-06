import React from "react";

export default function AddressSection({ form, handlers }) {
  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="pb-4 border-b-2 border-[var(--border-color)]">
        <h2 className="text-2xl font-bold font-['Space_Grotesk'] uppercase mb-2">
          Address
        </h2>
        <p className="font-mono text-sm text-[var(--fg-muted)]">
          Provide your location information.
        </p>
      </div>

      {/* Address Field */}
      <div className="brutal-card bg-[var(--nav-bg)] border-2 border-[var(--border-color)] p-4">
        <label className="block font-mono text-xs font-bold mb-3 uppercase tracking-wider text-[var(--fg)]">
          Address
        </label>
        <textarea
          value={form.address || ""}
          onChange={(e) => handlers.updateField("address", e.target.value)}
          className="brutal-input w-full h-24 resize-none"
          placeholder="Enter your full address or city, country"
        />
      </div>
    </div>
  );
}
