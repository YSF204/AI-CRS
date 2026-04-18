import React, { useState } from "react";
import { X, Loader } from "lucide-react";
import { useLocation, useParams } from "react-router-dom";
import { useApplyJob } from "./hooks/useApplyJob";

// Subcomponents
import MethodSelector from "./components/MethodSelector";
import ManualForm from "./components/ManualForm";
import CvSelector from "./components/CvSelector";
import PdfUploader from "./components/PdfUploader";
import AnalysisScreen from "./components/AnalysisScreen";
import ApplicationViewer from "../../../components/applications/ApplicationViewer";

export default function ApplyJobModal({ jobId, appId, onClose }) {
  const { jobId: routeJobId } = useParams();
  const resolvedJobId = jobId || routeJobId;
  // handleAutoClose: fallback if no onClose prop (standalone page mode)
  const handleAutoClose = () => navigate("/employee/jobs");
  const applyParams = useApplyJob(resolvedJobId, appId, onClose ?? handleAutoClose);
  const location = useLocation();
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
    toastNotice,
    handleSwitchMethod,
    handleFileUpload,
    handleAnalyzeCv,
    handleApplyDirectly,
    handleSubmitApplication,
    handleSubmitManualApplication,
    handleSubmitManualDirectly,
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
    handleAddCertification,
    handleRemoveCertification,
    handleEducationDraftChange,
    handleAddEducation,
    handleRemoveEducation,
    loadedApplication,
    isEdit,
  } = applyParams;

  const [tab, setTab] = useState("update"); // update | view
  const methodLocked = isEdit;

  const toastPopup = toastNotice ? (
    <>
      <style>{`
        @keyframes applyToastInOut {
          0% { opacity: 0; transform: translateY(-8px) scale(0.98); }
          12% { opacity: 1; transform: translateY(0) scale(1); }
          88% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-8px) scale(0.98); }
        }
      `}</style>
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[120] pointer-events-none">
        <div
          key={toastNotice.id}
          className="brutal-card border-4 border-black px-5 py-3 shadow-[8px_8px_0px_0px_#000] font-mono text-sm font-bold"
          style={{
            animation: "applyToastInOut 2.4s ease forwards",
            background: "var(--yellow)",
            color: "#0a0a0a",
          }}
        >
          {toastNotice.message}
        </div>
      </div>
    </>
  ) : null;

  const handleClose = () => {
    if (onClose) {
      onClose();
      return;
    }

    if (location.state?.source === "find-job-by-cv") {
      navigate("/employee/find-job-by-cv");
      return;
    }

    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/employee/jobs");
  };

  // Loading state
  if (jobLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
        {toastPopup}
        <div className="brutal-card bg-[var(--bg)] p-12 flex flex-col items-center border-[6px] border-black shadow-[12px_12px_0px_0px_#000]">
          <Loader className="animate-spin mb-6" size={40} color="var(--teal)" />
          <p className="font-mono font-bold uppercase tracking-widest text-[var(--fg)]">Loading job details...</p>
        </div>
      </div>
    );
  }

  // Job not found
  if (!job) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
        {toastPopup}
        <div className="brutal-card bg-[var(--bg)] p-10 max-w-md w-full text-center border-[6px] border-black shadow-[12px_12px_0px_0px_var(--coral)] relative">
          <div className="absolute top-0 left-0 w-full h-3 bg-[var(--coral)]"></div>
          <p className="font-['Space_Grotesk'] font-black text-2xl uppercase text-[var(--coral)] mt-4 mb-3 tracking-wider">Job not found</p>
          <p className="font-mono text-sm text-[var(--fg-muted)] mb-6">
            This job may have been removed or the link is invalid. Please try another job.
          </p>
          <button
            onClick={handleClose}
            className="w-full brutal-btn px-6 py-4 font-black uppercase tracking-widest border-4 border-black hover:bg-white hover:text-black transition-colors"
            style={{ background: "var(--teal)", color: "#0a0a0a" }}
          >
            Close Window
          </button>
        </div>
      </div>
    );
  }

  // Analysis Screen
  if (step === "analysis" && matchAnalysis) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 md:p-8 overflow-y-auto">
        {toastPopup}
        <div className="brutal-card bg-[var(--bg)] w-full max-w-4xl min-h-[80vh] relative flex flex-col border-[6px] border-black shadow-[16px_16px_0px_0px_#000] my-auto overflow-hidden">
          {submitting && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
              <div className="bg-[var(--card-bg)] p-8 border-4 border-[var(--teal)] shadow-[8px_8px_0px_0px_#000] flex flex-col items-center text-center max-w-sm">
                <Loader className="animate-spin mb-6" size={48} color="var(--teal)" />
                <p className="font-['Space_Grotesk'] font-black uppercase text-xl text-[var(--fg)] tracking-widest">Processing Data</p>
                <p className="font-mono text-sm text-[var(--fg-muted)] mt-2">Submitting your application...</p>
              </div>
            </div>
          )}
          <button 
            onClick={handleClose} 
            className="absolute top-4 right-4 z-20 bg-white text-black hover:bg-[var(--coral)] border-2 border-black p-2 transition-colors cursor-pointer shadow-[2px_2px_0px_0px_#000]"
          >
            <X size={24} />
          </button>
          <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#1a1a1a]">
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
      </div>
    );
  }

  // Upload Screen
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 md:p-8 overflow-y-auto">
      {toastPopup}
      <div className="brutal-card bg-[var(--bg)] w-full max-w-3xl relative flex flex-col border-[6px] border-black shadow-[16px_16px_0px_0px_#000] my-auto overflow-hidden">
        {(analyzing || submitting) && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
            <div className="bg-[var(--card-bg)] p-8 border-4 border-[var(--yellow)] shadow-[8px_8px_0px_0px_#000] flex flex-col items-center text-center max-w-sm">
              <Loader className="animate-spin mb-6" size={48} color="var(--yellow)" />
              <p className="font-['Space_Grotesk'] font-black uppercase text-xl text-[var(--fg)] tracking-widest">{analyzing ? "AI Analysis" : "Processing"}</p>
              <p className="font-mono text-sm text-[var(--fg-muted)] mt-2">{analyzing ? "Evaluating your alignment with the role..." : "Submitting your application..."}</p>
            </div>
          </div>
        )}
        <div className="p-8">
          <div className="mb-8 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold font-['Space_Grotesk'] uppercase tracking-tight mb-2">
                Apply for {job.position}
              </h1>
              <p className="font-mono text-sm text-[var(--fg-muted)]">
                {job.employerId?.company?.name} • {job.workSite}
              </p>
            </div>
            <button onClick={handleClose} className="p-2 border-2 border-transparent hover:border-[var(--coral)] hover:text-[var(--coral)] transition-colors">
              <X size={24} />
            </button>
          </div>

          {isEdit && (
            <div className="flex items-center gap-3 mb-6">
              <button
                className={`brutal-btn px-4 py-2 font-bold uppercase tracking-wider ${tab === "update" ? "bg-[var(--yellow)] text-black" : "bg-[var(--card-bg)] text-[var(--fg)]"}`}
                onClick={() => setTab("update")}
              >
                Update Details
              </button>
              <button
                className={`brutal-btn px-4 py-2 font-bold uppercase tracking-wider ${tab === "view" ? "bg-[var(--teal)] text-black" : "bg-[var(--card-bg)] text-[var(--fg)]"}`}
                onClick={() => setTab("view")}
                disabled={!loadedApplication}
              >
                View Submission Details
              </button>
            </div>
          )}

          {tab === "view" && isEdit ? (
            loadedApplication ? (
              <ApplicationViewer application={loadedApplication} />
            ) : (
              <p className="font-mono text-sm text-[var(--fg-muted)]">Loading submission...</p>
            )
          ) : (
          <div className="space-y-8">
            {!methodLocked && (
              <MethodSelector
                applicationMethod={applicationMethod}
                handleSwitchMethod={handleSwitchMethod}
                setSelectedCvId={setSelectedCvId}
              />
            )}
            {methodLocked && (
              <div className="brutal-card bg-[var(--card-bg)] border-4 border-[var(--border-color)] p-4 font-mono text-sm flex items-center justify-between">
                <span className="font-bold uppercase tracking-wider text-[var(--fg-muted)]">Application Method</span>
                <span className="font-black text-lg text-[var(--fg)]">
                  {applicationMethod === "uploadPdf"
                    ? "Uploaded PDF"
                    : applicationMethod === "existingCv"
                      ? "Existing CV"
                      : "Manual Form"}
                </span>
              </div>
            )}

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
                handleApplyDirectly={handleApplyDirectly}
                analyzing={analyzing}
                isEdit={isEdit}
              />
            )}

            {applicationMethod === "uploadPdf" && (
              <PdfUploader
                cvFile={cvFile}
                handleFileUpload={handleFileUpload}
                handleAnalyzeCv={handleAnalyzeCv}
                handleApplyDirectly={handleApplyDirectly}
                analyzing={analyzing}
                isEdit={isEdit}
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
                handleAddCertification={handleAddCertification}
                handleRemoveCertification={handleRemoveCertification}
                handleEducationDraftChange={handleEducationDraftChange}
                handleAddEducation={handleAddEducation}
                handleRemoveEducation={handleRemoveEducation}
                handleSubmitManualApplication={handleSubmitManualApplication}
                handleSubmitManualDirectly={handleSubmitManualDirectly}
                submitting={submitting}
                isEdit={isEdit}
              />
            )}
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
