import { useState, useEffect, useRef, useMemo } from "react";
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

  const [step, setStep] = useState("upload"); // upload, result
  const [cvFile, setCvFile] = useState(null);
  const [selectedCvId, setSelectedCvId] = useState("");
  const [cvs, setCvs] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [matchAnalysis, setMatchAnalysis] = useState(null);
  const [applicationMethod, setApplicationMethod] = useState(null); // null, existingCv, uploadPdf
  const [validationErrors, setValidationErrors] = useState({});
  const [loadedApplication, setLoadedApplication] = useState(null);
  const [toastNotice, setToastNotice] = useState(null);
  const [duplicateCheckDone, setDuplicateCheckDone] = useState(false);
  const [hasDuplicateApplication, setHasDuplicateApplication] = useState(false);
  const toastTimerRef = useRef(null);

  // Track initial state to detect form changes (FIX #6)
  const [initialFormData, setInitialFormData] = useState(null);
  const [initialSelectedCvId, setInitialSelectedCvId] = useState("");
  const [initialApplicationMethod, setInitialApplicationMethod] =
    useState(null);

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

  const isAlreadyAppliedPayload = (response) =>
    response?.data?.data?.alreadyApplied === true;

  const { data: job, loading: jobLoading } = useFetch(async () => {
    if (!jobId) return null;
    const res = await api.get(`/jobs/${jobId}`);
    return res.data?.data?.job;
  });

  // FIX #6: Helper function to deep compare form data
  const deepEqual = (obj1, obj2) => {
    if (obj1 === obj2) return true;
    if (!obj1 || !obj2) return false;

    const keys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);
    for (const key of keys) {
      const val1 = obj1[key];
      const val2 = obj2[key];

      if (Array.isArray(val1) && Array.isArray(val2)) {
        if (val1.length !== val2.length) return false;
        if (!val1.every((v, i) => v === val2[i])) return false;
      } else if (
        typeof val1 === "object" &&
        typeof val2 === "object" &&
        val1 !== null &&
        val2 !== null
      ) {
        if (!deepEqual(val1, val2)) return false;
      } else if (val1 !== val2) {
        return false;
      }
    }
    return true;
  };

  // FIX #6: Compute whether form has changed (removed manual form logic per Bug 3)
  const formHasChanged = useMemo(() => {
    if (!isEdit || !initialFormData) return false;

    const cvChanged = selectedCvId !== initialSelectedCvId;
    const methodChanged = applicationMethod !== initialApplicationMethod;

    return cvChanged || methodChanged;
  }, [
    selectedCvId,
    applicationMethod,
    initialSelectedCvId,
    initialApplicationMethod,
    isEdit,
  ]);

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

  // FIX #4: Check for duplicate application on load
  useEffect(() => {
    const checkDuplicateApplication = async () => {
      if (!jobId || isEdit) {
        setDuplicateCheckDone(true);
        return;
      }

      try {
        const res = await api.get("/applications/my-applications");
        const userApplications = res.data?.data?.applications || [];
        const alreadyApplied = userApplications.some(
          (app) => app.jobId === jobId || app.jobId?._id === jobId,
        );

        if (alreadyApplied) {
          setHasDuplicateApplication(true);
        }
      } catch (error) {
        console.debug("Duplicate check failed (non-critical):", error.message);
      } finally {
        setDuplicateCheckDone(true);
      }
    };

    checkDuplicateApplication();
  }, [jobId, isEdit]);

  useEffect(() => {
    const loadApplication = async () => {
      if (!isEdit || !appId) return;
      try {
        const res = await api.get(`/applications/${appId}`);
        const application = res.data?.data?.application;
        if (application) {
          setLoadedApplication(application);
          const requestedMethod =
            editMethod || (forceFresh ? null : application.applicationMethod);

          if (requestedMethod === "existingCv") {
            setApplicationMethod("existingCv");
            setSelectedCvId(application.cvId?._id || "");
          } else if (requestedMethod === "uploadPdf") {
            setApplicationMethod("uploadPdf");
          } else if (!forceFresh) {
            if (application.applicationMethod === "uploadPdf") {
              setApplicationMethod("uploadPdf");
            } else if (application.cvId) {
              setApplicationMethod("existingCv");
              setSelectedCvId(application.cvId._id || "");
            }
          }

          // FIX #6: Capture initial state for form change detection (removed manual form)
          setInitialSelectedCvId(application.cvId?._id || "");
          setInitialApplicationMethod(application.applicationMethod || null);

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

  const handleSwitchMethod = (method) => {
    if (isEdit) return; // lock method during edit
    setApplicationMethod(method);
    setMatchAnalysis(null);
    setValidationErrors({});
    setCvFile(null);
  };

  const handleSubmitApplication = async () => {
    // FIX #5: Validate CV selection and submit immediately
    // AI analysis now runs silently in background
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
      let response;

      if (applicationMethod === "uploadPdf" && cvFile) {
        const formData = new FormData();
        formData.append("jobId", jobId);
        formData.append("cvFile", cvFile);
        response = isEdit
          ? await api.patch(`/applications/${appId}`, formData, {
              headers: { "Content-Type": "multipart/form-data" },
            })
          : await api.post("/applications", formData, {
              headers: { "Content-Type": "multipart/form-data" },
            });
      } else {
        const payload = { jobId, cvId: selectedCvId };
        response = isEdit
          ? await api.patch(`/applications/${appId}`, payload)
          : await api.post("/applications", payload);
      }

      if (response?.data?.data?.alreadyApplied === true) {
        // Should not happen due to upfront check
        return;
      }

      const msg = isEdit
        ? "✅ Application updated!"
        : "✅ Application submitted successfully!";
      showToastNotice(msg);
      setTimeout(() => {
        if (onCloseFn) onCloseFn();
        else navigate("/employee/applications");
      }, 2000);
    } catch (error) {
      const status = error?.response?.status;
      const message = String(
        error?.response?.data?.message || "",
      ).toLowerCase();
      if (
        (status === 409 && error?.response?.data?.data?.alreadyApplied) ||
        message.includes("already applied")
      ) {
        // Should not happen due to upfront check
        return;
      }
      setValidationErrors({
        cvAnalysis:
          error.response?.data?.message || "Failed to submit application",
      });
      alert(error.response?.data?.message || "Application submission failed");
    } finally {
      setSubmitting(false);
    }
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
    submitting,
    matchAnalysis,
    setMatchAnalysis,
    applicationMethod,
    validationErrors,
    toastNotice,
    handleSwitchMethod,
    handleFileUpload,
    handleSubmitApplication,
    loadedApplication,
    setLoadedApplication,
    isEdit,
    hasDuplicateApplication,
    duplicateCheckDone,
    formHasChanged,
  };
}

export default useApplyJob;
