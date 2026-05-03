import { useState, useMemo } from "react";
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
  const [showSkillGap, setShowSkillGap] = useState(false);
  const [staleAnalysis, setStaleAnalysis] = useState(false);

  const buildCvPayload = () => {
    const filtered = filteredFormData();
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
  };

  const handleAnalyze = async () => {
    const cached = sessionStorage.getItem(`cv_analysis_${id}`);
    if (cached) {
      const parsed = JSON.parse(cached);
      const cvModified = form.updatedAt || form.createdAt;
      const isStale = cvModified && parsed.cvUpdatedAt && new Date(cvModified) > new Date(parsed.cvUpdatedAt);
      setStaleAnalysis(isStale);
      setAnalysisResult(parsed);
      setShowAnalysis(true);
      return;
    }

    setStaleAnalysis(false);

    setAnalyzing(true);
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
          cvUpdatedAt: analysisData.cvUpdatedAt || new Date().toISOString(),
          atsBreakdown: analysisData.atsBreakdown || null,
        };

        setAnalysisResult(mergedResult);
        sessionStorage.setItem(`cv_analysis_${id}`, JSON.stringify(mergedResult));
        setStaleAnalysis(false);
        setShowAnalysis(true);
      } else {
        showToast("error", "Unable to generate analysis. Please try again.");
      }
    } catch (err) {
      showToast(
        "error",
        err?.response?.data?.message || err?.message || "Analysis failed.",
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSkillGapAnalysis = async ({ targetRole, additionalInfo }) => {
    const filtered = filteredFormData();
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

  const handleAnalyzeSection = async (sectionKey) => {
    setAnalyzing(true);
    try {
      const filtered = filteredFormData();
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
        setShowAnalysis(true);
      } else {
        showToast("error", "Unable to generate analysis. Please try again.");
      }
    } catch (err) {
      showToast(
        "error",
        err?.response?.data?.message || err?.message || "Analysis failed.",
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const handleApplyAnalysis = (updatesToApply) => {
    if (!updatesToApply || Object.keys(updatesToApply).length === 0) {
      showToast("info", "No changes were selected.");
      setShowAnalysis(false);
      return;
    }

    setForm((prev) => {
      const next = { ...prev };

      next.experience = next.experience ? [...next.experience] : [];
      next.education = next.education ? [...next.education] : [];
      next.customSections = next.customSections ? [...next.customSections] : [];

      Object.entries(updatesToApply).forEach(([key, value]) => {
        if (key === "summary") next.summary = value;
        else if (key === "jobTitle") next.jobTitle = value;
        else if (key.startsWith("experience_")) {
          const parts = key.split("_");
          const idx = parseInt(parts[1], 10);
          if (next.experience[idx]) {
            next.experience[idx] = {
              ...next.experience[idx],
              [parts[2]]: value,
            };
          }
        } else if (key.startsWith("education_")) {
          const parts = key.split("_");
          const idx = parseInt(parts[1], 10);
          if (next.education[idx]) {
            next.education[idx] = { ...next.education[idx], [parts[2]]: value };
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
            next.customSections[sIdx].items[iIdx] = {
              ...next.customSections[sIdx].items[iIdx],
              description: value,
            };
          }
        }
      });

      return next;
    });

    showToast("success", "Selected changes applied to your CV.");
    setShowAnalysis(false);
    sessionStorage.removeItem(`cv_analysis_${id}`);
  };

  const highlights = useMemo(() => {
    if (!analysisResult?.issues) return {};
    const h = {};
    analysisResult.issues.forEach((issue) => {
      if (issue.improvedText) {
        h[issue.fieldId] = "suggestion";
      } else {
        h[issue.fieldId] = "warning";
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
    showSkillGap,
    setShowSkillGap,
    staleAnalysis,
    handleAnalyze,
    handleAnalyzeSection,
    handleApplyAnalysis,
    handleSkillGapAnalysis,
  };
}
