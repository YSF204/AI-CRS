import React from "react";
import { Loader } from "lucide-react";
import PersonalFields from "./PersonalFields";
import ExperienceFields from "./ExperienceFields";

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
  formHasChanged,
}) {
  return (
    <>
      <PersonalFields
        manualFormData={manualFormData}
        setManualFormData={setManualFormData}
        validationErrors={validationErrors}
      />
      <ExperienceFields
        manualFormData={manualFormData}
        setManualFormData={setManualFormData}
        validationErrors={validationErrors}
        technicalSkillInput={technicalSkillInput}
        setTechnicalSkillInput={setTechnicalSkillInput}
        softSkillInput={softSkillInput}
        setSoftSkillInput={setSoftSkillInput}
        languageInput={languageInput}
        setLanguageInput={setLanguageInput}
        handleAddSkill={handleAddSkill}
        handleRemoveSkill={handleRemoveSkill}
        handleAddLanguage={handleAddLanguage}
        handleRemoveLanguage={handleRemoveLanguage}
        handleAddCertification={handleAddCertification}
        handleRemoveCertification={handleRemoveCertification}
        handleEducationDraftChange={handleEducationDraftChange}
        handleAddEducation={handleAddEducation}
        handleRemoveEducation={handleRemoveEducation}
      />
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
        >
          {isEdit ? "Update Directly" : "Apply Directly"}
        </button>
      </div>
    </>
  );
}
