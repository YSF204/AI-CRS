import React from "react";
import { Loader } from "lucide-react";

export default function ManualForm({
  manualFormData,
  setManualFormData,
  validationErrors,
  technicalSkillInput,
  setTechnicalSkillInput,
  softSkillInput,
  setSoftSkillInput,
  languageInput,
  setLanguageInput,
  handleAddSkill,
  handleRemoveSkill,
  handleAddLanguage,
  handleRemoveLanguage,
  handleSubmitManualApplication,
  submitting,
  isEdit,
}) {
  return (
    <>
      {/* Manual Form - Personal Info */}
      <div className="brutal-card bg-[var(--card-bg)] p-6">
        <h2 className="font-['Space_Grotesk'] font-bold text-sm uppercase tracking-wider mb-4">
          Personal Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-mono text-xs font-bold mb-2">First Name *</label>
            <input
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
            <label className="block font-mono text-xs font-bold mb-2">Last Name *</label>
            <input
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
            <label className="block font-mono text-xs font-bold mb-2">Email *</label>
            <input
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
            <label className="block font-mono text-xs font-bold mb-2">Phone</label>
            <input
              type="tel"
              value={manualFormData.phone}
              onChange={(e) =>
                setManualFormData({ ...manualFormData, phone: e.target.value })
              }
              className="w-full border-2 border-[var(--border-color)] bg-[var(--bg)] text-[var(--fg)] px-3 py-2 font-mono text-sm outline-none focus:border-[var(--yellow)]"
              placeholder="+1234567890"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block font-mono text-xs font-bold mb-2">Professional Summary</label>
          <textarea
            value={manualFormData.summary}
            onChange={(e) =>
              setManualFormData({ ...manualFormData, summary: e.target.value })
            }
            className="w-full border-2 border-[var(--border-color)] bg-[var(--bg)] text-[var(--fg)] px-3 py-2 font-mono text-sm outline-none focus:border-[var(--yellow)] resize-y min-h-20"
            placeholder="Brief summary of your background and experience..."
          />
        </div>
        <div className="mt-4">
          <label className="block font-mono text-xs font-bold mb-2">Years of Experience</label>
          <input
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

      {/* Technical Skills */}
      <div className="brutal-card bg-[var(--card-bg)] p-6">
        <h2 className="font-['Space_Grotesk'] font-bold text-sm uppercase tracking-wider mb-4">
          Technical Skills *{" "}
          {validationErrors.technicalSkills && (
            <span className="text-[var(--coral)]">{validationErrors.technicalSkills}</span>
          )}
        </h2>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={technicalSkillInput}
            onChange={(e) => setTechnicalSkillInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddSkill("technical");
              }
            }}
            placeholder="Add a skill (e.g., React, Node.js)..."
            className="flex-1 border-2 border-[var(--border-color)] bg-[var(--bg)] text-[var(--fg)] px-3 py-2 font-mono text-sm outline-none focus:border-[var(--yellow)]"
          />
          <button
            type="button"
            onClick={() => handleAddSkill("technical")}
            className="brutal-btn px-4 py-2 font-bold"
            style={{ background: "var(--teal)", color: "#0a0a0a" }}
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {manualFormData.technicalSkills.map((skill, i) => (
            <div
              key={i}
              className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--teal)] text-black font-mono text-xs font-bold rounded"
            >
              {skill}
              <button
                type="button"
                onClick={() => handleRemoveSkill("technical", i)}
                className="ml-1 text-black hover:font-bold"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Soft Skills */}
      <div className="brutal-card bg-[var(--card-bg)] p-6">
        <h2 className="font-['Space_Grotesk'] font-bold text-sm uppercase tracking-wider mb-4">
          Soft Skills
        </h2>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={softSkillInput}
            onChange={(e) => setSoftSkillInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddSkill("soft");
              }
            }}
            placeholder="Add a soft skill (e.g., Communication, Leadership)..."
            className="flex-1 border-2 border-[var(--border-color)] bg-[var(--bg)] text-[var(--fg)] px-3 py-2 font-mono text-sm outline-none focus:border-[var(--yellow)]"
          />
          <button
            type="button"
            onClick={() => handleAddSkill("soft")}
            className="brutal-btn px-4 py-2 font-bold"
            style={{ background: "var(--mint)", color: "#0a0a0a" }}
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {manualFormData.softSkills.map((skill, i) => (
            <div
              key={i}
              className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--mint)] text-black font-mono text-xs font-bold rounded"
            >
              {skill}
              <button
                type="button"
                onClick={() => handleRemoveSkill("soft", i)}
                className="ml-1 text-black hover:font-bold"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Languages */}
      <div className="brutal-card bg-[var(--card-bg)] p-6">
        <h2 className="font-['Space_Grotesk'] font-bold text-sm uppercase tracking-wider mb-4">
          Languages
        </h2>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={languageInput}
            onChange={(e) => setLanguageInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddLanguage();
              }
            }}
            placeholder="Add a language..."
            className="flex-1 border-2 border-[var(--border-color)] bg-[var(--bg)] text-[var(--fg)] px-3 py-2 font-mono text-sm outline-none focus:border-[var(--yellow)]"
          />
          <button
            type="button"
            onClick={handleAddLanguage}
            className="brutal-btn px-4 py-2 font-bold"
            style={{ background: "var(--yellow)", color: "#0a0a0a" }}
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {manualFormData.languages.map((lang, i) => (
            <div
              key={i}
              className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--yellow)] text-black font-mono text-xs font-bold rounded"
            >
              {lang}
              <button
                type="button"
                onClick={() => handleRemoveLanguage(i)}
                className="ml-1 text-black hover:font-bold"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmitManualApplication}
        disabled={submitting}
        className="w-full brutal-btn px-6 py-4 font-bold uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
        style={{
          background: submitting ? "--fg-muted" : "var(--yellow)",
          color: "#0a0a0a",
        }}
      >
        {submitting && <Loader size={16} className="animate-spin" />}
        {submitting ? "Submitting..." : isEdit ? "Update Application" : "Submit Application"}
      </button>
    </>
  );
}
