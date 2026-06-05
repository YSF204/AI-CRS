import React from "react";

export default function PersonalFields({
  manualFormData,
  setManualFormData,
  validationErrors,
}) {
  return (
    <div className="brutal-card bg-[var(--card-bg)] p-6">
      <h2 className="font-['Space_Grotesk'] font-bold text-sm uppercase tracking-wider mb-4">
        Personal Information
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="pf-firstName" className="block font-mono text-xs font-bold mb-2">
            First Name *
          </label>
          <input
            id="pf-firstName"
            type="text"
            value={manualFormData.firstName}
            onChange={(e) =>
              setManualFormData({ ...manualFormData, firstName: e.target.value })
            }
            className={`w-full border-2 px-3 py-2 font-mono text-sm outline-none focus:border-[var(--yellow)] bg-[var(--bg)] text-[var(--fg)] ${
              validationErrors.firstName ? "border-[var(--coral)]" : "border-[var(--border-color)]"
            }`}
            placeholder="John"
          />
          {validationErrors.firstName && (
            <p className="text-[var(--coral)] font-mono text-xs mt-1">{validationErrors.firstName}</p>
          )}
        </div>

        <div>
          <label htmlFor="pf-lastName" className="block font-mono text-xs font-bold mb-2">
            Last Name *
          </label>
          <input
            id="pf-lastName"
            type="text"
            value={manualFormData.lastName}
            onChange={(e) =>
              setManualFormData({ ...manualFormData, lastName: e.target.value })
            }
            className={`w-full border-2 px-3 py-2 font-mono text-sm outline-none focus:border-[var(--yellow)] bg-[var(--bg)] text-[var(--fg)] ${
              validationErrors.lastName ? "border-[var(--coral)]" : "border-[var(--border-color)]"
            }`}
            placeholder="Doe"
          />
          {validationErrors.lastName && (
            <p className="text-[var(--coral)] font-mono text-xs mt-1">{validationErrors.lastName}</p>
          )}
        </div>

        <div>
          <label htmlFor="pf-email" className="block font-mono text-xs font-bold mb-2">
            Email *
          </label>
          <input
            id="pf-email"
            type="email"
            value={manualFormData.email}
            onChange={(e) =>
              setManualFormData({ ...manualFormData, email: e.target.value })
            }
            className={`w-full border-2 px-3 py-2 font-mono text-sm outline-none focus:border-[var(--yellow)] bg-[var(--bg)] text-[var(--fg)] ${
              validationErrors.email ? "border-[var(--coral)]" : "border-[var(--border-color)]"
            }`}
            placeholder="john@example.com"
          />
          {validationErrors.email && (
            <p className="text-[var(--coral)] font-mono text-xs mt-1">{validationErrors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="pf-phone" className="block font-mono text-xs font-bold mb-2">
            Phone
          </label>
          <input
            id="pf-phone"
            type="tel"
            value={manualFormData.phone}
            onChange={(e) =>
              setManualFormData({ ...manualFormData, phone: e.target.value })
            }
            className="w-full border-2 border-[var(--border-color)] bg-[var(--bg)] text-[var(--fg)] px-3 py-2 font-mono text-sm outline-none focus:border-[var(--yellow)]"
            placeholder="+1234567890"
          />
        </div>

        <div>
          <label htmlFor="pf-linkedin" className="block font-mono text-xs font-bold mb-2">
            LinkedIn
          </label>
          <input
            id="pf-linkedin"
            type="url"
            value={manualFormData.linkedin}
            onChange={(e) =>
              setManualFormData({ ...manualFormData, linkedin: e.target.value })
            }
            className="w-full border-2 border-[var(--border-color)] bg-[var(--bg)] text-[var(--fg)] px-3 py-2 font-mono text-sm outline-none focus:border-[var(--yellow)]"
            placeholder="https://linkedin.com/in/your-profile"
          />
        </div>

        <div>
          <label htmlFor="pf-portfolioUrl" className="block font-mono text-xs font-bold mb-2">
            Portfolio URL
          </label>
          <input
            id="pf-portfolioUrl"
            type="url"
            value={manualFormData.portfolioUrl}
            onChange={(e) =>
              setManualFormData({ ...manualFormData, portfolioUrl: e.target.value })
            }
            className="w-full border-2 border-[var(--border-color)] bg-[var(--bg)] text-[var(--fg)] px-3 py-2 font-mono text-sm outline-none focus:border-[var(--yellow)]"
            placeholder="https://your-portfolio.com"
          />
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="pf-summary" className="block font-mono text-xs font-bold mb-2">
          Professional Summary
        </label>
        <textarea
          id="pf-summary"
          value={manualFormData.summary}
          onChange={(e) =>
            setManualFormData({ ...manualFormData, summary: e.target.value })
          }
          className="w-full border-2 border-[var(--border-color)] bg-[var(--bg)] text-[var(--fg)] px-3 py-2 font-mono text-sm outline-none focus:border-[var(--yellow)] resize-y min-h-20"
          placeholder="Brief summary of your background and experience..."
        />
      </div>

      <div className="mt-4">
        <label htmlFor="pf-additionalInfo" className="block font-mono text-xs font-bold mb-2">
          Additional Information
        </label>
        <textarea
          id="pf-additionalInfo"
          value={manualFormData.additionalInformation}
          onChange={(e) =>
            setManualFormData({ ...manualFormData, additionalInformation: e.target.value })
          }
          className="w-full border-2 border-[var(--border-color)] bg-[var(--bg)] text-[var(--fg)] px-3 py-2 font-mono text-sm outline-none focus:border-[var(--yellow)] resize-y min-h-16"
          placeholder="Anything else you'd like to share (certifications, portfolio links, preferences)..."
        />
      </div>

      <div className="mt-4">
        <label htmlFor="pf-yearsExp" className="block font-mono text-xs font-bold mb-2">
          Years of Experience
        </label>
        <input
          id="pf-yearsExp"
          type="number"
          value={manualFormData.yearsOfExperience}
          onChange={(e) =>
            setManualFormData({ ...manualFormData, yearsOfExperience: e.target.value })
          }
          className="w-full border-2 border-[var(--border-color)] bg-[var(--bg)] text-[var(--fg)] px-3 py-2 font-mono text-sm outline-none focus:border-[var(--yellow)]"
          placeholder="0"
          min="0"
        />
      </div>
    </div>
  );
}
