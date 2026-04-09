import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../../../../services/api";
import useFetch from "../../../../hooks/useFetch";

export function useApplyJob(propsJobId, propsAppId, onCloseFn) {
  const jobId = propsJobId;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const appId = propsAppId || searchParams.get("appId");
  const editMethod = searchParams.get("method");
  const forceFresh = searchParams.get("fresh") === "true";
  const isEdit = !!appId;

  const [step, setStep] = useState("upload"); // upload, analyzing, analysis, result
  const [cvFile, setCvFile] = useState(null);
  const [selectedCvId, setSelectedCvId] = useState("");
  const [cvs, setCvs] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [matchAnalysis, setMatchAnalysis] = useState(null);
  const [applicationMethod, setApplicationMethod] = useState(null); // null, existingCv, uploadPdf, manual
  const [validationErrors, setValidationErrors] = useState({});
  const [loadedApplication, setLoadedApplication] = useState(null);
  const [manualFormData, setManualFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    linkedin: "",
    portfolioUrl: "",
    yearsOfExperience: "",
    technicalSkills: [],
    softSkills: [],
    languages: [],
    summary: "",
    additionalInformation: "",
    certifications: [],
    education: [],
    certificationInput: "",
    educationDraft: {
      institutionName: "",
      certification: "",
      durationFrom: "",
      durationTo: "",
      summary: "",
    },
  });

  const [technicalSkillInput, setTechnicalSkillInput] = useState("");
  const [softSkillInput, setSoftSkillInput] = useState("");
  const [languageInput, setLanguageInput] = useState("");
  const [toastNotice, setToastNotice] = useState(null);
  const toastTimerRef = useRef(null);

  const showToastNotice = (message) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastNotice({ id: Date.now(), message });
    toastTimerRef.current = setTimeout(() => {
      setToastNotice(null);
    }, 2400);
  };

  const isAlreadyAppliedError = (error) => {
    const status = error?.response?.status;
    const message = String(error?.response?.data?.message || "").toLowerCase();
    return (
      (status === 409 && error?.response?.data?.data?.alreadyApplied) ||
      message.includes("already applied")
    );
  };

  const handleAlreadyApplied = () => {
    setValidationErrors({});
    showToastNotice("You already applied for this job. You can't apply again.");
    if (matchAnalysis) {
      setStep("analysis");
    }
  };
  const isAlreadyAppliedPayload = (response) =>
    response?.data?.data?.alreadyApplied === true;

  const { data: job, loading: jobLoading } = useFetch(async () => {
    if (!jobId) return null;
    const res = await api.get(`/jobs/${jobId}`);
    return res.data?.data?.job;
  });

  useEffect(() => {
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
    const loadApplication = async () => {
      if (!isEdit || !appId) return;
      try {
        const res = await api.get(`/applications/${appId}`);
        const application = res.data?.data?.application;
        if (application) {
          setLoadedApplication(application);
          const requestedMethod = editMethod || (forceFresh ? null : application.applicationMethod);

          if (requestedMethod === "existingCv") {
            setApplicationMethod("existingCv");
            setSelectedCvId(application.cvId?._id || "");
          } else if (requestedMethod === "uploadPdf") {
            setApplicationMethod("uploadPdf");
          } else if (requestedMethod === "manual") {
            setApplicationMethod("manual");
          } else if (!forceFresh) {
            if (application.applicationMethod === "uploadPdf") {
              setApplicationMethod("uploadPdf");
            } else if (application.cvId) {
              setApplicationMethod("existingCv");
              setSelectedCvId(application.cvId._id || "");
            } else {
              setApplicationMethod("manual");
            }
          }

          setManualFormData({
            firstName: application.applicantInfo?.fullName?.split(" ")[0] || "",
            lastName: application.applicantInfo?.fullName?.split(" ").slice(1).join(" ") || "",
            email: application.applicantInfo?.email || "",
            phone: application.applicantInfo?.phone || "",
            linkedin: application.applicantInfo?.linkedin || "",
            portfolioUrl: application.applicantInfo?.portfolioUrl || "",
            yearsOfExperience: application.applicantInfo?.yearsOfExperience || "",
            technicalSkills: application.applicantInfo?.technicalSkills || [],
            softSkills: application.applicantInfo?.softSkills || [],
            languages: application.applicantInfo?.languages || [],
            summary: application.applicantInfo?.summary || "",
            additionalInformation: application.applicantInfo?.additionalInformation || "",
            certifications: application.applicantInfo?.certifications || [],
            education: application.applicantInfo?.education || [],
            certificationInput: "",
            educationDraft: {
              institutionName: "",
              certification: "",
              durationFrom: "",
              durationTo: "",
              summary: "",
            },
          });
          
          if (application.matchDetails) {
            setMatchAnalysis(application.matchDetails);
          }
        }
      } catch (error) {
        console.error("Failed to load application:", error);
      }
    };
    loadApplication();
  }, [isEdit, appId, editMethod, forceFresh]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setCvFile(file);
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
    if (isEdit) return; // lock method during edit
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
    
    setMatchAnalysis(null);
    setValidationErrors({});
    setAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append("jobId", jobId);

      if (applicationMethod === "uploadPdf" && cvFile) {
        // Send the PDF directly to the analyze endpoint — no intermediate CV creation.
        // This is a single AI call instead of two, cutting latency significantly.
        // The method stays as "uploadPdf" — we do NOT switch to "existingCv".
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

  const handleApplyDirectly = async () => {
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

    setValidationErrors({});
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("jobId", jobId);
      formData.append("skipAnalysis", "true");

      if (applicationMethod === "uploadPdf" && cvFile) {
        formData.append("cvFile", cvFile);
      } else if (applicationMethod === "existingCv" && selectedCvId) {
        formData.append("cvId", selectedCvId);
      }

      const response = isEdit 
        ? await api.patch(`/applications/${appId}`, formData, { headers: { "Content-Type": "multipart/form-data" } })
        : await api.post("/applications", formData, { headers: { "Content-Type": "multipart/form-data" } });
      if (isAlreadyAppliedPayload(response)) {
        handleAlreadyApplied();
        return;
      }

      // Show a small fade-away toast instead of the full result screen
      const msg = isEdit ? "✅ Application updated!" : "✅ Application submitted successfully!";
      showToastNotice(msg);
      setTimeout(() => {
        if (onCloseFn) onCloseFn();
        else navigate("/employee/applications");
      }, 2000);
    } catch (error) {
      if (isAlreadyAppliedError(error)) {
        handleAlreadyApplied();
        return;
      }
      setValidationErrors({
        cvAnalysis: error.response?.data?.message || "Failed to submit application",
      });
      alert(error.response?.data?.message || "Application submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitApplication = async () => {
    if (!matchAnalysis) return;

    setSubmitting(true);
    try {
      let response;

      if (applicationMethod === "uploadPdf" && cvFile) {
        // PDF upload path: send the file directly — cvId is a temp ID and cannot be looked up in DB
        const formData = new FormData();
        formData.append("jobId", jobId);
        formData.append("cvFile", cvFile);
        response = isEdit
          ? await api.patch(`/applications/${appId}`, formData, { headers: { "Content-Type": "multipart/form-data" } })
          : await api.post("/applications", formData, { headers: { "Content-Type": "multipart/form-data" } });
      } else {
        // Existing CV path: send cvId as JSON
        const payload = { jobId, cvId: matchAnalysis.cvId };
        response = isEdit
          ? await api.patch(`/applications/${appId}`, payload)
          : await api.post("/applications", payload);
      }

      if (isAlreadyAppliedPayload(response)) {
        handleAlreadyApplied();
        return;
      }

      const msg = isEdit ? "✅ Application updated!" : "✅ Application submitted successfully!";
      showToastNotice(msg);
      setTimeout(() => {
        if (onCloseFn) onCloseFn();
        else navigate("/employee/applications");
      }, 2000);
    } catch (error) {
      if (isAlreadyAppliedError(error)) {
        handleAlreadyApplied();
      } else {
        alert(error.response?.data?.message || "Application submission failed");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitManualApplication = async () => {
    const errors = {};
    if (!manualFormData.firstName?.trim()) errors.firstName = "First name is required";
    if (!manualFormData.lastName?.trim()) errors.lastName = "Last name is required";
    if (!manualFormData.email?.trim()) errors.email = "Email is required";
    if (manualFormData.technicalSkills.length === 0) errors.technicalSkills = "Add at least one technical skill";

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
        ...manualFormData,
        yearsOfExperience: parseInt(manualFormData.yearsOfExperience) || 0,
        // Skip AI re-analysis on update - only recalculate lightweight local score
        skipAnalysis: isEdit,
      };

      const response = isEdit
        ? await api.patch(`/applications/${appId}`, payload)
        : await api.post("/applications", payload);
      if (isAlreadyAppliedPayload(response)) {
        handleAlreadyApplied();
        return;
      }

      const msg = isEdit ? "✅ Application updated!" : "✅ Application submitted successfully!";
      showToastNotice(msg);
      setTimeout(() => {
        if (onCloseFn) onCloseFn();
        else navigate("/employee/applications");
      }, 2000);
    } catch (error) {
      if (isAlreadyAppliedError(error)) {
        handleAlreadyApplied();
      } else {
        alert(error.response?.data?.message || "Application submission failed");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitManualDirectly = async () => {
    const errors = {};
    if (!manualFormData.firstName?.trim()) errors.firstName = "First name is required";
    if (!manualFormData.lastName?.trim()) errors.lastName = "Last name is required";
    if (!manualFormData.email?.trim()) errors.email = "Email is required";

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
        ...manualFormData,
        yearsOfExperience: parseInt(manualFormData.yearsOfExperience) || 0,
        skipAnalysis: true,
      };
      
      const response = isEdit
        ? await api.patch(`/applications/${appId}`, payload)
        : await api.post("/applications", payload);
      if (isAlreadyAppliedPayload(response)) {
        handleAlreadyApplied();
        return;
      }

      const msg = isEdit ? "✅ Application updated!" : "✅ Application submitted successfully!";
      showToastNotice(msg);
      setTimeout(() => {
        if (onCloseFn) onCloseFn();
        else navigate("/employee/applications");
      }, 2000);
    } catch (error) {
      if (isAlreadyAppliedError(error)) {
        handleAlreadyApplied();
        return;
      }
      alert(error.response?.data?.message || "Application submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  // Skill management helpers
  const handleAddSkill = (type) => {
    if (type === "technical" && technicalSkillInput.trim()) {
      setManualFormData({ ...manualFormData, technicalSkills: [...manualFormData.technicalSkills, technicalSkillInput.trim()] });
      setTechnicalSkillInput("");
    } else if (type === "soft" && softSkillInput.trim()) {
      setManualFormData({ ...manualFormData, softSkills: [...manualFormData.softSkills, softSkillInput.trim()] });
      setSoftSkillInput("");
    }
  };

  const handleRemoveSkill = (type, index) => {
    if (type === "technical") {
      setManualFormData({ ...manualFormData, technicalSkills: manualFormData.technicalSkills.filter((_, i) => i !== index) });
    } else if (type === "soft") {
      setManualFormData({ ...manualFormData, softSkills: manualFormData.softSkills.filter((_, i) => i !== index) });
    }
  };

  const handleAddLanguage = () => {
    if (languageInput.trim()) {
      setManualFormData({ ...manualFormData, languages: [...manualFormData.languages, languageInput.trim()] });
      setLanguageInput("");
    }
  };

  const handleRemoveLanguage = (index) => {
    setManualFormData({ ...manualFormData, languages: manualFormData.languages.filter((_, i) => i !== index) });
  };

  const handleAddCertification = () => {
    const value = manualFormData.certificationInput.trim();
    if (!value) return;
    setManualFormData({
      ...manualFormData,
      certifications: [...manualFormData.certifications, value],
      certificationInput: "",
    });
  };

  const handleRemoveCertification = (index) => {
    setManualFormData({
      ...manualFormData,
      certifications: manualFormData.certifications.filter((_, i) => i !== index),
    });
  };

  const handleEducationDraftChange = (key, value) => {
    setManualFormData({
      ...manualFormData,
      educationDraft: {
        ...manualFormData.educationDraft,
        [key]: value,
      },
    });
  };

  const handleAddEducation = () => {
    const draft = manualFormData.educationDraft || {};
    if (!draft.institutionName?.trim() || !draft.certification?.trim()) return;
    setManualFormData({
      ...manualFormData,
      education: [
        ...manualFormData.education,
        {
          institutionName: draft.institutionName.trim(),
          certification: draft.certification.trim(),
          durationFrom: (draft.durationFrom || "").trim(),
          durationTo: (draft.durationTo || "").trim(),
          summary: (draft.summary || "").trim(),
        },
      ],
      educationDraft: {
        institutionName: "",
        certification: "",
        durationFrom: "",
        durationTo: "",
        summary: "",
      },
    });
  };

  const handleRemoveEducation = (index) => {
    setManualFormData({
      ...manualFormData,
      education: manualFormData.education.filter((_, i) => i !== index),
    });
  };

  return {
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
    loadedApplication,
    setLoadedApplication,
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
    isEdit
  };
}
