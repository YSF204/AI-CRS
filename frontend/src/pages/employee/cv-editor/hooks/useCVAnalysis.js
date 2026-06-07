import { useState, useMemo, useRef, useCallback } from "react";
import api from "../../../../services/api";

export default function useCVAnalysis({
  id,
  form,
  setForm,
  filteredFormData,
  userName,
  showToast,
}) {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [showSkillGap, setShowSkillGap] = useState(false);
  const progressTimerRef = useRef(null);
  const filteredFormDataRef = useRef(filteredFormData);

  filteredFormDataRef.current = filteredFormData;

  /// simulates a progressive loading bar since the AI model might take some time to respond
  const startProgressSimulation = useCallback(() => {
    setAnalysisProgress(0);
    let progress = 0;
    clearInterval(progressTimerRef.current);
    progressTimerRef.current = setInterval(() => {
      progress += Math.random() * 8 + 2;
      if (progress >= 92) {
        progress = 92;
        clearInterval(progressTimerRef.current);
      }
      setAnalysisProgress(Math.round(progress));
    }, 400);
  }, []);

  /// finishes the progress bar by bumping it to 100% when the API call completes
  const finishProgress = useCallback(() => {
    clearInterval(progressTimerRef.current);
    setAnalysisProgress(100);
    setTimeout(() => setAnalysisProgress(0), 600);
  }, []);

  const buildCvPayload = useCallback(() => {
    const filtered = filteredFormDataRef.current();
    return {
      fullName: filtered.fullName || userName || "",
      jobTitle: filtered.jobTitle || "",
      summary: filtered.summary || "",
      contact: {
        phone: filtered.contact?.phone || "",
        email: filtered.contact?.email || "",
        linkedin: filtered.contact?.linkedin || "",
        github: filtered.contact?.github || "",
      },
      address: {
        city: filtered.address?.city || "",
        street: filtered.address?.street || "",
      },
      experience: (filtered.experience || []).map((exp) => ({
        position: exp.position || "",
        institutionName: exp.institutionName || "",
        durationFrom: exp.durationFrom || "",
        durationTo: exp.durationTo || "",
        summary: exp.summary || "",
      })),
      education: (filtered.education || []).map((edu) => ({
        institutionName: edu.institutionName || "",
        certification: edu.certification || "",
        durationFrom: edu.durationFrom || "",
        durationTo: edu.durationTo || "",
        summary: edu.summary || "",
      })),
      technicalSkills: filtered.technicalSkills || [],
      softSkills: filtered.softSkills || [],
      language: filtered.language || [],
      customSections: (filtered.customSections || []).map((sec) => ({
        title: sec.title || "",
        sectionType: sec.sectionType || "other",
        items: (sec.items || []).map((it) => ({
          name: it.name || "",
          description: it.description || "",
        })),
      })),
      cvId: id && id !== "new" ? id : undefined,
    };
  }, [userName, id]);

  const handleAnalyze = useCallback(async () => {
    setAnalyzing(true);
    startProgressSimulation();

    try {
      const cvPayload = buildCvPayload();

      const response = await api.post("/cvs/analyze-section", {
        section: "fullCv",
        data: cvPayload,
        fullName: userName,
      });

      if (response.data?.success && response.data?.data) {
        const analysisData = response.data.data;

        const mergedResult = {
          ...analysisData,
          atsScore: analysisData.overallScore ?? null,
          atsBreakdown: analysisData.atsBreakdown || null,
        };

        setAnalysisResult(mergedResult);
        finishProgress();
        setShowAnalysis(true);
      } else {
        finishProgress();
        showToast("error", "toast.unable_to_generate_analysis");
      }
    } catch (err) {
      finishProgress();
      showToast(
        "error",
        err?.response?.data?.message || "toast.unable_to_generate_analysis",
      );
    } finally {
      setAnalyzing(false);
    }
  }, [buildCvPayload, userName, startProgressSimulation, finishProgress, showToast]);

  const handleSkillGapAnalysis = async ({ targetRole, additionalInfo }) => {
    const filtered = filteredFormDataRef.current();
    const res = await api.post("/cvs/skill-gap", {
      cvData: {
        fullName: filtered.fullName || "",
        jobTitle: filtered.jobTitle || "",
        summary: filtered.summary || "",
        technicalSkills: filtered.technicalSkills || [],
        softSkills: filtered.softSkills || [],
        language: filtered.language || [],
        experience: filtered.experience || [],
        education: filtered.education || [],
        customSections: filtered.customSections || [],
      },
      targetRole,
      additionalInfo,
    });
    return res.data?.data;
  };

  const handleAnalyzeSection = useCallback(async (sectionKey) => {
    setAnalyzing(true);
    startProgressSimulation();
    try {
      const filtered = filteredFormDataRef.current();
      const flat = {};

      if (sectionKey === "summary" && filtered.summary !== undefined)
        flat.summary = filtered.summary || "";
      if (sectionKey === "experience") {
        filtered.experience?.forEach((exp, i) => {
          flat[`experience_${i}_summary`] = exp.summary || "";
        });
      }
      if (sectionKey === "education") {
        filtered.education?.forEach((edu, i) => {
          flat[`education_${i}_summary`] = edu.summary || "";
        });
      }
      if (sectionKey === "customSections") {
        filtered.customSections?.forEach((sec, sIdx) => {
          sec.items?.forEach((item, iIdx) => {
            flat[`customSections_${sIdx}_items_${iIdx}_description`] =
              item.description || "";
          });
        });
      }

      const response = await api.post("/cvs/analyze-section", {
        section: sectionKey,
        data: flat,
        fullName: userName,
      });

      if (response.data?.success && response.data?.data) {
        const result = response.data.data;
        setAnalysisResult(result);
        finishProgress();
        setShowAnalysis(true);
      } else {
        finishProgress();
        showToast("error", "toast.unable_to_generate_analysis");
      }
    } catch (err) {
      finishProgress();
      showToast(
        "error",
        err?.response?.data?.message || "toast.unable_to_generate_analysis",
      );
    } finally {
      setAnalyzing(false);
    }
  }, [userName, startProgressSimulation, finishProgress, showToast]);

  /// parses through the AI analysis suggestions and applies selected changes or deletions to our CV form state
  const handleApplyAnalysis = useCallback((updatesToApply) => {
    if (!updatesToApply || Object.keys(updatesToApply).length === 0) {
      showToast("info", "toast.no_changes_selected");
      setShowAnalysis(false);
      return null;
    }

    let appliedForm = null;

    setForm((prev) => {
      const next = { ...prev };

      next.experience = next.experience ? [...next.experience] : [];
      next.education = next.education ? [...next.education] : [];
      next.customSections = next.customSections ? [...next.customSections] : [];
      next.technicalSkills = next.technicalSkills ? [...next.technicalSkills] : [];
      next.softSkills = next.softSkills ? [...next.softSkills] : [];
      next.language = next.language ? [...next.language] : [];

      const indicesToDelete = { experience: new Set(), education: new Set(), customSectionItems: new Map() };

      Object.entries(updatesToApply).forEach(([key, value]) => {
        const isDelete = value === "__DELETE__" || value === "";

        if (key === "summary") {
          next.summary = isDelete ? "" : value;
        } else if (key === "jobTitle") {
          next.jobTitle = isDelete ? "" : value;
        } else if (key.startsWith("experience_")) {
          const parts = key.split("_");
          const idx = parseInt(parts[1], 10);
          if (parts.length === 2 && isDelete) {
            indicesToDelete.experience.add(idx);
          } else if (next.experience[idx]) {
            next.experience[idx] = {
              ...next.experience[idx],
              [parts[2]]: isDelete ? "" : value,
            };
          }
        } else if (key.startsWith("education_")) {
          const parts = key.split("_");
          const idx = parseInt(parts[1], 10);
          if (parts.length === 2 && isDelete) {
            indicesToDelete.education.add(idx);
          } else if (next.education[idx]) {
            next.education[idx] = { ...next.education[idx], [parts[2]]: isDelete ? "" : value };
          }
        } else if (key.startsWith("customSections_")) {
          const parts = key.split("_");
          const sIdx = parseInt(parts[1], 10);
          const iIdx = parseInt(parts[3], 10);
          if (
            next.customSections[sIdx] &&
            next.customSections[sIdx].items &&
            next.customSections[sIdx].items[iIdx]
          ) {
            next.customSections[sIdx] = { ...next.customSections[sIdx] };
            next.customSections[sIdx].items = [
              ...next.customSections[sIdx].items,
            ];
            if (isDelete && parts[4] === undefined) {
              if (!indicesToDelete.customSectionItems.has(sIdx)) {
                indicesToDelete.customSectionItems.set(sIdx, new Set());
              }
              indicesToDelete.customSectionItems.get(sIdx).add(iIdx);
            } else {
              next.customSections[sIdx].items[iIdx] = {
                ...next.customSections[sIdx].items[iIdx],
                description: isDelete ? "" : value,
              };
            }
          }
        } else if (key.startsWith("technicalSkills_") && isDelete) {
          const idx = parseInt(key.split("_")[1], 10);
          next.technicalSkills = next.technicalSkills.filter((_, i) => i !== idx);
        } else if (key.startsWith("softSkills_") && isDelete) {
          const idx = parseInt(key.split("_")[1], 10);
          next.softSkills = next.softSkills.filter((_, i) => i !== idx);
        } else if (key.startsWith("language_") && isDelete) {
          const idx = parseInt(key.split("_")[1], 10);
          next.language = next.language.filter((_, i) => i !== idx);
        }
      });

      if (indicesToDelete.experience.size > 0) {
        next.experience = next.experience.filter((_, i) => !indicesToDelete.experience.has(i));
      }
      if (indicesToDelete.education.size > 0) {
        next.education = next.education.filter((_, i) => !indicesToDelete.education.has(i));
      }
      if (indicesToDelete.customSectionItems.size > 0) {
        indicesToDelete.customSectionItems.forEach((itemIndices, sIdx) => {
          if (next.customSections[sIdx]) {
            next.customSections[sIdx].items = next.customSections[sIdx].items.filter(
              (_, i) => !itemIndices.has(i),
            );
          }
        });
      }

      appliedForm = next;
      return next;
    });

    setShowAnalysis(false);
    setAnalysisResult(null);
    return appliedForm;
  }, [setForm, showToast]);

  const highlights = useMemo(() => {
    if (!analysisResult?.issues) return {};
    const h = {};
    analysisResult.issues.forEach((issue) => {
      const fieldId = typeof issue?.fieldId === "string" ? issue.fieldId.trim() : null;
      if (!fieldId) return;
      if (issue.improvedText) {
        h[fieldId] = "suggestion";
      } else {
        h[fieldId] = "warning";
      }
    });
    return h;
  }, [analysisResult]);

  return {
    showAnalysis,
    setShowAnalysis,
    analysisResult,
    highlights,
    analyzing,
    analysisProgress,
    showSkillGap,
    setShowSkillGap,
    handleAnalyze,
    handleAnalyzeSection,
    handleApplyAnalysis,
    handleSkillGapAnalysis,
  };
}
