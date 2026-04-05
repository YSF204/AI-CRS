import React from "react";
import { ChevronLeft, Loader } from "lucide-react";
import DashboardNav from "../../../components/shared/DashboardNav";
import { useApplyJob } from "./hooks/useApplyJob";

// Subcomponents
import MethodSelector from "./components/MethodSelector";
import ManualForm from "./components/ManualForm";
import CvSelector from "./components/CvSelector";
import PdfUploader from "./components/PdfUploader";
import AnalysisScreen from "./components/AnalysisScreen";
import ResultScreen from "./components/ResultScreen";

export default function ApplyJob() {
  const applyParams = useApplyJob();
  const {
    navigate,
    step,
    setStep,
    job,
    jobLoading,
    cvs,
    selectedCvId,
    setSelectedCvId,
    cvFile,
    setCvFile,
    analyzing,
    submitting,
    matchAnalysis,
    setMatchAnalysis,
    applicationMethod,
    validationErrors,
    handleSwitchMethod,
    handleFileUpload,
    handleAnalyzeCv,
    handleSubmitApplication,
    handleSubmitManualApplication,
    manualFormData,
    setManualFormData,
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
    isEdit,
  } = applyParams;

  // Loading state
  if (jobLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--fg)]">
        <div className="p-8"><DashboardNav role="employee" /></div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader className="animate-spin mb-4 mx-auto" size={32} />
            <p className="font-mono text-sm text-[var(--fg-muted)]">Loading job details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Job not found
  if (!job) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--fg)]">
        <div className="p-8"><DashboardNav role="employee" /></div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="font-mono text-sm text-[var(--fg-muted)] mb-4">Job not found</p>
            <button
              onClick={() => navigate("/employee/jobs")}
              className="brutal-btn px-4 py-2 font-bold"
              style={{ background: "var(--teal)", color: "#0a0a0a" }}
            >
              Back to Jobs
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Result Screen
  if (step === "result" && matchAnalysis) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--fg)]">
        <div className="p-8"><DashboardNav role="employee" /></div>
        <ResultScreen matchAnalysis={matchAnalysis} navigate={navigate} />
      </div>
    );
  }

  // Analysis Screen
  if (step === "analysis" && matchAnalysis) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--fg)]">
        <div className="p-8"><DashboardNav role="employee" /></div>
        <div className="flex-1 overflow-y-auto px-8 pb-8">
          <AnalysisScreen
            job={job}
            matchAnalysis={matchAnalysis}
            setStep={setStep}
            setMatchAnalysis={setMatchAnalysis}
            setCvFile={setCvFile}
            handleSubmitApplication={handleSubmitApplication}
            submitting={submitting}
            isEdit={isEdit}
          />
        </div>
      </div>
    );
  }

  // Header Component for Upload Screen
  const Header = () => (
    <div className="mb-8">
      <button
        onClick={() => navigate("/employee/jobs")}
        className="flex items-center gap-2 mb-4 text-[var(--teal)] hover:text-[var(--yellow)] transition-colors"
      >
        <ChevronLeft size={18} />
        <span className="font-mono text-sm font-bold">Back</span>
      </button>
      <h1 className="text-3xl font-bold font-['Space_Grotesk'] uppercase tracking-tight mb-2">
        Apply for {job.position}
      </h1>
      <p className="font-mono text-sm text-[var(--fg-muted)]">
        {job.employerId?.company?.name} • {job.workSite}
      </p>
    </div>
  );

  // Upload Screen
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--fg)]">
      <div className="p-8">
        <DashboardNav role="employee" />
      </div>

      <div className="flex-1 overflow-y-auto px-8 pb-8">
        <div className="max-w-2xl mx-auto">
          <Header />

          <div className="space-y-8">
            <MethodSelector
              applicationMethod={applicationMethod}
              handleSwitchMethod={handleSwitchMethod}
              setSelectedCvId={setSelectedCvId}
            />

            {/* Display validation errors */}
            {Object.keys(validationErrors).length > 0 && (
              <div className="brutal-card bg-[rgba(255,107,107,0.1)] border-4 border-[var(--coral)] p-4">
                <p className="font-['Space_Grotesk'] font-bold text-sm uppercase text-[var(--coral)] mb-2">
                  ⚠️ Validation Errors:
                </p>
                {Object.entries(validationErrors).map(([key, message]) => (
                  <p key={key} className="font-mono text-sm text-[var(--coral)] mb-1">
                    • {message}
                  </p>
                ))}
              </div>
            )}

            {/* Render conditional form based on selection */}
            {applicationMethod === "existingCv" && (
              <CvSelector
                cvs={cvs}
                selectedCvId={selectedCvId}
                setSelectedCvId={setSelectedCvId}
                setMatchAnalysis={setMatchAnalysis}
                handleAnalyzeCv={handleAnalyzeCv}
                analyzing={analyzing}
              />
            )}

            {applicationMethod === "uploadPdf" && (
              <PdfUploader
                cvFile={cvFile}
                handleFileUpload={handleFileUpload}
                handleAnalyzeCv={handleAnalyzeCv}
                analyzing={analyzing}
              />
            )}

            {applicationMethod === "manual" && (
              <ManualForm
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
                handleSubmitManualApplication={handleSubmitManualApplication}
                submitting={submitting}
                isEdit={isEdit}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
