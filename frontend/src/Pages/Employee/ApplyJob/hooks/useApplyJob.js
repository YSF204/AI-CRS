import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import api from "../../../../services/api";
import useFetch from "../../../../hooks/useFetch";

export function useApplyJob() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const appId = searchParams.get("appId");
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

  const [technicalSkillInput, setTechnicalSkillInput] = useState("");
  const [softSkillInput, setSoftSkillInput] = useState("");
  const [languageInput, setLanguageInput] = useState("");

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
            yearsOfExperience: application.applicantInfo?.yearsOfExperience || "",
            technicalSkills: application.applicantInfo?.technicalSkills || [],
            softSkills: application.applicantInfo?.softSkills || [],
            languages: application.applicantInfo?.languages || [],
            summary: application.applicantInfo?.summary || "",
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
        // Transform the uploaded PDF into a permanent CV object to prevent ObjectId failures later
        const uploadForm = new FormData();
        uploadForm.append("cvFile", cvFile);
        
        const uploadRes = await api.post("/cvs/upload/analyze", uploadForm, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        
        const newCvId = uploadRes.data?.data?.cv?._id;
        if (!newCvId) throw new Error("Failed to parse and save uploaded PDF as CV");
        
        // Quietly switch context to 'existingCv'
        setSelectedCvId(newCvId);
        setApplicationMethod("existingCv");
        
        // Refresh CV list in background so it appears in the dropdown seamlessly
        api.get("/cvs").then(res => {
          if (res.data?.data?.cvs) {
            setCvs(res.data.data.cvs);
          }
        }).catch(err => console.error("Ignored cv reload err", err));

        formData.append("cvId", newCvId);
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
    if (!matchAnalysis || matchAnalysis.matchPercentage < 50) return;

    setSubmitting(true);
    try {
      const payload = { jobId, cvId: matchAnalysis.cvId };
      const response = isEdit
        ? await api.patch(`/applications/${appId}`, payload)
        : await api.post("/applications", payload);

      setStep("result");
      setMatchAnalysis({
        ...matchAnalysis,
        applicationSuccess: true,
        applicationMessage: isEdit ? "Application updated successfully" : response.data.message,
      });
    } catch (error) {
      if (error.response?.status === 409 && error.response?.data?.data?.alreadyApplied) {
        const { applicationId, status } = error.response.data.data;
        if (status !== 'pending') {
          alert("You have already applied and your application is currently under review or closed. Editing is disabled.");
        } else {
          if (window.confirm("You have already applied for this job. Would you like to edit your submission instead?")) {
            navigate(`/employee/apply-job/${jobId}?appId=${applicationId}&method=${applicationMethod}`);
          }
        }
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
      };
      
      const response = isEdit
        ? await api.patch(`/applications/${appId}`, payload)
        : await api.post("/applications", payload);

      setStep("result");
      setMatchAnalysis({
        matchPercentage:
          response.data.data?.application?.matchPercentage || response.data.data?.matchPercentage || 0,
        applicationSuccess: true,
        applicationMessage: isEdit ? "Application updated successfully" : response.data.message,
      });
    } catch (error) {
      if (error.response?.status === 409 && error.response?.data?.data?.alreadyApplied) {
        const { applicationId, status } = error.response.data.data;
        if (status !== 'pending') {
          alert("You have already applied and your application is currently under review or closed. Editing is disabled.");
        } else {
          if (window.confirm("You have already applied for this job. Would you like to edit your submission instead?")) {
            navigate(`/employee/apply-job/${jobId}?appId=${applicationId}&method=manual`);
          }
        }
      } else {
        alert(error.response?.data?.message || "Application submission failed");
      }
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
    isEdit
  };
}
