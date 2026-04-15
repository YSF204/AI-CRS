import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import DashboardNav from "../../../components/shared/DashboardNav";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../services/api";
import { DEFAULT_SECTION_ORDER } from "./constants";
import { TEMPLATES } from "../../../Features/CVManagement/index.js";
import useCVForm from "./hooks/useCVForm";
import ActionBar from "./components/ActionBar";
import Toast from "./components/Toast";
import Sidebar from "./components/Sidebar";
import EditorContent from "./components/EditorContent";
import LivePreview from "./components/LivePreview";
import PreviewModal from "./components/PreviewModal";
import AnalysisModal from "./components/AnalysisModal";

export default function CVEditor() {
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
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
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
  } = useCVForm(showToast, id !== "new" ? async (formData) => {
    // Auto-save function
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
        profileImage: formData.profileImage,
        templateId: cv?.templateId || 1,
        layout: { sectionOrder: [...activeSections], visibleSections },
      };

      await api.patch(`/cvs/${id}`, payload);
    } catch (error) {
      console.error("Auto-save failed:", error);
      throw error;
    }
  } : null);

  const userName =
    form.fullName?.trim() ||
    (user
      ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
      : "Your Name");

  // Wrap getFilteredFormData to inject activeSections
  const filteredFormData = useCallback(
    () => getFilteredFormData(activeSections),
    [getFilteredFormData, activeSections],
  );

  const isComplete = () => {
    return form.fullName?.trim() && form.jobTitle?.trim() && form.contact?.email?.trim();
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

  // ── Load CV ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    // Clear session storage specifically for this CV on reload or entry
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
        // Auto-activate sections that have data
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

  // ── Save ──────────────────────────────────────────────────────────────────────
  const handleAnalyze = async () => {
    const cached = sessionStorage.getItem(`cv_analysis_${id}`);
    if (cached) {
      setAnalysisResult(JSON.parse(cached));
      setShowAnalysis(true);
      return;
    }

    setAnalyzing(true);
    try {
      const filtered = filteredFormData();
      const flat = {};
      
      if (filtered.summary) flat.summary = filtered.summary;
      if (filtered.jobTitle) flat.jobTitle = filtered.jobTitle;
      filtered.experience?.forEach((exp, i) => { if (exp.summary) flat[`experience_${i}_summary`] = exp.summary; });
      filtered.education?.forEach((edu, i) => { if (edu.summary) flat[`education_${i}_summary`] = edu.summary; });
      filtered.customSections?.forEach((sec, sIdx) => {
        sec.items?.forEach((item, iIdx) => {
          if (item.description) flat[`customSections_${sIdx}_items_${iIdx}_description`] = item.description;
        });
      });

      const response = await api.post("/cvs/analyze-section", {
        section: "fullCv",
        data: flat,
        fullName: userName,
      });

      if (response.data?.success && response.data?.data) {
        const result = response.data.data;
        setAnalysisResult(result);
        sessionStorage.setItem(`cv_analysis_${id}`, JSON.stringify(result));
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
      
      // Clone arrays so we can mutate safely
      next.experience = next.experience ? [...next.experience] : [];
      next.education = next.education ? [...next.education] : [];
      next.customSections = next.customSections ? [...next.customSections] : [];

      Object.entries(updatesToApply).forEach(([key, value]) => {
        if (key === 'summary') next.summary = value;
        else if (key === 'jobTitle') next.jobTitle = value;
        else if (key.startsWith('experience_')) {
          const parts = key.split('_'); // [experience, 0, summary]
          const idx = parseInt(parts[1], 10);
          if (next.experience[idx]) {
            next.experience[idx] = { ...next.experience[idx], [parts[2]]: value };
          }
        }
        else if (key.startsWith('education_')) {
          const parts = key.split('_'); 
          const idx = parseInt(parts[1], 10);
          if (next.education[idx]) {
            next.education[idx] = { ...next.education[idx], [parts[2]]: value };
          }
        }
        else if (key.startsWith('customSections_')) {
          // customSections_0_items_0_description
          const parts = key.split('_');
          const sIdx = parseInt(parts[1], 10);
          const iIdx = parseInt(parts[3], 10);
          if (next.customSections[sIdx] && next.customSections[sIdx].items && next.customSections[sIdx].items[iIdx]) {
            next.customSections[sIdx] = { ...next.customSections[sIdx] };
            next.customSections[sIdx].items = [...next.customSections[sIdx].items];
            next.customSections[sIdx].items[iIdx] = { 
               ...next.customSections[sIdx].items[iIdx], 
               description: value 
            };
          }
        }
      });

      return next;
    });

    showToast("success", "Selected changes applied to your CV.");
    setShowAnalysis(false);
    
    // Wipe local storage so new edits take precedence next time analysis is ran explicitly
    sessionStorage.removeItem(`cv_analysis_${id}`);
  };

  const handleSave = async () => {
    if (id === "new" && !isComplete()) {
      showToast("error", "Please fill required fields (Full Name, Job Title, Email).");
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
        templateId: cv?.templateId || 1, // Include templateId in save payload
        layout: { sectionOrder: [...activeSections], visibleSections },
      };

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
      setSaving(false);
    }
  };

  // ── Section toggles ──────────────────────────────────────────────────────────
  const toggleSection = (key) =>
    setActiveSections((p) =>
      p.includes(key) ? p.filter((k) => k !== key) : [...p, key],
    );
  const toggleCollapse = (key) =>
    setCollapsedSections((p) => ({ ...p, [key]: !p[key] }));

  // ── Drag-and-drop section reorder ─────────────────────────────────────────────
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

  // ── Download PDF ──────────────────────────────────────────────────────────────
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

      const styles = Array.from(
        document.querySelectorAll('style, link[rel="stylesheet"]'),
      )
        .map((s) => s.outerHTML)
        .join("\n");

      const htmlContent = `<!DOCTYPE html><html><head><meta charset="utf-8">${styles}<style>
        html, body { margin: 0; padding: 0; background: #fff !important; }
        * { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
        body > * { box-shadow: none !important; border: none !important; }
      </style></head><body><div style="width:794px;margin:0 auto;background:#fff;">${el.innerHTML}</div></body></html>`;
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

  // ── Change Template ────────────────────────────────────────────────────────────
  const handleChangeTemplate = async (templateId) => {
    try {
      setSaving(true);

      // For new CVs (unsaved), apply template locally without API call
      if (id === "new") {
        setCv((prev) => (prev ? { ...prev, templateId } : { templateId }));
        setShowTemplateSelector(false);
        showToast("success", "Template changed!");
        return;
      }

      // For existing CVs, persist to backend
      const filtered = filteredFormData();
      await api.patch(`/cvs/${id}`, {
        ...filtered,
        templateId,
        experience: filtered.experience.map((e) => ({ ...e })),
        education: filtered.education.map((e) => ({ ...e })),
        customSections: filtered.customSections,
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

  // ── Loading ───────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[var(--bg)] text-[var(--fg)]">
        <span className="font-mono text-sm tracking-[0.1em] text-[var(--fg-muted)]">
          LOADING CV…
        </span>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[var(--bg)] text-[var(--fg)]">
      {/* ── Nav ── */}
      <div className="flex-shrink-0 px-8">
        <DashboardNav role="employee" />
      </div>

      {/* ── Action bar ── */}
      <ActionBar
        form={form}
        saving={saving}
        isAutoSaving={isSaving}
        lastSavedAt={lastSavedAt}
        analyzing={analyzing}
        downloadingPdf={downloadingPdf}
        onSave={handleSave}
        onAnalyze={handleAnalyze}
        onPreview={() => setShowPreview(true)}
        onDownloadPdf={handleDownloadPdf}
        onChangeTemplate={() => setShowTemplateSelector(true)}
        onBack={handleBack}
      />

      {/* ── Toast ── */}
      <Toast toast={toast} />

      {/* ── 3-column content ── */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* ══ SIDEBAR ══ */}
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          activeSections={activeSections}
          toggleSection={toggleSection}
        />

        {/* ══ CENTER: form cards ══ */}
        <div
          className="flex-1 overflow-y-auto overflow-x-hidden bg-[var(--bg)]"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(10,10,10,0.15) transparent",
          }}
        >
          <EditorContent
            form={form}
            setForm={setForm}
            user={user}
            cv={cv}
            activeSections={activeSections}
            collapsedSections={collapsedSections}
            handlers={handlers}
            toggleSection={toggleSection}
            toggleCollapse={toggleCollapse}
            dragOverKey={dragOverKey}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onDragEnd={onDragEnd}
            handleImageUpload={handleImageUpload}
            removeProfileImage={removeProfileImage}
            fetchSuggestions={fetchSuggestions}
            fetchSingleSummarySuggestion={fetchSingleSummarySuggestion}
            handleSuggestionSelect={handleSuggestionSelect}
            suggestions={suggestions}
            isLoadingSuggestions={isLoadingSuggestions}
          />
        </div>

        {/* ══ RIGHT: live preview ══ */}
        <div
          ref={previewRef}
          className="w-[520px] flex-shrink-0 overflow-hidden flex flex-col p-3 pl-0 border-l-[3px] border-[var(--border-color)]"
        >
          <LivePreview
            formData={filteredFormData()}
            userName={userName}
            templateId={cv?.templateId || 1}
          />
        </div>
      </div>

      {/* ── Full-screen Preview Modal ── */}
      <PreviewModal
        show={showPreview}
        onClose={() => setShowPreview(false)}
        userName={userName}
        getFilteredFormData={filteredFormData}
        templateId={cv?.templateId || 1}
        downloadingPdf={downloadingPdf}
        onDownloadPdf={handleDownloadPdf}
      />

      {/* ── Analysis Modal ── */}
      <AnalysisModal
        show={showAnalysis}
        analysis={analysisResult}
        currentData={form}
        onClose={() => setShowAnalysis(false)}
        onApply={handleApplyAnalysis}
      />

      {/* ── Template Selector Modal ── */}
      {showTemplateSelector && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(10,10,10,0.55)",
            backdropFilter: "blur(6px)",
            zIndex: 9000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px",
          }}
          onClick={() => setShowTemplateSelector(false)}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              maxWidth: "1200px",
              maxHeight: "85vh",
              background: "#fafafa",
              borderRadius: "12px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px 20px",
                background: "rgba(10,10,10,0.92)",
                borderBottom: "2px solid #333",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 900,
                  fontSize: "13px",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "#fff",
                  marginRight: "auto",
                }}
              >
                Select New Template
              </span>
              <button
                onClick={() => setShowTemplateSelector(false)}
                className="flex items-center gap-1 font-['Space_Grotesk'] font-bold text-xs uppercase tracking-wider px-4 py-2 bg-[#ffe630] text-[#0a0a0a] border-2 border-[#0a0a0a]"
              >
                Close
              </button>
            </div>

            {/* Templates Grid */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "32px",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: "20px",
                scrollbarWidth: "thin",
              }}
            >
              {TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => handleChangeTemplate(tmpl.id)}
                  disabled={saving || cv?.templateId === tmpl.id}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "12px",
                    padding: "16px",
                    border:
                      cv?.templateId === tmpl.id
                        ? "3px solid #0a0a0a"
                        : "2px solid #ccc",
                    background: cv?.templateId === tmpl.id ? "#ffe630" : "#fff",
                    borderRadius: "8px",
                    cursor:
                      saving || cv?.templateId === tmpl.id
                        ? "not-allowed"
                        : "pointer",
                    opacity: saving || cv?.templateId === tmpl.id ? 0.5 : 1,
                    transition: "all 0.2s ease",
                  }}
                >
                  <span
                    style={{
                      fontWeight: "bold",
                      fontSize: "14px",
                      color: "#0a0a0a",
                    }}
                  >
                    {tmpl.name}
                  </span>
                  <span style={{ fontSize: "12px", color: "#666" }}>
                    {cv?.templateId === tmpl.id ? "✓ Current" : "Select"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Exit Prompt Modal ── */}
      {showExitPrompt && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="brutal-card bg-[var(--card-bg)] p-6 max-w-sm w-full mx-4 flex flex-col gap-4">
            <h3 className="font-['Space_Grotesk'] font-bold text-lg">Unsaved CV</h3>
            <p className="font-mono text-sm">You haven't filled all the required fields (Full Name, Job Title, Email). Do you want to cancel the creation or complete it?</p>
            <div className="flex gap-3 justify-end mt-2">
              <button disabled={saving} onClick={() => navigate("/employee/cvs")} className="brutal-btn-outline px-4 py-2">Cancel Creation</button>
              <button onClick={() => setShowExitPrompt(false)} className="brutal-btn px-4 py-2 bg-[var(--yellow)] text-[#0a0a0a]">Complete Fields</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
