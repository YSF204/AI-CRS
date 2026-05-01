import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";
import api from "../../../../services/api";
import { DEFAULT_SECTION_ORDER } from "../constants";
import useCVForm from "./useCVForm";
import useCVAnalysis from "./useCVAnalysis";

export default function useCVEditor() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [cv, setCv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showExitPrompt, setShowExitPrompt] = useState(false);
  const [toast, setToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSections, setActiveSections] = useState(["summary"]);
  const [collapsedSections, setCollapsedSections] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [dragOverKey, setDragOverKey] = useState(null);
  const dragItemRef = useRef(null);
  const previewRef = useRef(null);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const {
    form,
    setForm,
    handlers,
    getFilteredFormData,
    handleImageUpload,
    removeProfileImage,
    isSaving,
    lastSavedAt,
    suggestions,
    isLoadingSuggestions,
    fetchSuggestions,
    fetchSingleSummarySuggestion,
    handleSuggestionSelect,
  } = useCVForm(
    showToast,
    id !== "new"
      ? async (formData) => {
          try {
            const visibleSections = {};
            activeSections.forEach((k) => {
              visibleSections[k] = true;
            });

            const payload = {
              ...formData,
              experience: formData.experience.map((e) => ({ ...e })),
              education: formData.education.map((e) => ({ ...e })),
              customSections: formData.customSections
                .filter(
                  (s) =>
                    s.title || s.items.some((it) => it.name || it.description),
                )
                .map((s) => ({
                  title: s.title,
                  sectionType: s.sectionType || "other",
                  items: s.items
                    .filter(
                      (it) =>
                        it.name ||
                        it.description ||
                        it.durationFrom ||
                        it.durationTo ||
                        it.link,
                    )
                    .map((it) => ({
                      name: it.name || "",
                      description: it.description,
                      durationFrom: it.durationFrom || "",
                      durationTo: it.durationTo || "",
                      link: it.link,
                    })),
                })),
              profileImage: formData.profileImage,
              templateId: cv?.templateId || 1,
              layout: { sectionOrder: [...activeSections], visibleSections },
            };

            await api.patch(`/cvs/${id}`, payload);
          } catch (error) {
            console.error("Auto-save failed:", error);
            throw error;
          }
        }
      : null,
  );

  const userName =
    form.fullName?.trim() ||
    (user
      ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
      : "Your Name");

  const filteredFormData = useCallback(
    () => getFilteredFormData(activeSections),
    [getFilteredFormData, activeSections],
  );

  const isComplete = () => {
    return (
      form.fullName?.trim() &&
      form.jobTitle?.trim() &&
      form.contact?.email?.trim()
    );
  };

  const handleBack = () => {
    if (id === "new" && !saving) {
      if (!isComplete()) {
        setShowExitPrompt(true);
        return;
      }
    }
    navigate("/employee/cvs");
  };

  useEffect(() => {
    sessionStorage.removeItem(`cv_analysis_${id}`);

    const load = async () => {
      const normalizeMonth = (value) => {
        if (!value) return "";
        return /^\d{4}$/.test(value) ? `${value}-01` : value;
      };

      if (id === "new") {
        const d = {
          jobTitle: location.state?.jobTitle || "",
          templateId: location.state?.templateId || 1,
        };
        setCv(d);
        setForm({
          fullName: "",
          jobTitle: d.jobTitle,
          summary: "",
          contact: { phone: "", email: "", github: "", linkedin: "" },
          address: { city: "", street: "" },
          experience: [],
          education: [],
          technicalSkills: [],
          softSkills: [],
          language: [],
          customSections: [],
          profileImage: "",
          layout: {
            sectionOrder: [...DEFAULT_SECTION_ORDER],
            visibleSections: {},
          },
        });
        setActiveSections(["summary"]);
        setLoading(false);
        return;
      }

      try {
        const res = await api.get(`/cvs/${id}`);
        const d = res.data.data.cv;
        setCv(d);
        setForm({
          fullName: d.fullName || "",
          jobTitle: d.jobTitle || "",
          summary: d.summary || "",
          contact: {
            phone: "",
            email: "",
            github: "",
            linkedin: "",
            ...d.contact,
          },
          address: { city: "", street: "", ...d.address },
          experience:
            d.experience?.map((e) => ({
              institutionName: e.institutionName,
              position: e.position,
              durationFrom: normalizeMonth(
                e.durationFrom || (e.duration ? String(e.duration) : ""),
              ),
              durationTo: normalizeMonth(e.durationTo || ""),
              summary: e.summary || "",
            })) || [],
          education:
            d.education?.map((e) => ({
              institutionName: e.institutionName,
              certification: e.certification,
              durationFrom: normalizeMonth(
                e.durationFrom || (e.duration ? String(e.duration) : ""),
              ),
              durationTo: normalizeMonth(e.durationTo || ""),
              summary: e.summary || "",
            })) || [],
          technicalSkills: d.technicalSkills || [],
          softSkills: d.softSkills || [],
          language: d.language || [],
          customSections:
            d.customSections?.map((s) => ({
              title: s.title || "",
              sectionType: s.sectionType || "other",
              items:
                s.items?.map((it) => ({
                  name: it.name || "",
                  description: it.description || "",
                  durationFrom: normalizeMonth(
                    it.durationFrom || (it.duration ? String(it.duration) : ""),
                  ),
                  durationTo: normalizeMonth(it.durationTo || ""),
                  link: it.link || "",
                })) || [],
            })) || [],
          profileImage: d.profileImage || "",
          layout: {
            sectionOrder: d.layout?.sectionOrder?.length
              ? d.layout.sectionOrder
              : [...DEFAULT_SECTION_ORDER],
            visibleSections: d.layout?.visibleSections
              ? Object.fromEntries(Object.entries(d.layout.visibleSections))
              : {},
          },
        });
        const auto = [];
        if (d.jobTitle || d.summary) auto.push("summary");
        if (d.contact && Object.values(d.contact).some(Boolean))
          auto.push("contact");
        if (d.address && Object.values(d.address).some(Boolean))
          auto.push("address");
        if (d.experience?.length) auto.push("experience");
        if (d.education?.length) auto.push("education");
        if (d.technicalSkills?.length) auto.push("technicalSkills");
        if (d.softSkills?.length) auto.push("softSkills");
        if (d.language?.length) auto.push("language");
        if (d.customSections?.length) auto.push("customSections");
        setActiveSections(
          auto.length ? [...new Set(["summary", ...auto])] : ["summary"],
        );
      } catch {
        showToast("error", "Failed to load CV.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const {
    showAnalysis,
    setShowAnalysis,
    analysisResult,
    highlights,
    analyzing,
    showSkillGap,
    setShowSkillGap,
    handleAnalyze,
    handleAnalyzeSection,
    handleApplyAnalysis,
    handleSkillGapAnalysis,
  } = useCVAnalysis({
    id,
    form,
    setForm,
    filteredFormData,
    userName,
    showToast,
  });

  const handleSave = async () => {
    if (id === "new" && !isComplete()) {
      showToast(
        "error",
        "Please complete all required fields before saving your CV.",
      );
      return;
    }

    setSaving(true);
    try {
      const filtered = filteredFormData();
      const visibleSections = {};
      activeSections.forEach((k) => {
        visibleSections[k] = true;
      });

      const payload = {
        ...filtered,
        experience: filtered.experience.map((e) => ({ ...e })),
        education: filtered.education.map((e) => ({ ...e })),
        customSections: filtered.customSections
          .filter(
            (s) => s.title || s.items.some((it) => it.name || it.description),
          )
          .map((s) => ({
            title: s.title,
            sectionType: s.sectionType || "other",
            items: s.items
              .filter(
                (it) =>
                  it.name ||
                  it.description ||
                  it.durationFrom ||
                  it.durationTo ||
                  it.link,
              )
              .map((it) => ({
                name: it.name || "",
                description: it.description,
                durationFrom: it.durationFrom || "",
                durationTo: it.durationTo || "",
                link: it.link,
              })),
          })),
        profileImage: form.profileImage,
        templateId: cv?.templateId || 1,
        layout: { sectionOrder: [...activeSections], visibleSections },
      };

      if (id === "new") {
        const res = await api.post(`/cvs`, payload);
        showToast("success", "CV created!");
        navigate(`/employee/cv-editor/${res.data.data.cv._id}`, {
          replace: true,
        });
      } else {
        await api.patch(`/cvs/${id}`, payload);
        showToast("success", "CV saved!");
      }
    } catch (err) {
      showToast("error", err?.response?.data?.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const toggleSection = (key) =>
    setActiveSections((p) => {
      const exists = p.includes(key);
      return exists ? p.filter((k) => k !== key) : [...p, key];
    });
  const toggleCollapse = (key) =>
    setCollapsedSections((p) => ({ ...p, [key]: !p[key] }));

  const onDragStart = (key) => {
    dragItemRef.current = key;
  };
  const onDragOver = (e, key) => {
    e.preventDefault();
    if (dragItemRef.current !== key) setDragOverKey(key);
  };
  const onDragLeave = () => setDragOverKey(null);
  const onDrop = (targetKey) => {
    const srcKey = dragItemRef.current;
    if (!srcKey || srcKey === targetKey) {
      setDragOverKey(null);
      return;
    }
    setActiveSections((prev) => {
      const arr = [...prev];
      const fromIdx = arr.indexOf(srcKey);
      const toIdx = arr.indexOf(targetKey);
      if (fromIdx < 0 || toIdx < 0) return prev;
      arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, srcKey);
      return arr;
    });
    dragItemRef.current = null;
    setDragOverKey(null);
  };
  const onDragEnd = () => {
    dragItemRef.current = null;
    setDragOverKey(null);
  };

  const handleDownloadPdf = async () => {
    if (id === "new") {
      showToast("error", "Please save the CV first to download it as PDF.");
      return;
    }
    setDownloadingPdf(true);
    try {
      const el = previewRef.current?.querySelector("[data-cv-content]");
      if (!el) {
        showToast("error", "Preview not ready.");
        return;
      }

      // Clone the element and strip analysis highlight styles so they
      // don't appear in the PDF output.
      const cleanedEl = (() => {
        const clone = el.cloneNode(true);
        // Strip analysis highlights
        clone.querySelectorAll("[style]").forEach((node) => {
          const s = node.style;
          if (s.outline && s.outline.includes("dashed")) {
            s.outline = "";
            s.outlineOffset = "";
            s.backgroundColor = "";
            s.borderRadius = "";
          }
        });
        clone.querySelectorAll(".break-inside-avoid").forEach((node) => {
          node.classList.remove("break-inside-avoid");
        });
        return clone;
      })();

      // Only capture inline <style> tags — NOT external <link> tags.
      // External links (Google Fonts, CDN) force Puppeteer to make network
      // requests which causes the networkidle0 wait to balloon to 30+ seconds.
      const styles = Array.from(document.querySelectorAll("style"))
        .map((s) => s.outerHTML)
        .join("\n");

      const htmlContent = `<!DOCTYPE html><html><head><meta charset="utf-8">
        ${styles}<style>
        /* ── Base reset ── */
        html, body { margin: 0; padding: 0; background: #fff !important; }
        * { print-color-adjust: exact; -webkit-print-color-adjust: exact; }

        /* ── PDF scroll performance: strip effects that PDF viewers render poorly ──
           Box-shadows, backdrop-filters, animations and will-change hints force
           PDF viewers to create separate compositor layers per element, causing
           low-FPS scrolling. Removing them makes the PDF render as flat vectors. */
        * {
          box-shadow: none !important;
          text-shadow: none !important;
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
          filter: none !important;
          animation: none !important;
          transition: none !important;
          will-change: auto !important;
        }

        /* ── Strip analysis highlight outlines ── */
        [style*="dashed"] { outline: none !important; background: transparent !important; }
      </style></head><body><div style="width:794px;margin:0 auto;background:#fff;">${cleanedEl.innerHTML}</div></body></html>`;
      const res = await api.post(
        `/cvs/${id}/download-pdf`,
        { html: htmlContent },
        { responseType: "blob" },
      );
      const url = window.URL.createObjectURL(
        new Blob([res.data], { type: "application/pdf" }),
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = `${form.jobTitle || "CV"}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showToast("success", "PDF downloaded!");
    } catch (err) {
      showToast("error", "Failed to generate PDF.");
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleChangeTemplate = async (templateId) => {
    try {
      setSaving(true);

      if (id === "new") {
        setCv((prev) => (prev ? { ...prev, templateId } : { templateId }));
        setShowTemplateSelector(false);
        showToast("success", "Template changed!");
        return;
      }

      const filtered = filteredFormData();
      await api.patch(`/cvs/${id}`, {
        ...filtered,
        templateId,
        experience: filtered.experience.map((e) => ({ ...e })),
        education: filtered.education.map((e) => ({ ...e })),
        customSections: filtered.customSections
          .filter(
            (s) => s.title || s.items.some((it) => it.name || it.description),
          )
          .map((s) => ({
            title: s.title,
            sectionType: s.sectionType || "other",
            items: s.items
              .filter(
                (it) =>
                  it.name ||
                  it.description ||
                  it.durationFrom ||
                  it.durationTo ||
                  it.link,
              )
              .map((it) => ({
                name: it.name || "",
                description: it.description,
                durationFrom: it.durationFrom || "",
                durationTo: it.durationTo || "",
                link: it.link,
              })),
          })),
        profileImage: form.profileImage,
        layout: {
          sectionOrder: [...activeSections],
          visibleSections: Object.fromEntries(
            activeSections.map((s) => [s, true]),
          ),
        },
      });
      setCv((prev) => ({ ...prev, templateId }));
      setShowTemplateSelector(false);
      showToast("success", "Template changed!");
    } catch (err) {
      showToast(
        "error",
        err?.response?.data?.message || "Failed to change template.",
      );
    } finally {
      setSaving(false);
    }
  };

  return {
    id,
    user,
    cv,
    loading,
    saving,
    showExitPrompt,
    setShowExitPrompt,
    toast,
    sidebarOpen,
    setSidebarOpen,
    activeSections,
    collapsedSections,
    showPreview,
    setShowPreview,
    downloadingPdf,
    showTemplateSelector,
    setShowTemplateSelector,
    dragOverKey,
    previewRef,
    form,
    setForm,
    handlers,
    handleImageUpload,
    removeProfileImage,
    isSaving,
    lastSavedAt,
    suggestions,
    isLoadingSuggestions,
    fetchSuggestions,
    fetchSingleSummarySuggestion,
    handleSuggestionSelect,
    userName,
    filteredFormData,
    handleBack,
    handleSave,
    toggleSection,
    toggleCollapse,
    onDragStart,
    onDragOver,
    onDragLeave,
    onDrop,
    onDragEnd,
    handleDownloadPdf,
    handleChangeTemplate,
    showAnalysis,
    setShowAnalysis,
    analysisResult,
    highlights,
    analyzing,
    showSkillGap,
    setShowSkillGap,
    handleAnalyze,
    handleAnalyzeSection,
    handleApplyAnalysis,
    handleSkillGapAnalysis,
    navigate,
  };
}
