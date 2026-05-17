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

  // FIX #6: Compute whether form has changed using JSON stringify for accurate diffing
  const formHasChanged = useMemo(() => {
    if (!isEdit || !initialFormData) return false;

    // If uploading a new PDF, the form has definitively changed
    if (applicationMethod === "uploadPdf" && cvFile) return true;

    const currentFormData = JSON.stringify({
      method: applicationMethod,
      cvId: applicationMethod === "existingCv" ? selectedCvId : null
    });

    return currentFormData !== initialFormData;
  }, [
    selectedCvId,
    applicationMethod,
    cvFile,
    initialFormData,
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

          const cvIdToSet = application.cvId?._id || "";
          const methodToSet =
            requestedMethod === "existingCv"
              ? "existingCv"
              : requestedMethod === "uploadPdf"
                ? "uploadPdf"
                : !forceFresh && application.applicationMethod
                  ? application.applicationMethod
                  : null;

          // FIX #4: Set initial and current state ATOMICALLY at the exact same time
          setInitialFormData(JSON.stringify({
            method: methodToSet,
            cvId: methodToSet === "existingCv" ? cvIdToSet : null
          }));
          setSelectedCvId(cvIdToSet);
          setApplicationMethod(methodToSet);

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
    // FIX #4: Allow switching method during update
    setApplicationMethod(method);
    setMatchAnalysis(null);
    setValidationErrors({});
    setCvFile(null);
  };

  const handleSubmitApplication = async () => {
    return submitApplication({ skipAnalysis: false });
  };

  const handleInstantSubmitApplication = async () => {
    return submitApplication({ skipAnalysis: true });
  };

  const submitApplication = async ({ skipAnalysis }) => {
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
        if (skipAnalysis) formData.append("skipAnalysis", "true");
        response = isEdit
          ? await api.patch(`/applications/${appId}`, formData, {
              headers: { "Content-Type": "multipart/form-data" },
            })
          : await api.post("/applications", formData, {
              headers: { "Content-Type": "multipart/form-data" },
            });
      } else {
        const payload = {
          jobId,
          cvId: selectedCvId,
          ...(skipAnalysis ? { skipAnalysis: true } : {}),
        };
        response = isEdit
          ? await api.patch(`/applications/${appId}`, payload)
          : await api.post("/applications", payload);
      }

      if (response?.data?.data?.alreadyApplied === true) {
        return;
      }

      const msg = isEdit
        ? "Application updated!"
        : skipAnalysis
          ? "Application submitted instantly!"
          : "Application submitted successfully!";
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
    handleInstantSubmitApplication,
    loadedApplication,
    setLoadedApplication,
    isEdit,
    hasDuplicateApplication,
    duplicateCheckDone,
    formHasChanged,
  };
}

export default useApplyJob;
