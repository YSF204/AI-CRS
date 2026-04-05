import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

export default function CVEditor() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [cv, setCv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
  } = useCVForm(showToast);

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

  // ── Load CV ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      const normalizeMonth = (value) => {
        if (!value) return "";
        return /^\d{4}$/.test(value) ? `${value}-01` : value;
      };

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
  const handleSave = async () => {
    setSaving(true);
    try {
      const filtered = filteredFormData();
      const visibleSections = {};
      activeSections.forEach((k) => {
        visibleSections[k] = true;
      });
      await api.patch(`/cvs/${id}`, {
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
        layout: { sectionOrder: [...activeSections], visibleSections },
      });
      showToast("success", "CV saved!");
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
        downloadingPdf={downloadingPdf}
        onSave={handleSave}
        onPreview={() => setShowPreview(true)}
        onDownloadPdf={handleDownloadPdf}
        onChangeTemplate={() => setShowTemplateSelector(true)}
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
    </div>
  );
}
