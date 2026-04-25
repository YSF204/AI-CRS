import React, { useState } from "react";
import { X, Loader } from "lucide-react";
import { useLocation, useParams } from "react-router-dom";
import { useApplyJob } from "./hooks/useApplyJob";

// Subcomponents
import MethodSelector from "./components/MethodSelector";
import CvSelector from "./components/CvSelector";
import PdfUploader from "./components/PdfUploader";
import AnalysisScreen from "./components/AnalysisScreen";
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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
        <div className="brutal-card bg-[var(--bg)] p-12 flex flex-col items-center border-[6px] border-black shadow-[12px_12px_0px_0px_#000]">
          <Loader className="animate-spin mb-6" size={40} color="var(--teal)" />
          <p className="font-mono font-bold uppercase tracking-widest text-[var(--fg)]">
            Checking application status...
          </p>
        </div>
      </div>
    );
  }

  // FIX #2: If already applied, show ONLY the duplicate screen with two buttons - nothing else
  if (hasDuplicateApplication && !isEdit) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
        <div className="brutal-card bg-[var(--bg)] p-10 max-w-md w-full text-center border-[6px] border-black shadow-[12px_12px_0px_0px_var(--coral)] relative">
          <div className="absolute top-0 left-0 w-full h-3 bg-[var(--coral)]"></div>
          <p className="font-['Space_Grotesk'] font-black text-2xl uppercase text-[var(--coral)] mt-4 mb-3 tracking-wider">
            Already Applied
          </p>
          <p className="font-mono text-sm text-[var(--fg-muted)] mb-6">
            You have already applied for this position.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <button
              onClick={() => navigate("/employee/applications")}
              className="w-full brutal-btn px-6 py-4 font-black uppercase tracking-widest border-4 border-black"
              style={{ background: "var(--teal)", color: "#0a0a0a" }}
            >
              View My Applications
            </button>
            <button
              onClick={handleClose}
              className="w-full brutal-btn px-6 py-4 font-black uppercase tracking-widest border-4 border-black"
              style={{
                background: "var(--card-bg)",
                color: "var(--fg)",
                borderColor: "var(--border-color)",
              }}
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

  // Loading state
  if (jobLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
        {toastPopup}
        <div className="brutal-card bg-[var(--bg)] p-12 flex flex-col items-center border-[6px] border-black shadow-[12px_12px_0px_0px_#000]">
          <Loader className="animate-spin mb-6" size={40} color="var(--teal)" />
          <p className="font-mono font-bold uppercase tracking-widest text-[var(--fg)]">
            Loading job details...
          </p>
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
          <p className="font-['Space_Grotesk'] font-black text-2xl uppercase text-[var(--coral)] mt-4 mb-3 tracking-wider">
            Job not found
          </p>
          <p className="font-mono text-sm text-[var(--fg-muted)] mb-6">
            This job may have been removed or the link is invalid. Please try
            another job.
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

  // ── Success screen (instant apply & after analysis) ──────────────────────
  if (step === 'success') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
        <div style={{
          background: "#ffffff",
          border: "4px solid #1b1c15",
          borderRadius: 0,
          padding: "3rem 2.5rem",
          display: "flex", flexDirection: "column", alignItems: "center",
          gap: "1.25rem", maxWidth: 380, width: "100%",
          boxShadow: "8px 8px 0px 0px #1b1c15",
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: 0,
            background: "#ffffff", border: "4px solid #1b1c15",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#1e51f6", fontSize: "2.5rem", fontWeight: 900,
          }}>
            ✓
          </div>
          <h2 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 800, fontSize: "1.5rem",
            color: "#1b1c15", margin: 0, textAlign: "center",
            letterSpacing: "-0.02em", textTransform: "uppercase",
          }}>
            Applied
          </h2>
          <p style={{
            fontFamily: "'Manrope', sans-serif",
            fontSize: "14px", color: "#1b1c15", fontWeight: 500,
            margin: 0, textAlign: "center", lineHeight: 1.5,
          }}>
            Your application for <strong>{job?.position}</strong> has been submitted.
          </p>
        </div>
      </div>
    );
  }

  // Analysis result screen — shown immediately after "Analyze Before Applying"
  if (step === 'result' && matchAnalysis) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md overflow-y-auto">
        {toastPopup}
        <div className="min-h-full flex items-start justify-center p-4 md:p-8">
          <AnalysisScreen
            job={job}
            matchAnalysis={matchAnalysis}
            setStep={setStep}
            setMatchAnalysis={setMatchAnalysis}
            setCvFile={setCvFile}
            setSelectedCvId={setSelectedCvId}
            handleSubmitApplication={handleInstantSubmitApplication}
            submitting={submitting}
            isEdit={isEdit}
          />
        </div>
      </div>
    );
  }

  // Upload Screen
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 md:p-8 overflow-y-auto">
      {toastPopup}
      <div className="brutal-card bg-[var(--bg)] w-full max-w-3xl relative flex flex-col border-[6px] border-black shadow-[16px_16px_0px_0px_#000] my-auto overflow-hidden">
        {submitting && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
            <div className="bg-[var(--card-bg)] p-8 border-4 border-[var(--yellow)] shadow-[8px_8px_0px_0px_#000] flex flex-col items-center text-center max-w-sm">
              <Loader
                className="animate-spin mb-6"
                size={48}
                color="var(--yellow)"
              />
              <p className="font-['Space_Grotesk'] font-black uppercase text-xl text-[var(--fg)] tracking-widest">
                Processing
              </p>
              <p className="font-mono text-sm text-[var(--fg-muted)] mt-2">
                Submitting your application...
              </p>
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
            <button
              onClick={handleClose}
              className="p-2 border-2 border-transparent hover:border-[var(--coral)] hover:text-[var(--coral)] transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {isEdit && (
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem", borderBottom: "4px solid var(--nm-ink)" }}>
              <button
                style={{
                  padding: "1rem 2rem",
                  fontFamily: "var(--font-display)",
                  fontWeight: 900,
                  fontSize: "14px",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  background: tab === "update" ? "var(--nm-ink)" : "var(--nm-bg)",
                  color: tab === "update" ? "#ffffff" : "var(--nm-text-primary)",
                  border: "4px solid var(--nm-ink)",
                  borderBottom: "none",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onClick={() => setTab("update")}
              >
                Update Details
              </button>
              <button
                style={{
                  padding: "1rem 2rem",
                  fontFamily: "var(--font-display)",
                  fontWeight: 900,
                  fontSize: "14px",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  background: tab === "view" ? "var(--nm-primary)" : "var(--nm-bg)",
                  color: tab === "view" ? "#ffffff" : "var(--nm-text-primary)",
                  border: "4px solid var(--nm-ink)",
                  borderBottom: "none",
                  cursor: !loadedApplication ? "not-allowed" : "pointer",
                  opacity: !loadedApplication ? 0.5 : 1,
                  transition: "all 0.2s",
                }}
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
                <div className="brutal-card bg-[rgba(255,107,107,0.1)] border-4 border-[var(--coral)] p-4">
                  <p className="font-['Space_Grotesk'] font-bold text-sm uppercase text-[var(--coral)] mb-2">
                    ⚠️ Validation Errors:
                  </p>
                  {Object.entries(validationErrors).map(([key, message]) => (
                    <p
                      key={key}
                      className="font-mono text-sm text-[var(--coral)] mb-1"
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
