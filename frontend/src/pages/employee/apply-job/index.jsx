import React, { useState } from "react";
import { X, Loader } from "lucide-react";
import { useLocation, useParams } from "react-router-dom";
import { useApplyJob } from "./hooks/useApplyJob";

// Subcomponents
import MethodSelector from "./components/MethodSelector";
import CvSelector from "./components/CvSelector";
import PdfUploader from "./components/PdfUploader";
import ApplicationViewer from "../../../components/applications/ApplicationViewer";

export default function ApplyJobModal({ jobId, appId, onClose }) {
  const { jobId: routeJobId } = useParams();
  const resolvedJobId = jobId || routeJobId;
  // handleAutoClose: fallback if no onClose prop (standalone page mode)
  const handleAutoClose = () => navigate("/employee/jobs");
  const applyParams = useApplyJob(
    resolvedJobId,
    appId,
    onClose ?? handleAutoClose,
  );
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
    submitting,
    matchAnalysis,
    setMatchAnalysis,
    applicationMethod,
    validationErrors,
    toastNotice,
    handleSwitchMethod,
    handleFileUpload,
    handleSubmitApplication,
    handleInstantSubmitApplication,
    loadedApplication,
    isEdit,
    hasDuplicateApplication,
    duplicateCheckDone,
    formHasChanged,
  } = applyParams;

  const [tab, setTab] = useState("update"); // update | view

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

  // FIX #2: Show duplicate check screen FIRST (before job loading or anything else)
  if (!duplicateCheckDone) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <div className="bg-[var(--nm-bg)] p-12 flex flex-col items-center border-4 border-[var(--nm-ink)] shadow-[12px_12px_0_var(--nm-ink)]">
          <Loader className="animate-spin mb-6" size={40} color="var(--nm-primary)" />
          <p className="font-['Space_Grotesk'] font-bold uppercase tracking-widest text-[var(--nm-text-primary)]">
            Checking application status...
          </p>
        </div>
      </div>
    );
  }

  // FIX #2: If already applied, show ONLY the duplicate screen with two buttons - nothing else
  if (hasDuplicateApplication && !isEdit) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <div className="bg-[var(--nm-bg)] p-10 max-w-md w-full text-center border-4 border-[var(--nm-ink)] shadow-[12px_12px_0_var(--nm-ink)] relative">
          <div className="absolute top-0 left-0 w-full h-3 bg-[var(--nm-error)]"></div>
          <p className="font-['Space_Grotesk'] font-black text-2xl uppercase text-[var(--nm-error)] mt-4 mb-3 tracking-wider">
            Already Applied
          </p>
          <p className="font-['Manrope'] text-sm text-[var(--nm-text-secondary)] mb-6">
            You have already applied for this position.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <button
              onClick={() => navigate("/employee/applications")}
              className="jd-btn jd-btn-primary w-full py-4 font-black"
            >
              View My Applications
            </button>
            <button
              onClick={handleClose}
              className="jd-btn jd-btn-secondary w-full py-4 font-black"
            >
              Browse Other Jobs
            </button>
          </div>
        </div>
      </div>
    );
  }

  const toastPopup = toastNotice ? (
    <>
      <style>{`
        @keyframes applyToastInOut {
          0% { opacity: 0; transform: translateY(-8px); }
          12% { opacity: 1; transform: translateY(0); }
          88% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-8px); }
        }
      `}</style>
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[120] pointer-events-none">
        <div
          key={toastNotice.id}
          className="px-6 py-3 font-['Space_Grotesk'] font-bold text-sm uppercase tracking-wider"
          style={{
            animation: "applyToastInOut 2.4s ease forwards",
            background: "var(--nm-surface)",
            color: "var(--nm-text-primary)",
            border: "4px solid var(--nm-ink)",
            boxShadow: "6px 6px 0 var(--nm-ink)",
          }}
        >
          {toastNotice.message}
        </div>
      </div>
    </>
  ) : null;

  // Loading state
  if (jobLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        {toastPopup}
        <div className="bg-[var(--nm-bg)] p-12 flex flex-col items-center border-4 border-[var(--nm-ink)] shadow-[12px_12px_0_var(--nm-ink)]">
          <Loader className="animate-spin mb-6" size={40} color="var(--nm-primary)" />
          <p className="font-['Space_Grotesk'] font-bold uppercase tracking-widest text-[var(--nm-text-primary)]">
            Loading job details...
          </p>
        </div>
      </div>
    );
  }

  // Job not found
  if (!job) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        {toastPopup}
        <div className="bg-[var(--nm-bg)] p-10 max-w-md w-full text-center border-4 border-[var(--nm-ink)] shadow-[12px_12px_0_var(--nm-ink)] relative">
          <div className="absolute top-0 left-0 w-full h-3 bg-[var(--nm-error)]"></div>
          <p className="font-['Space_Grotesk'] font-black text-2xl uppercase text-[var(--nm-error)] mt-4 mb-3 tracking-wider">
            Job not found
          </p>
          <p className="font-['Manrope'] text-sm text-[var(--nm-text-secondary)] mb-6">
            This job may have been removed or the link is invalid. Please try
            another job.
          </p>
          <button
            onClick={handleClose}
            className="jd-btn jd-btn-primary w-full py-4 font-black"
          >
            Close Window
          </button>
        </div>
      </div>
    );
  }

  // Upload Screen
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 md:p-8 overflow-y-auto">
      {toastPopup}
      <div className="bg-[var(--nm-bg)] w-full max-w-3xl relative flex flex-col border-4 border-[var(--nm-ink)] shadow-[12px_12px_0_var(--nm-ink)] my-auto overflow-hidden">
        {submitting && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-[var(--nm-surface)] p-8 border-4 border-[var(--nm-primary)] shadow-[6px_6px_0_var(--nm-ink)] flex flex-col items-center text-center max-w-sm">
              <Loader
                className="animate-spin mb-6"
                size={48}
                color="var(--nm-primary)"
              />
              <p className="font-['Space_Grotesk'] font-black uppercase text-xl text-[var(--nm-text-primary)] tracking-widest">
                Processing
              </p>
              <p className="font-['Manrope'] text-sm text-[var(--nm-text-secondary)] mt-2">
                Submitting your application...
              </p>
            </div>
          </div>
        )}
        <div className="p-4 sm:p-8">
          <div className="flex justify-between items-start gap-4 mb-6 sm:mb-8">
            <div>
              <h1 className="text-xl sm:text-3xl font-bold font-['Space_Grotesk'] uppercase tracking-tight mb-2 text-[var(--nm-text-primary)]">
                Apply for {job.position}
              </h1>
              <p className="font-['Manrope'] text-sm text-[var(--nm-text-secondary)]">
                {job.employerId?.company?.name} • {job.workSite}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 border-4 border-[var(--nm-ink)] bg-[var(--nm-surface)] hover:bg-[var(--nm-primary)] hover:text-white transition-colors shadow-[3px_3px_0_var(--nm-ink)] shrink-0"
            >
              <X size={20} />
            </button>
          </div>

          {isEdit && (
            <div className="flex items-center gap-3 mb-6">
              <button
                className={`jd-btn px-4 py-2 font-bold uppercase tracking-wider ${tab === "update" ? "jd-btn-primary" : "jd-btn-secondary"}`}
                onClick={() => setTab("update")}
              >
                Update Details
              </button>
              <button
                className={`jd-btn px-4 py-2 font-bold uppercase tracking-wider ${tab === "view" ? "jd-btn-primary" : "jd-btn-secondary"}`}
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
              <p className="font-mono text-sm text-[var(--fg-muted)]">
                Loading submission...
              </p>
            )
          ) : (
            <div className="space-y-8">
              {/* FIX #4: Allow method switching during update */}
              <MethodSelector
                applicationMethod={applicationMethod}
                handleSwitchMethod={handleSwitchMethod}
                setSelectedCvId={setSelectedCvId}
              />

              {/* Display validation errors */}
              {Object.keys(validationErrors).length > 0 && (
                <div className="p-5 bg-[var(--nm-error-surface)] border-4 border-[var(--nm-error)]">
                  <p className="font-['Space_Grotesk'] font-bold text-sm uppercase text-[var(--nm-error)] mb-2">
                    Validation Errors:
                  </p>
                  {Object.entries(validationErrors).map(([key, message]) => (
                    <p
                      key={key}
                      className="font-['Manrope'] text-sm text-[var(--nm-error)] mb-1"
                    >
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
                  handleSubmitApplication={handleSubmitApplication}
                  handleInstantSubmitApplication={
                    handleInstantSubmitApplication
                  }
                  submitting={submitting}
                  isEdit={isEdit}
                  formHasChanged={formHasChanged}
                />
              )}

              {applicationMethod === "uploadPdf" && (
                <PdfUploader
                  cvFile={cvFile}
                  handleFileUpload={handleFileUpload}
                  handleSubmitApplication={handleSubmitApplication}
                  handleInstantSubmitApplication={
                    handleInstantSubmitApplication
                  }
                  submitting={submitting}
                  isEdit={isEdit}
                  formHasChanged={formHasChanged}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
