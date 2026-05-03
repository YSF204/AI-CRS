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
          value={form.address?.street || ""}
          onChange={(e) => handlers.setAddress("street")(e)}
          className="brutal-input w-full h-24 resize-none"
          placeholder="Enter your street address"
        />
      </div>
      <div className="brutal-card bg-[var(--nav-bg)] border-2 border-[var(--border-color)] p-4">
        <label className="block font-mono text-xs font-bold mb-3 uppercase tracking-wider text-[var(--fg)]">
          City
        </label>
        <input
          type="text"
          value={form.address?.city || ""}
          onChange={(e) => handlers.setAddress("city")(e)}
          className="brutal-input w-full"
          placeholder="Enter your city or country"
        />
      </div>
    </div>
  );
}
