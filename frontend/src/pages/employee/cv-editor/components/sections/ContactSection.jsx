import React from "react";

export default function ContactSection({ form, handlers }) {
  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="pb-4 border-b-2 border-[var(--border-color)]">
        <h2 className="text-2xl font-bold font-['Space_Grotesk'] uppercase mb-2">
          Contact Information
        </h2>
        <p className="font-mono text-sm text-[var(--fg-muted)]">
          Provide your contact details for potential employers.
        </p>
      </div>

      {/* Contact Fields Container */}
      <div className="space-y-3">
        {/* Email Field */}
        <div className="brutal-card bg-[var(--nav-bg)] border-2 border-[var(--border-color)] p-4">
          <label htmlFor="contact-email" className="block font-mono text-xs font-bold mb-2 uppercase tracking-wider text-[var(--fg)]">
            Email *
          </label>
          <input
            id="contact-email"
            type="email"
            value={form.contact?.email || ""}
            onChange={(e) =>
              handlers.setContact("email")(e)
            }
            className="brutal-input w-full"
            placeholder="your.email@example.com"
          />
        </div>

        {/* Phone Field */}
        <div className="brutal-card bg-[var(--nav-bg)] border-2 border-[var(--border-color)] p-4">
          <label htmlFor="contact-phone" className="block font-mono text-xs font-bold mb-2 uppercase tracking-wider text-[var(--fg)]">
            Phone
          </label>
          <input
            id="contact-phone"
            type="tel"
            value={form.contact?.phone || ""}
            onChange={(e) =>
              handlers.setContact("phone")(e)
            }
            className="brutal-input w-full"
            placeholder="+1 (555) 123-4567"
          />
        </div>

        {/* LinkedIn Field */}
        <div className="brutal-card bg-[var(--nav-bg)] border-2 border-[var(--border-color)] p-4">
          <label htmlFor="contact-linkedin" className="block font-mono text-xs font-bold mb-2 uppercase tracking-wider text-[var(--fg)]">
            LinkedIn
          </label>
          <input
            id="contact-linkedin"
            type="url"
            value={form.contact?.linkedin || ""}
            onChange={(e) =>
              handlers.setContact("linkedin")(e)
            }
            className="brutal-input w-full"
            placeholder="https://linkedin.com/in/yourprofile"
          />
        </div>

        {/* GitHub Field */}
        <div className="brutal-card bg-[var(--nav-bg)] border-2 border-[var(--border-color)] p-4">
          <label htmlFor="contact-github" className="block font-mono text-xs font-bold mb-2 uppercase tracking-wider text-[var(--fg)]">
            GitHub
          </label>
          <input
            id="contact-github"
            type="url"
            value={form.contact?.github || ""}
            onChange={(e) =>
              handlers.setContact("github")(e)
            }
            className="brutal-input w-full"
            placeholder="https://github.com/yourusername"
          />
        </div>
      </div>
    </div>
  );
}
