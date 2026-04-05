import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  Upload,
  ChevronLeft,
  CheckCircle,
  AlertCircle,
  Loader,
} from "lucide-react";
import DashboardNav from "../../components/shared/DashboardNav";
import api from "../../services/api";
import useFetch from "../../hooks/useFetch";

export default function ApplyJob() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const appId = searchParams.get("appId");
  const isEdit = !!appId;

  const [step, setStep] = useState("upload"); // upload, analyzing, analysis, result
  const [cvFile, setCvFile] = useState(null);
  const [selectedCvId, setSelectedCvId] = useState("");
  const [cvs, setCvs] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [matchAnalysis, setMatchAnalysis] = useState(null);
  const [applicationMethod, setApplicationMethod] = useState(null); // null, existingCv, uploadPdf, manual
  const [validationErrors, setValidationErrors] = useState({}); // Track validation errors
  const [manualFormData, setManualFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    yearsOfExperience: "",
    technicalSkills: [],
    softSkills: [],
    languages: [],
    summary: "",
  });
  // Separate inputs for technical and soft skills
  const [technicalSkillInput, setTechnicalSkillInput] = useState("");
  const [softSkillInput, setSoftSkillInput] = useState("");
  const [languageInput, setLanguageInput] = useState("");

  const { data: job, loading: jobLoading } = useFetch(async () => {
    if (!jobId) return null;
    const res = await api.get(`/jobs/${jobId}`);
    return res.data?.data?.job;
  });

  useEffect(() => {
    // Load user's CVs
    const loadCVs = async () => {
      try {
        const res = await api.get("/cvs");
        setCvs(res.data?.data?.cvs || []);
        if (res.data?.data?.cvs?.length > 0) {
          setSelectedCvId(res.data.data.cvs[0]._id);
        }
      } catch (error) {
        console.error("Failed to load CVs:", error);
      }
    };
    loadCVs();
  }, []);

  useEffect(() => {
    // Load application data if editing
    const loadApplication = async () => {
      if (!isEdit || !appId) return;
      try {
        const res = await api.get(`/applications/${appId}`);
        const application = res.data?.data?.application;
        if (application) {
          // Pre-fill the form
          if (application.cvId) {
            setApplicationMethod("existingCv");
            setSelectedCvId(application.cvId._id);
          } else {
            setApplicationMethod("manual");
            setManualFormData({
              firstName: application.applicantInfo.fullName.split(" ")[0] || "",
              lastName:
                application.applicantInfo.fullName
                  .split(" ")
                  .slice(1)
                  .join(" ") || "",
              email: application.applicantInfo.email || "",
              phone: application.applicantInfo.phone || "",
              yearsOfExperience:
                application.applicantInfo.yearsOfExperience || "",
              technicalSkills: application.applicantInfo.technicalSkills || [],
              softSkills: application.applicantInfo.softSkills || [],
              languages: application.applicantInfo.languages || [],
              summary: application.applicantInfo.summary || "",
            });
          }
          setMatchAnalysis(application.matchDetails);
        }
      } catch (error) {
        console.error("Failed to load application:", error);
      }
    };
    loadApplication();
  }, [isEdit, appId]);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setCvFile(file);
      // Clear previous analysis when new file is selected
      setMatchAnalysis(null);
    } else {
      alert("Please upload a PDF file");
    }
  };

  const resetAnalysis = () => {
    setMatchAnalysis(null);
    setValidationErrors({});
    setCvFile(null);
  };

  const handleSwitchMethod = (method) => {
    setApplicationMethod(method);
    resetAnalysis();
  };

  const handleAnalyzeCv = async () => {
    const errors = {};

    if (applicationMethod === "existingCv" && !selectedCvId) {
      errors.cvSelection = "Please select a CV";
    } else if (applicationMethod === "uploadPdf" && !cvFile) {
      errors.cvUpload = "Please upload a PDF file";
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    // Always clear previous analysis to ensure fresh analysis
    setMatchAnalysis(null);
    setValidationErrors({});
    setAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append("jobId", jobId);

      if (applicationMethod === "uploadPdf" && cvFile) {
        formData.append("cvFile", cvFile);
      } else if (applicationMethod === "existingCv" && selectedCvId) {
        formData.append("cvId", selectedCvId);
      }

      const response = await api.post("/applications/analyze-cv", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMatchAnalysis(response.data.data);
      setStep("analysis");
    } catch (error) {
      setValidationErrors({
        cvAnalysis: error.response?.data?.message || "Failed to analyze CV",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmitApplication = async () => {
    if (!matchAnalysis || matchAnalysis.matchPercentage < 50) {
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        jobId,
        cvId: matchAnalysis.cvId,
      };
      const response = isEdit
        ? await api.patch(`/applications/${appId}`, payload)
        : await api.post("/applications", payload);

      setStep("result");
      setMatchAnalysis({
        ...matchAnalysis,
        applicationSuccess: true,
        applicationMessage: isEdit
          ? "Application updated successfully"
          : response.data.message,
      });
    } catch (error) {
      alert(error.response?.data?.message || "Application submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddSkill = (type) => {
    if (type === "technical" && technicalSkillInput.trim()) {
      setManualFormData({
        ...manualFormData,
        technicalSkills: [
          ...manualFormData.technicalSkills,
          technicalSkillInput.trim(),
        ],
      });
      setTechnicalSkillInput("");
    } else if (type === "soft" && softSkillInput.trim()) {
      setManualFormData({
        ...manualFormData,
        softSkills: [...manualFormData.softSkills, softSkillInput.trim()],
      });
      setSoftSkillInput("");
    }
  };

  const handleAddLanguage = () => {
    if (languageInput.trim()) {
      setManualFormData({
        ...manualFormData,
        languages: [...manualFormData.languages, languageInput.trim()],
      });
      setLanguageInput("");
    }
  };

  const handleRemoveSkill = (type, index) => {
    if (type === "technical") {
      setManualFormData({
        ...manualFormData,
        technicalSkills: manualFormData.technicalSkills.filter(
          (_, i) => i !== index,
        ),
      });
    } else if (type === "soft") {
      setManualFormData({
        ...manualFormData,
        softSkills: manualFormData.softSkills.filter((_, i) => i !== index),
      });
    }
  };

  const handleRemoveLanguage = (index) => {
    setManualFormData({
      ...manualFormData,
      languages: manualFormData.languages.filter((_, i) => i !== index),
    });
  };

  const handleSubmitManualApplication = async () => {
    const errors = {};

    if (!manualFormData.firstName?.trim()) {
      errors.firstName = "First name is required";
    }
    if (!manualFormData.lastName?.trim()) {
      errors.lastName = "Last name is required";
    }
    if (!manualFormData.email?.trim()) {
      errors.email = "Email is required";
    }
    if (manualFormData.technicalSkills.length === 0) {
      errors.technicalSkills = "Add at least one technical skill";
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});
    setSubmitting(true);
    try {
      const payload = {
        jobId,
        cvId: "manual",
        fullName: `${manualFormData.firstName} ${manualFormData.lastName}`,
        email: manualFormData.email,
        phone: manualFormData.phone,
        yearsOfExperience: parseInt(manualFormData.yearsOfExperience) || 0,
        technicalSkills: manualFormData.technicalSkills,
        softSkills: manualFormData.softSkills,
        languages: manualFormData.languages,
        summary: manualFormData.summary,
      };
      const response = isEdit
        ? await api.patch(`/applications/${appId}`, payload)
        : await api.post("/applications", payload);

      setStep("result");
      setMatchAnalysis({
        matchPercentage:
          response.data.data?.application?.matchPercentage ||
          response.data.data?.matchPercentage ||
          0,
        applicationSuccess: true,
        applicationMessage: isEdit
          ? "Application updated successfully"
          : response.data.message,
      });
    } catch (error) {
      alert(error.response?.data?.message || "Application submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  // Result Screen
  if (step === "result" && matchAnalysis) {
    const isSuccess =
      matchAnalysis.applicationSuccess || matchAnalysis.matchPercentage >= 50;
    return (
      <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--fg)]">
        <div className="p-8">
          <DashboardNav role="employee" />
        </div>

        <div className="flex-1 flex items-center justify-center px-8">
          <div className="brutal-card bg-[var(--card-bg)] p-8 max-w-md w-full">
            {isSuccess ? (
              <>
                <div className="flex justify-center mb-4">
                  <CheckCircle size={48} className="text-[var(--teal)]" />
                </div>
                <h2 className="text-xl font-bold font-['Space_Grotesk'] uppercase text-center mb-4">
                  Application Submitted!
                </h2>
                <p className="font-mono text-sm text-[var(--fg-muted)] text-center mb-4">
                  {matchAnalysis.applicationMessage ||
                    "Your application has been submitted successfully"}
                </p>
                <p
                  className="text-2xl font-bold text-center mb-6"
                  style={{ color: "var(--yellow)" }}
                >
                  {matchAnalysis.matchPercentage}% Match
                </p>
              </>
            ) : (
              <>
                <div className="flex justify-center mb-4">
                  <AlertCircle size={48} className="text-[var(--coral)]" />
                </div>
                <h2 className="text-xl font-bold font-['Space_Grotesk'] uppercase text-center mb-4">
                  Application Denied
                </h2>
                <p className="font-mono text-sm text-[var(--fg-muted)] text-center mb-4">
                  Your match percentage is {matchAnalysis.matchPercentage}%,
                  which is below the required 50% threshold.
                </p>
              </>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/employee/jobs`)}
                className="flex-1 brutal-btn px-4 py-2 font-bold"
                style={{ background: "var(--teal)", color: "#0a0a0a" }}
              >
                Back to Jobs
              </button>
              {isSuccess && (
                <button
                  onClick={() => navigate("/employee/applications")}
                  className="flex-1 brutal-btn px-4 py-2 font-bold"
                  style={{ background: "var(--yellow)", color: "#0a0a0a" }}
                >
                  My Applications
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Analysis Screen
  if (step === "analysis" && matchAnalysis) {
    const matchPercentage = matchAnalysis.matchPercentage || 0;
    const isQualified = matchPercentage >= 50;
    const matchBreakdown = matchAnalysis.matchDetails;

    return (
      <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--fg)]">
        <div className="p-8">
          <DashboardNav role="employee" />
        </div>

        <div className="flex-1 overflow-y-auto px-8 pb-8">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <button
                onClick={() => {
                  setStep("upload");
                  setMatchAnalysis(null);
                  setCvFile(null);
                }}
                className="flex items-center gap-2 mb-4 text-[var(--teal)] hover:text-[var(--yellow)] transition-colors"
              >
                <ChevronLeft size={18} />
                <span className="font-mono text-sm font-bold">Back</span>
              </button>
              <h1 className="text-3xl font-bold font-['Space_Grotesk'] uppercase tracking-tight mb-2">
                Match Analysis
              </h1>
              <p className="font-mono text-sm text-[var(--fg-muted)]">
                Applying for {job.position}
              </p>
            </div>

            {/* Match Score */}
            <div
              className="brutal-card p-8 mb-6 text-center border-4"
              style={{
                background: isQualified
                  ? "rgba(78, 205, 196, 0.1)"
                  : "rgba(255, 107, 107, 0.1)",
                borderColor: isQualified ? "--teal" : "var(--coral)",
              }}
            >
              <p className="font-mono text-xs font-bold text-[var(--fg-muted)] mb-2 uppercase">
                Overall Match Score
              </p>
              <p
                className="text-5xl font-bold mb-4"
                style={{ color: isQualified ? "--teal" : "var(--coral)" }}
              >
                {matchPercentage}%
              </p>
              <p
                className="font-['Space_Grotesk'] font-bold uppercase tracking-wider"
                style={{ color: isQualified ? "--teal" : "var(--coral)" }}
              >
                {isQualified ? "✓ Qualified to Apply" : "✗ Below Threshold"}
              </p>
            </div>

            {/* Match Breakdown */}
            <div className="brutal-card bg-[var(--card-bg)] p-6 mb-6">
              <h2 className="font-['Space_Grotesk'] font-bold text-sm uppercase tracking-wider mb-4">
                Match Breakdown
              </h2>
              <div className="space-y-3">
                {[
                  {
                    label: "Technical Skills",
                    score: matchBreakdown?.technicalSkillsMatch || 0,
                    weight: "(40%)",
                  },
                  {
                    label: "Experience",
                    score: matchBreakdown?.experienceMatch || 0,
                    weight: "(30%)",
                  },
                  {
                    label: "Soft Skills",
                    score: matchBreakdown?.softSkillsMatch || 0,
                    weight: "(15%)",
                  },
                  {
                    label: "Languages",
                    score: matchBreakdown?.languagesMatch || 0,
                    weight: "(15%)",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="font-mono text-xs font-bold">
                          {item.label} {item.weight}
                        </span>
                        <span
                          className="font-mono text-xs font-bold"
                          style={{ color: "var(--yellow)" }}
                        >
                          {item.score}%
                        </span>
                      </div>
                      <div
                        className="w-full h-2 bg-[var(--border-color)]"
                        style={{ borderRadius: "2px", overflow: "hidden" }}
                      >
                        <div
                          style={{
                            background: "var(--teal)",
                            width: `${item.score}%`,
                            height: "100%",
                            transition: "width 0.3s ease",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Analysis */}
            {matchAnalysis.matchDetails?.matchAnalysis && (
              <div className="brutal-card bg-[var(--card-bg)] p-6 mb-6">
                <h2 className="font-['Space_Grotesk'] font-bold text-sm uppercase tracking-wider mb-4">
                  AI Analysis
                </h2>
                <p className="font-mono text-sm leading-relaxed text-[var(--fg-muted)]">
                  {matchAnalysis.matchDetails.matchAnalysis}
                </p>
              </div>
            )}

            {/* Strengths */}
            {matchAnalysis.strengths && matchAnalysis.strengths.length > 0 && (
              <div className="brutal-card bg-[var(--card-bg)] p-6 mb-6">
                <h2
                  className="font-['Space_Grotesk'] font-bold text-sm uppercase tracking-wider mb-4"
                  style={{ color: "var(--teal)" }}
                >
                  ✓ Your Strengths
                </h2>
                <ul className="space-y-2">
                  {matchAnalysis.strengths.map((strength, i) => (
                    <li
                      key={i}
                      className="flex gap-2 font-mono text-sm text-[var(--fg-muted)]"
                    >
                      <span
                        style={{ color: "var(--teal)", fontWeight: "bold" }}
                      >
                        •
                      </span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Weaknesses */}
            {matchAnalysis.weaknesses &&
              matchAnalysis.weaknesses.length > 0 && (
                <div className="brutal-card bg-[var(--card-bg)] p-6 mb-6">
                  <h2
                    className="font-['Space_Grotesk'] font-bold text-sm uppercase tracking-wider mb-4"
                    style={{ color: "var(--coral)" }}
                  >
                    ⚠ Areas to Improve
                  </h2>
                  <ul className="space-y-2">
                    {matchAnalysis.weaknesses.map((weakness, i) => (
                      <li
                        key={i}
                        className="flex gap-2 font-mono text-sm text-[var(--fg-muted)]"
                      >
                        <span
                          style={{ color: "var(--coral)", fontWeight: "bold" }}
                        >
                          •
                        </span>
                        <span>{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setStep("upload");
                  setMatchAnalysis(null);
                  setCvFile(null);
                }}
                className="flex-1 brutal-btn px-4 py-3 font-bold uppercase"
                style={{ background: "var(--fg-muted)", color: "#0a0a0a" }}
              >
                Back
              </button>
              {isQualified && (
                <button
                  onClick={handleSubmitApplication}
                  disabled={submitting}
                  className="flex-1 brutal-btn px-4 py-3 font-bold uppercase disabled:opacity-50"
                  style={{
                    background: submitting ? "--fg-muted" : "var(--yellow)",
                    color: "#0a0a0a",
                  }}
                >
                  {submitting
                    ? "Submitting..."
                    : isEdit
                      ? "Update Application"
                      : "Apply Now"}
                </button>
              )}
            </div>

            {!isQualified && (
              <div className="mt-4 brutal-card bg-[rgba(255,107,107,0.1)] border-4 border-[var(--coral)] p-4">
                <p className="font-mono text-sm text-[var(--fg-muted)]">
                  Your match percentage is below 50%. You cannot apply for this
                  position. Consider improving your skills or experience in
                  areas marked above.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (jobLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--fg)]">
        <div className="p-8">
          <DashboardNav role="employee" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader className="animate-spin mb-4 mx-auto" size={32} />
            <p className="font-mono text-sm text-[var(--fg-muted)]">
              Loading job details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Job not found
  if (!job) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--fg)]">
        <div className="p-8">
          <DashboardNav role="employee" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="font-mono text-sm text-[var(--fg-muted)] mb-4">
              Job not found
            </p>
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

  // Upload Screen
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--fg)]">
      <div className="p-8">
        <DashboardNav role="employee" />
      </div>

      <div className="flex-1 overflow-y-auto px-8 pb-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
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

          <div className="space-y-8">
            {/* Application Method Selection - Three Large Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Option 1: Existing CV */}
              <button
                onClick={() => {
                  handleSwitchMethod("existingCv");
                  setSelectedCvId("");
                }}
                className={`brutal-card p-8 flex flex-col items-center justify-center min-h-[280px] transition-all border-4 ${
                  applicationMethod === "existingCv"
                    ? "border-black scale-105"
                    : "border-[var(--border-color)] hover:border-black"
                }`}
                style={{
                  background:
                    applicationMethod === "existingCv"
                      ? "var(--yellow)"
                      : "var(--card-bg)",
                }}
              >
                <div className="text-6xl mb-4">📄</div>
                <h3
                  className={`font-['Space_Grotesk'] font-bold text-lg uppercase tracking-wider mb-2 ${
                    applicationMethod === "existingCv"
                      ? "text-black"
                      : "text-[var(--fg)]"
                  }`}
                >
                  Use Existing CV
                </h3>
                <p
                  className={`font-mono text-sm text-center ${
                    applicationMethod === "existingCv"
                      ? "text-black"
                      : "text-[var(--fg-muted)]"
                  }`}
                >
                  Select from your saved CVs
                </p>
              </button>

              {/* Option 2: Upload PDF */}
              <button
                onClick={() => {
                  handleSwitchMethod("uploadPdf");
                }}
                className={`brutal-card p-8 flex flex-col items-center justify-center min-h-[280px] transition-all border-4 ${
                  applicationMethod === "uploadPdf"
                    ? "border-black scale-105"
                    : "border-[var(--border-color)] hover:border-black"
                }`}
                style={{
                  background:
                    applicationMethod === "uploadPdf"
                      ? "var(--teal)"
                      : "var(--card-bg)",
                }}
              >
                <div className="text-6xl mb-4">📤</div>
                <h3
                  className={`font-['Space_Grotesk'] font-bold text-lg uppercase tracking-wider mb-2 ${
                    applicationMethod === "uploadPdf"
                      ? "text-black"
                      : "text-[var(--fg)]"
                  }`}
                >
                  Upload PDF
                </h3>
                <p
                  className={`font-mono text-sm text-center ${
                    applicationMethod === "uploadPdf"
                      ? "text-black"
                      : "text-[var(--fg-muted)]"
                  }`}
                >
                  Upload a PDF resume
                </p>
              </button>

              {/* Option 3: Fill Manually */}
              <button
                onClick={() => {
                  handleSwitchMethod("manual");
                }}
                className={`brutal-card p-8 flex flex-col items-center justify-center min-h-[280px] transition-all border-4 ${
                  applicationMethod === "manual"
                    ? "border-black scale-105"
                    : "border-[var(--border-color)] hover:border-black"
                }`}
                style={{
                  background:
                    applicationMethod === "manual"
                      ? "var(--mint)"
                      : "var(--card-bg)",
                }}
              >
                <div className="text-6xl mb-4">✏️</div>
                <h3
                  className={`font-['Space_Grotesk'] font-bold text-lg uppercase tracking-wider mb-2 ${
                    applicationMethod === "manual"
                      ? "text-black"
                      : "text-[var(--fg)]"
                  }`}
                >
                  Fill Manually
                </h3>
                <p
                  className={`font-mono text-sm text-center ${
                    applicationMethod === "manual"
                      ? "text-black"
                      : "text-[var(--fg-muted)]"
                  }`}
                >
                  Enter your details
                </p>
              </button>
            </div>

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

            {/* Option 1: Existing CV */}
            {applicationMethod === "existingCv" && (
              <div className="brutal-card bg-[var(--card-bg)] p-6">
                <h2 className="font-['Space_Grotesk'] font-bold text-sm uppercase tracking-wider mb-4">
                  Select Your CV
                </h2>
                {cvs.length > 0 ? (
                  <select
                    value={selectedCvId}
                    onChange={(e) => {
                      setSelectedCvId(e.target.value);
                      setMatchAnalysis(null);
                    }}
                    className="w-full border-2 border-[var(--border-color)] bg-[var(--bg)] text-[var(--fg)] px-3 py-2 font-mono text-sm outline-none focus:border-[var(--yellow)]"
                  >
                    <option value="">Select a CV...</option>
                    {cvs.map((cv) => (
                      <option key={cv._id} value={cv._id}>
                        {cv.jobTitle} (
                        {new Date(cv.updatedAt).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="font-mono text-sm text-[var(--coral)]">
                    No CVs available. Create one first.
                  </p>
                )}
              </div>
            )}

            {/* Option 2: Upload PDF */}
            {applicationMethod === "uploadPdf" && (
              <div className="brutal-card bg-[var(--card-bg)] p-6">
                <h2 className="font-['Space_Grotesk'] font-bold text-sm uppercase tracking-wider mb-4">
                  Upload Your CV (PDF)
                </h2>
                <div
                  className="border-2 border-dashed border-[var(--border-color)] p-8 text-center cursor-pointer hover:border-[var(--yellow)] transition-colors"
                  onClick={() => document.getElementById("cvFile")?.click()}
                >
                  <Upload
                    size={32}
                    className="mx-auto mb-3 text-[var(--fg-muted)]"
                  />
                  <p className="font-mono text-sm font-bold mb-1">
                    {cvFile ? cvFile.name : "Click to upload or drag and drop"}
                  </p>
                  <p className="font-mono text-xs text-[var(--fg-muted)]">
                    PDF only, max 5MB
                  </p>
                </div>
                <input
                  id="cvFile"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            )}

            {/* Info Box - shown for CV methods */}
            {(applicationMethod === "existingCv" ||
              applicationMethod === "uploadPdf") && (
              <div className="brutal-card bg-[rgba(78, 205, 196, 0.1)] border-4 border-[var(--teal)] p-6">
                <p className="font-mono text-sm text-[var(--fg-muted)]">
                  Our AI will analyze your CV and compare it with the job
                  requirements. You'll see your match score, strengths, and
                  areas to improve before applying.
                </p>
              </div>
            )}

            {/* Analyze Button - shown for CV methods */}
            {(applicationMethod === "existingCv" ||
              applicationMethod === "uploadPdf") && (
              <button
                onClick={handleAnalyzeCv}
                disabled={
                  analyzing ||
                  (applicationMethod === "existingCv" && !selectedCvId) ||
                  (applicationMethod === "uploadPdf" && !cvFile)
                }
                className="w-full brutal-btn px-6 py-4 font-bold uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
                style={{
                  background:
                    analyzing ||
                    (applicationMethod === "existingCv" && !selectedCvId) ||
                    (applicationMethod === "uploadPdf" && !cvFile)
                      ? "--fg-muted"
                      : "var(--yellow)",
                  color: "#0a0a0a",
                }}
              >
                {analyzing && <Loader size={16} className="animate-spin" />}
                {analyzing ? "Analyzing..." : "Analyze & Preview Match"}
              </button>
            )}

            {/* Option 3: Manual Entry Form */}
            {applicationMethod === "manual" && (
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
                          setManualFormData({
                            ...manualFormData,
                            email: e.target.value,
                          })
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
                          setManualFormData({
                            ...manualFormData,
                            phone: e.target.value,
                          })
                        }
                        className="w-full border-2 border-[var(--border-color)] bg-[var(--bg)] text-[var(--fg)] px-3 py-2 font-mono text-sm outline-none focus:border-[var(--yellow)]"
                        placeholder="+1234567890"
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
                        setManualFormData({
                          ...manualFormData,
                          summary: e.target.value,
                        })
                      }
                      className="w-full border-2 border-[var(--border-color)] bg-[var(--bg)] text-[var(--fg)] px-3 py-2 font-mono text-sm outline-none focus:border-[var(--yellow)] resize-y min-h-20"
                      placeholder="Brief summary of your background and experience..."
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
                  {submitting
                    ? "Submitting..."
                    : isEdit
                      ? "Update Application"
                      : "Submit Application"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
