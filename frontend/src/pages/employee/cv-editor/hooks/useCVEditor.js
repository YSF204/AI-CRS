import { useReducer, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";
import api from "../../../../services/api";
import { DEFAULT_SECTION_ORDER } from "../constants";
import useCVForm from "./useCVForm";
import useCVAnalysis from "./useCVAnalysis";

const initialState = {
  cv: null,
  loading: true,
  saving: false,
  showExitPrompt: false,
  toast: null,
  sidebarOpen: true,
  activeSections: ["summary"],
  collapsedSections: {},
  showPreview: false,
  downloadingPdf: false,
  showTemplateSelector: false,
  dragOverKey: null,
};

function editorReducer(state, action) {
  switch (action.type) {
    case "SET_CV":
      return { ...state, cv: action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_SAVING":
      return { ...state, saving: action.payload };
    case "SHOW_EXIT_PROMPT":
      return { ...state, showExitPrompt: action.payload };
    case "TOAST":
      return { ...state, toast: action.payload };
    case "SET_SIDEBAR":
      return { ...state, sidebarOpen: action.payload };
    case "SET_ACTIVE_SECTIONS":
      return { ...state, activeSections: action.payload };
    case "TOGGLE_SECTION":
      return {
        ...state,
        activeSections: state.activeSections.includes(action.payload)
          ? state.activeSections.filter((k) => k !== action.payload)
          : [...state.activeSections, action.payload],
      };
    case "TOGGLE_COLLAPSE":
      return {
        ...state,
        collapsedSections: {
          ...state.collapsedSections,
          [action.payload]: !state.collapsedSections[action.payload],
        },
      };
    case "SET_PREVIEW":
      return { ...state, showPreview: action.payload };
    case "SET_DOWNLOADING_PDF":
      return { ...state, downloadingPdf: action.payload };
    case "SET_TEMPLATE_SELECTOR":
      return { ...state, showTemplateSelector: action.payload };
    case "SET_DRAG_OVER":
      return { ...state, dragOverKey: action.payload };
    case "REORDER_SECTIONS": {
      const { fromKey, toKey } = action.payload;
      const arr = [...state.activeSections];
      const fromIdx = arr.indexOf(fromKey);
      const toIdx = arr.indexOf(toKey);
      if (fromIdx < 0 || toIdx < 0) return state;
      arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, fromKey);
      return { ...state, activeSections: arr, dragOverKey: null };
    }
    case "MOVE_SECTION_UP": {
      const arr = [...state.activeSections];
      const idx = arr.indexOf(action.payload);
      if (idx <= 0) return state;
      [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
      return { ...state, activeSections: arr };
    }
    case "MOVE_SECTION_DOWN": {
      const arr = [...state.activeSections];
      const idx = arr.indexOf(action.payload);
      if (idx < 0 || idx >= arr.length - 1) return state;
      [arr[idx + 1], arr[idx]] = [arr[idx], arr[idx + 1]];
      return { ...state, activeSections: arr };
    }
    default:
      return state;
  }
}

export default function useCVEditor() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const dragItemRef = useRef(null);
  const previewRef = useRef(null);
  const toastTimerRef = useRef(null);

  const [ui, dispatch] = useReducer(editorReducer, initialState);

  const showToast = useCallback((type, msg) => {
    dispatch({ type: "TOAST", payload: { type, msg } });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => dispatch({ type: "TOAST", payload: null }), 3500);
  }, []);

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
          ui.activeSections.forEach((k) => { visibleSections[k] = true; });
          const payload = {
            ...formData,
            experience: formData.experience.map((e) => ({ ...e })),
            education: formData.education.map((e) => ({ ...e })),
            customSections: formData.customSections
              .filter((s) => s.title?.trim() || (s.items && s.items.length > 0))
              .map((s) => ({ ...s, items: s.items.map((it) => ({ ...it })) })),
            layout: { sectionOrder: [...ui.activeSections], visibleSections },
          };
          await api.patch(`/cvs/${id}`, payload);
        } catch (err) {
          console.error("Auto-save failed:", err);
        }
      }
      : null,
    user,
  );

  const userName =
    form.fullName?.trim() ||
    (user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "Your Name");

  const filteredFormData = useCallback(
    () => getFilteredFormData(ui.activeSections),
    [getFilteredFormData, ui.activeSections],
  );

  const isComplete = () =>
    form.fullName?.trim() && form.jobTitle?.trim() && form.contact?.email?.trim();

  const handleBack = () => {
    if (id === "new" && !ui.saving && !isComplete()) {
      dispatch({ type: "SHOW_EXIT_PROMPT", payload: true });
      return;
    }
    navigate("/employee/cvs");
  };

  useEffect(() => {
    const normalizeMonth = (value) => {
      if (!value) return "";

      const stringValue = String(value).trim();

      if (/^\d{4}-\d{2}$/.test(stringValue)) {
        return stringValue;
      }

      if (/^\d{2}\/\d{4}$/.test(stringValue)) {
        const [month, year] = stringValue.split("/");
        return `${year}-${month}`;
      }

      if (/^\d{4}$/.test(stringValue)) {
        return `${stringValue}-01`;
      }

      if (/^\d{4}-\d{2}-\d{2}$/.test(stringValue)) {
        return stringValue.slice(0, 7);
      }

      return stringValue;
    };

    const load = async () => {
      if (id === "new") {
        const d = { jobTitle: location.state?.jobTitle || "", templateId: location.state?.templateId || 1 };
        dispatch({ type: "SET_CV", payload: d });
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
          layout: { sectionOrder: [...DEFAULT_SECTION_ORDER], visibleSections: {} },
        });
        dispatch({ type: "SET_ACTIVE_SECTIONS", payload: ["summary"] });
        dispatch({ type: "SET_LOADING", payload: false });
        return;
      }

      try {
        const res = await api.get(`/cvs/${id}`);
        const d = res.data.data.cv;
        dispatch({ type: "SET_CV", payload: d });
        setForm({
          fullName: d.fullName || "",
          jobTitle: d.jobTitle || "",
          summary: d.summary || "",
          contact: { phone: "", email: "", github: "", linkedin: "", ...d.contact },
          address: { city: "", street: "", ...d.address },
          experience: d.experience?.map((e) => ({
            institutionName: e.institutionName,
            position: e.position,
            durationFrom: normalizeMonth(e.durationFrom || (e.duration ? String(e.duration) : "")),
            durationTo: normalizeMonth(e.durationTo || ""),
            summary: e.summary || "",
          })) || [],
          education: d.education?.map((e) => ({
            institutionName: e.institutionName,
            certification: e.certification,
            durationFrom: normalizeMonth(e.durationFrom || (e.duration ? String(e.duration) : "")),
            durationTo: normalizeMonth(e.durationTo || ""),
            summary: e.summary || "",
          })) || [],
          technicalSkills: d.technicalSkills || [],
          softSkills: d.softSkills || [],
          language: d.language || [],
          customSections: d.customSections?.map((s) => ({
            title: s.title || "",
            sectionType: s.sectionType || "other",
            items: s.items?.map((it) => ({
              name: it.name || "",
              description: it.description || "",
              durationFrom: normalizeMonth(it.durationFrom || (it.duration ? String(it.duration) : "")),
              durationTo: normalizeMonth(it.durationTo || ""),
              link: it.link || "",
            })) || [],
          })) || [],
          profileImage: d.profileImage || "",
          layout: {
            sectionOrder: d.layout?.sectionOrder?.length ? d.layout.sectionOrder : [...DEFAULT_SECTION_ORDER],
            visibleSections: d.layout?.visibleSections ? Object.fromEntries(Object.entries(d.layout.visibleSections)) : {},
          },
        });
        const auto = [];
        if (d.jobTitle || d.summary) auto.push("summary");
        if (d.contact && Object.values(d.contact).some(Boolean)) auto.push("contact");
        if (d.address && Object.values(d.address).some(Boolean)) auto.push("address");
        if (d.experience?.length) auto.push("experience");
        if (d.education?.length) auto.push("education");
        if (d.technicalSkills?.length) auto.push("technicalSkills");
        if (d.softSkills?.length) auto.push("softSkills");
        if (d.language?.length) auto.push("language");
        if (d.customSections?.length) auto.push("customSections");
        dispatch({ type: "SET_ACTIVE_SECTIONS", payload: auto.length ? [...new Set(["summary", ...auto])] : ["summary"] });
      } catch {
        showToast("error", "Failed to load CV.");
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
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
    analysisProgress,
    showSkillGap,
    setShowSkillGap,
    handleAnalyze,
    handleAnalyzeSection,
    handleApplyAnalysis,
    handleSkillGapAnalysis,
  } = useCVAnalysis({ id, form, setForm, filteredFormData, userName, showToast });

  const buildPayload = useCallback((filtered) => {
    const visibleSections = {};
    ui.activeSections.forEach((k) => { visibleSections[k] = true; });
    return {
      ...filtered,
      experience: filtered.experience.map((e) => ({ ...e })),
      education: filtered.education.map((e) => ({ ...e })),
      customSections: filtered.customSections
        .filter((s) => s.title || s.items.some((it) => it.name || it.description))
        .map((s) => ({
          title: s.title,
          sectionType: s.sectionType || "other",
          items: s.items
            .filter((it) => it.name || it.description || it.durationFrom || it.durationTo || it.link)
            .map((it) => ({ name: it.name || "", description: it.description, durationFrom: it.durationFrom || "", durationTo: it.durationTo || "", link: it.link })),
        })),
      profileImage: form.profileImage,
      templateId: ui.cv?.templateId || 1,
      layout: { sectionOrder: [...ui.activeSections], visibleSections },
    };
  }, [ui.activeSections, ui.cv?.templateId, form.profileImage]);

  const handleSave = async () => {
    dispatch({ type: "SET_SAVING", payload: true });
    try {
      const payload = buildPayload(filteredFormData());
      if (id === "new") {
        const res = await api.post(`/cvs`, payload);
        showToast("success", "CV created!");
        navigate(`/employee/cv-editor/${res.data.data.cv._id}`, { replace: true });
      } else {
        await api.patch(`/cvs/${id}`, payload);
        showToast("success", "CV saved!");
      }
    } catch (err) {
      showToast("error", err?.response?.data?.message || "Failed to save.");
    } finally {
      dispatch({ type: "SET_SAVING", payload: false });
    }
  };

  const handleApplyAndSave = async (updatesToApply) => {
    const appliedForm = handleApplyAnalysis(updatesToApply);

    if (!appliedForm || id === "new") return;

    try {
      const activeSections = ui.activeSections;
      const f = { ...appliedForm };
      const sectionClearMap = {
        summary: { jobTitle: "", summary: "" },
        contact: { contact: { phone: "", email: "", github: "", linkedin: "" } },
        address: { address: { city: "", street: "" } },
        experience: { experience: [] },
        education: { education: [] },
        technicalSkills: { technicalSkills: [] },
        softSkills: { softSkills: [] },
        language: { language: [] },
        customSections: { customSections: [] },
      };
      for (const [section, clear] of Object.entries(sectionClearMap)) {
        if (!activeSections.includes(section)) Object.assign(f, clear);
      }
      f.layout = { ...(f.layout || {}), sectionOrder: activeSections };

      const payload = buildPayload(f);
      await api.patch(`/cvs/${id}`, payload);
      showToast("success", "Changes applied & saved.");
    } catch (err) {
      showToast("error", "Applied but auto-save failed. Please save manually.");
    }
  };

  const toggleSection = (key) => dispatch({ type: "TOGGLE_SECTION", payload: key });
  const toggleCollapse = (key) => dispatch({ type: "TOGGLE_COLLAPSE", payload: key });

  const onDragStart = (key) => { dragItemRef.current = key; };
  const onDragOver = (e, key) => { e.preventDefault(); if (dragItemRef.current !== key) dispatch({ type: "SET_DRAG_OVER", payload: key }); };
  const onDragLeave = () => dispatch({ type: "SET_DRAG_OVER", payload: null });
  const onDrop = (targetKey) => {
    const srcKey = dragItemRef.current;
    if (!srcKey || srcKey === targetKey) { dispatch({ type: "SET_DRAG_OVER", payload: null }); return; }
    dispatch({ type: "REORDER_SECTIONS", payload: { fromKey: srcKey, toKey: targetKey } });
    dragItemRef.current = null;
  };
  const onDragEnd = () => { dragItemRef.current = null; dispatch({ type: "SET_DRAG_OVER", payload: null }); };

  // Mobile touch reorder — swap section up or down in the active list
  const onMoveUp = useCallback((key) => {
    dispatch({ type: "MOVE_SECTION_UP", payload: key });
  }, []);

  const onMoveDown = useCallback((key) => {
    dispatch({ type: "MOVE_SECTION_DOWN", payload: key });
  }, []);

  const handleDownloadPdf = async () => {
    if (id === "new") { showToast("error", "Please save the CV first to download it as PDF."); return; }
    dispatch({ type: "SET_DOWNLOADING_PDF", payload: true });
    try {
      const el = previewRef.current?.querySelector("[data-cv-content]");
      if (!el) { showToast("error", "Preview not ready."); return; }
      const clone = el.cloneNode(true);
      clone.querySelectorAll("[style]").forEach((node) => {
        const s = node.style;
        if (s.outline && s.outline.includes("dashed")) { s.outline = ""; s.outlineOffset = ""; s.backgroundColor = ""; s.borderRadius = ""; }
      });
      clone.querySelectorAll(".break-inside-avoid").forEach((node) => node.classList.remove("break-inside-avoid"));
      const styles = Array.from(document.querySelectorAll("style")).map((s) => s.outerHTML).join("\n");
      const htmlContent = `<!DOCTYPE html><html><head><meta charset="utf-8">${styles}<style>html,body{margin:0;padding:0;background:#fff!important}*{print-color-adjust:exact;-webkit-print-color-adjust:exact;box-shadow:none!important;text-shadow:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;filter:none!important;animation:none!important;transition:none!important;will-change:auto!important}[style*="dashed"]{outline:none!important;background:transparent!important}</style></head><body><div style="width:794px;margin:0 auto;background:#fff">${clone.innerHTML}</div></body></html>`;
      const res = await api.post(`/cvs/${id}/download-pdf`, { html: htmlContent }, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
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
      dispatch({ type: "SET_DOWNLOADING_PDF", payload: false });
    }
  };

  const handleChangeTemplate = async (templateId) => {
    dispatch({ type: "SET_SAVING", payload: true });
    try {
      if (id === "new") {
        dispatch({ type: "SET_CV", payload: ui.cv ? { ...ui.cv, templateId } : { templateId } });
        dispatch({ type: "SET_TEMPLATE_SELECTOR", payload: false });
        showToast("success", "Template changed!");
        return;
      }
      const payload = buildPayload(filteredFormData());
      await api.patch(`/cvs/${id}`, { ...payload, templateId });
      dispatch({ type: "SET_CV", payload: { ...ui.cv, templateId } });
      dispatch({ type: "SET_TEMPLATE_SELECTOR", payload: false });
      showToast("success", "Template changed!");
    } catch (err) {
      showToast("error", err?.response?.data?.message || "Failed to change template.");
    } finally {
      dispatch({ type: "SET_SAVING", payload: false });
    }
  };

  return {
    id,
    user,
    cv: ui.cv,
    loading: ui.loading,
    saving: ui.saving,
    showExitPrompt: ui.showExitPrompt,
    setShowExitPrompt: (v) => dispatch({ type: "SHOW_EXIT_PROMPT", payload: v }),
    toast: ui.toast,
    sidebarOpen: ui.sidebarOpen,
    setSidebarOpen: (v) => dispatch({ type: "SET_SIDEBAR", payload: v }),
    activeSections: ui.activeSections,
    collapsedSections: ui.collapsedSections,
    showPreview: ui.showPreview,
    setShowPreview: (v) => dispatch({ type: "SET_PREVIEW", payload: v }),
    downloadingPdf: ui.downloadingPdf,
    showTemplateSelector: ui.showTemplateSelector,
    setShowTemplateSelector: (v) => dispatch({ type: "SET_TEMPLATE_SELECTOR", payload: v }),
    dragOverKey: ui.dragOverKey,
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
    onMoveUp,
    onMoveDown,
    handleDownloadPdf,
    handleChangeTemplate,
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
    handleApplyAnalysis: handleApplyAndSave,
    handleSkillGapAnalysis,
    navigate,
  };
}
