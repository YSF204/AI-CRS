import React from "react";

export default function ExperienceFields({
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
}) {
  return (
    <>
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
            placeholder="أضف مهارة (مثال: React, Node.js)..."
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
            placeholder="أضف مهارة شخصية (مثال: التواصل, القيادة)..."
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
            placeholder="أضف لغة (مثال: عربي, إنجليزي)..."
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
            placeholder="أضف شهادة (مثال: شهادة Oracle, AWS Certified Solutions Architect)"
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
            placeholder="اسم المؤسسة التعليمية *"
            className="border-2 border-[var(--border-color)] bg-[var(--bg)] text-[var(--fg)] px-3 py-2 font-mono text-sm outline-none focus:border-[var(--yellow)]"
          />
          <input
            type="text"
            value={manualFormData.educationDraft?.certification || ""}
            onChange={(e) =>
              handleEducationDraftChange("certification", e.target.value)
            }
            placeholder="الدرجة / الشهادة *"
            className="border-2 border-[var(--border-color)] bg-[var(--bg)] text-[var(--fg)] px-3 py-2 font-mono text-sm outline-none focus:border-[var(--yellow)]"
          />
          <input
            type="text"
            value={manualFormData.educationDraft?.durationFrom || ""}
            onChange={(e) =>
              handleEducationDraftChange("durationFrom", e.target.value)
            }
            placeholder="من (مثال: 2018)"
            className="border-2 border-[var(--border-color)] bg-[var(--bg)] text-[var(--fg)] px-3 py-2 font-mono text-sm outline-none focus:border-[var(--yellow)]"
          />
          <input
            type="text"
            value={manualFormData.educationDraft?.durationTo || ""}
            onChange={(e) =>
              handleEducationDraftChange("durationTo", e.target.value)
            }
            placeholder="إلى (مثال: 2022 أو حتى الآن)"
            className="border-2 border-[var(--border-color)] bg-[var(--bg)] text-[var(--fg)] px-3 py-2 font-mono text-sm outline-none focus:border-[var(--yellow)]"
          />
          <textarea
            value={manualFormData.educationDraft?.summary || ""}
            onChange={(e) =>
              handleEducationDraftChange("summary", e.target.value)
            }
            placeholder="ملاحظات اختيارية (المعدل, التخصص, التكريمات...)"
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
    </>
  );
}
