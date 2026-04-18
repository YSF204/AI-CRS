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
  handleAddCertification,
  handleRemoveCertification,
  handleEducationDraftChange,
  handleAddEducation,
  handleRemoveEducation,
  handleSubmitManualApplication,
  handleSubmitManualDirectly,
  submitting,
  isEdit,
  formHasChanged, // FIX #6: Added form change detection
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
            <label className="block font-mono text-xs font-bold mb-2">
              First Name *
            </label>
            <input
              type="text"
              value={manualFormData.firstName}
              onChange={(e) =>
                setManualFormData({
                  ...manualFormData,
                  firstName: e.target.value,
                })
              }
              className={`w-full border-2 px-3 py-2 font-mono text-sm outline-none focus:border-[var(--yellow)] bg-[var(--bg)] text-[var(--fg)] ${
                validationErrors.firstName
                  ? "border-[var(--coral)]"
                  : "border-[var(--border-color)]"
              }`}
              placeholder="John"
            />
            {validationErrors.firstName && (
              <p className="text-[var(--coral)] font-mono text-xs mt-1">
                {validationErrors.firstName}
              </p>
            )}
          </div>
          <div>
            <label className="block font-mono text-xs font-bold mb-2">
              Last Name *
            </label>
            <input
              type="text"
              value={manualFormData.lastName}
              onChange={(e) =>
                setManualFormData({
                  ...manualFormData,
                  lastName: e.target.value,
                })
              }
              className={`w-full border-2 px-3 py-2 font-mono text-sm outline-none focus:border-[var(--yellow)] bg-[var(--bg)] text-[var(--fg)] ${
                validationErrors.lastName
                  ? "border-[var(--coral)]"
                  : "border-[var(--border-color)]"
              }`}
              placeholder="Doe"
            />
            {validationErrors.lastName && (
              <p className="text-[var(--coral)] font-mono text-xs mt-1">
                {validationErrors.lastName}
              </p>
            )}
          </div>
          <div>
            <label className="block font-mono text-xs font-bold mb-2">
              Email *
            </label>
            <input
              type="email"
              value={manualFormData.email}
              onChange={(e) =>
                setManualFormData({ ...manualFormData, email: e.target.value })
              }
              className={`w-full border-2 px-3 py-2 font-mono text-sm outline-none focus:border-[var(--yellow)] bg-[var(--bg)] text-[var(--fg)] ${
                validationErrors.email
                  ? "border-[var(--coral)]"
                  : "border-[var(--border-color)]"
              }`}
              placeholder="john@example.com"
            />
            {validationErrors.email && (
              <p className="text-[var(--coral)] font-mono text-xs mt-1">
                {validationErrors.email}
              </p>
            )}
          </div>
          <div>
            <label className="block font-mono text-xs font-bold mb-2">
              Phone
            </label>
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
          <div>
            <label className="block font-mono text-xs font-bold mb-2">
              LinkedIn
            </label>
            <input
              type="url"
              value={manualFormData.linkedin}
              onChange={(e) =>
                setManualFormData({
                  ...manualFormData,
                  linkedin: e.target.value,
                })
              }
              className="w-full border-2 border-[var(--border-color)] bg-[var(--bg)] text-[var(--fg)] px-3 py-2 font-mono text-sm outline-none focus:border-[var(--yellow)]"
              placeholder="https://linkedin.com/in/your-profile"
            />
          </div>
          <div>
            <label className="block font-mono text-xs font-bold mb-2">
              Portfolio URL
            </label>
            <input
              type="url"
              value={manualFormData.portfolioUrl}
              onChange={(e) =>
                setManualFormData({
                  ...manualFormData,
                  portfolioUrl: e.target.value,
                })
              }
              className="w-full border-2 border-[var(--border-color)] bg-[var(--bg)] text-[var(--fg)] px-3 py-2 font-mono text-sm outline-none focus:border-[var(--yellow)]"
              placeholder="https://your-portfolio.com"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block font-mono text-xs font-bold mb-2">
            Professional Summary
          </label>
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
          <label className="block font-mono text-xs font-bold mb-2">
            Additional Information
          </label>
          <textarea
            value={manualFormData.additionalInformation}
            onChange={(e) =>
              setManualFormData({
                ...manualFormData,
                additionalInformation: e.target.value,
              })
            }
            className="w-full border-2 border-[var(--border-color)] bg-[var(--bg)] text-[var(--fg)] px-3 py-2 font-mono text-sm outline-none focus:border-[var(--yellow)] resize-y min-h-16"
            placeholder="Anything else you'd like to share (certifications, portfolio links, preferences)..."
          />
        </div>
        <div className="mt-4">
          <label className="block font-mono text-xs font-bold mb-2">
            Years of Experience
          </label>
          <input
            type="number"
            value={manualFormData.yearsOfExperience}
            onChange={(e) =>
              setManualFormData({
                ...manualFormData,
                yearsOfExperience: e.target.value,
              })
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
            <span className="text-[var(--coral)]">
              {validationErrors.technicalSkills}
            </span>
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

      {/* Certifications */}
      <div className="brutal-card bg-[var(--card-bg)] p-6">
        <h2 className="font-['Space_Grotesk'] font-bold text-sm uppercase tracking-wider mb-4">
          Certifications
        </h2>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={manualFormData.certificationInput || ""}
            onChange={(e) =>
              setManualFormData({
                ...manualFormData,
                certificationInput: e.target.value,
              })
            }
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddCertification();
              }
            }}
            placeholder="Add certification (e.g., AWS Certified Solutions Architect)"
            className="flex-1 border-2 border-[var(--border-color)] bg-[var(--bg)] text-[var(--fg)] px-3 py-2 font-mono text-sm outline-none focus:border-[var(--yellow)]"
          />
          <button
            type="button"
            onClick={handleAddCertification}
            className="brutal-btn px-4 py-2 font-bold"
            style={{ background: "var(--yellow)", color: "#0a0a0a" }}
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {(manualFormData.certifications || []).map((cert, i) => (
            <div
              key={i}
              className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--yellow)] text-black font-mono text-xs font-bold rounded"
            >
              {cert}
              <button
                type="button"
                onClick={() => handleRemoveCertification(i)}
                className="ml-1 text-black hover:font-bold"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Education */}
      <div className="brutal-card bg-[var(--card-bg)] p-6">
        <h2 className="font-['Space_Grotesk'] font-bold text-sm uppercase tracking-wider mb-4">
          Education
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="text"
            value={manualFormData.educationDraft?.institutionName || ""}
            onChange={(e) =>
              handleEducationDraftChange("institutionName", e.target.value)
            }
            placeholder="Institution name *"
            className="border-2 border-[var(--border-color)] bg-[var(--bg)] text-[var(--fg)] px-3 py-2 font-mono text-sm outline-none focus:border-[var(--yellow)]"
          />
          <input
            type="text"
            value={manualFormData.educationDraft?.certification || ""}
            onChange={(e) =>
              handleEducationDraftChange("certification", e.target.value)
            }
            placeholder="Degree / Certification *"
            className="border-2 border-[var(--border-color)] bg-[var(--bg)] text-[var(--fg)] px-3 py-2 font-mono text-sm outline-none focus:border-[var(--yellow)]"
          />
          <input
            type="text"
            value={manualFormData.educationDraft?.durationFrom || ""}
            onChange={(e) =>
              handleEducationDraftChange("durationFrom", e.target.value)
            }
            placeholder="From (e.g., 2018)"
            className="border-2 border-[var(--border-color)] bg-[var(--bg)] text-[var(--fg)] px-3 py-2 font-mono text-sm outline-none focus:border-[var(--yellow)]"
          />
          <input
            type="text"
            value={manualFormData.educationDraft?.durationTo || ""}
            onChange={(e) =>
              handleEducationDraftChange("durationTo", e.target.value)
            }
            placeholder="To (e.g., 2022 or Present)"
            className="border-2 border-[var(--border-color)] bg-[var(--bg)] text-[var(--fg)] px-3 py-2 font-mono text-sm outline-none focus:border-[var(--yellow)]"
          />
          <textarea
            value={manualFormData.educationDraft?.summary || ""}
            onChange={(e) =>
              handleEducationDraftChange("summary", e.target.value)
            }
            placeholder="Optional notes (honors, GPA, focus area...)"
            className="md:col-span-2 border-2 border-[var(--border-color)] bg-[var(--bg)] text-[var(--fg)] px-3 py-2 font-mono text-sm outline-none focus:border-[var(--yellow)] resize-y min-h-16"
          />
        </div>
        <button
          type="button"
          onClick={handleAddEducation}
          className="mt-3 brutal-btn px-4 py-2 font-bold"
          style={{ background: "var(--mint)", color: "#0a0a0a" }}
        >
          Add Education Entry
        </button>

        <div className="mt-4 space-y-3">
          {(manualFormData.education || []).map((edu, i) => (
            <div
              key={i}
              className="brutal-card bg-[var(--bg)] border-2 border-[var(--border-color)] p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-sm">{edu.certification}</p>
                  <p className="font-mono text-xs text-[var(--fg-muted)]">
                    {edu.institutionName}
                    {(edu.durationFrom || edu.durationTo) &&
                      ` • ${edu.durationFrom || ""}${edu.durationTo ? ` - ${edu.durationTo}` : ""}`}
                  </p>
                  {edu.summary && (
                    <p className="font-mono text-xs mt-2 text-[var(--fg-muted)]">
                      {edu.summary}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveEducation(i)}
                  className="brutal-btn px-2 py-1 font-bold text-xs"
                  style={{ background: "var(--coral)", color: "#0a0a0a" }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex gap-4">
        <button
          onClick={handleSubmitManualApplication}
          disabled={submitting || (isEdit && !formHasChanged)}
          className="flex-1 brutal-btn px-4 py-4 font-bold uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
          title={isEdit && !formHasChanged ? "No changes to submit" : ""}
          style={{
            background:
              submitting || (isEdit && !formHasChanged)
                ? "var(--fg-muted)"
                : "var(--yellow)",
            color: "#0a0a0a",
          }}
        >
          {submitting && <Loader size={16} className="animate-spin" />}
          {submitting
            ? "Analyzing..."
            : isEdit
              ? "Analyze & Update"
              : "Analyze & Submit"}
        </button>
        <button
          onClick={handleSubmitManualDirectly}
          disabled={submitting || (isEdit && !formHasChanged)}
          className="flex-1 brutal-btn px-4 py-4 font-bold uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 border-2 border-black"
          title={isEdit && !formHasChanged ? "No changes to submit" : ""}
          style={{
            background: "var(--teal)",
            color: "#0a0a0a",
          }}
          title="Submit the application immediately without AI analysis"
        >
          {isEdit ? "Update Directly" : "Apply Directly"}
        </button>
      </div>
    </>
  );
}
