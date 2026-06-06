import React, { useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Plus,
  Search,
  UploadCloud,
} from "lucide-react";
import DashboardNav from "../../../components/shared/DashboardNav";
import api from "../../../services/api";
import useFetch from "../../../hooks/useFetch";
import CVCard from "./components/CVCard";
import { SkCardGrid, SkCard, SkBox, SkText } from "../../../components/ui/Skeleton";
import { useTranslation } from "../../../context/LanguageContext";

export default function CVs() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const fileInputRef = useRef(null);

  const {
    data: cvs = [],
    loading,
    error: fetchError,
    refetch,
  } = useFetch(
    async () => {
      const res = await api.get("/cvs");
      return res.data?.data?.cvs || [];
    },
    { initialData: [] },
  );

  const filteredCvs = useMemo(() => {
    let list = [...cvs];
    if (query) {
      const lowerQ = query.toLowerCase();
      list = list.filter(
        (cv) =>
          (cv.jobTitle || "").toLowerCase().includes(lowerQ) ||
          (cv.fullName || "").toLowerCase().includes(lowerQ),
      );
    }
    if (sortBy === "newest") {
      list.sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt) -
          new Date(a.updatedAt || a.createdAt),
      );
    } else if (sortBy === "oldest") {
      list.sort(
        (a, b) =>
          new Date(a.updatedAt || a.createdAt) -
          new Date(b.updatedAt || b.createdAt),
      );
    }
    return list;
  }, [cvs, query, sortBy]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/cvs/${deleteTarget}`);
      setDeleteTarget(null);
      await refetch();
    } catch (err) {
      setError(err?.response?.data?.message || t("toast.failed_to_delete", {}, "Unable to delete CV."));
      setDeleteTarget(null);
    }
  };

  const handleEdit = (id) => navigate(`/employee/cv-editor/${id}`);
  const goToTemplates = () => navigate("/employee/cv-templates");

  const handlePdfUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError(t("applyJob.uploadPdfError"));
      return;
    }
    setUploadingPdf(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("cvFile", file);
      await api.post("/cvs/upload/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await refetch();
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setError(err?.response?.data?.message || t("toast.failed_upload_pdf", {}, "Failed to upload PDF."));
    } finally {
      setUploadingPdf(false);
    }
  };

  return (
    <div className="cvs-page min-h-screen bg-[var(--nm-bg)] text-[var(--nm-text-primary)]">
      <div className="dashboard-nav-area">
        <DashboardNav role="employee" />
      </div>

      <div className="dashboard-shell jd-shell py-6 lg:py-8">
        {/* Compact Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold font-display uppercase tracking-tight flex items-center gap-3">
              <FileText size={24} className="text-[var(--nm-primary)]" />
              {t('employee.resumeVault')}
            </h1>
            <p className="font-mono text-xs text-[var(--nm-text-tertiary)]">
              {cvs.length} {t('employee.resumesOnFile')}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handlePdfUpload}
              className="hidden"
            />
            <button
              className="nm-btn nm-btn-primary px-4 py-2 text-xs"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPdf}
            >
              <UploadCloud size={16} />
              {uploadingPdf ? t('employee.analyzing') : t('employee.uploadPdf')}
            </button>
            <button
              className="nm-btn bg-[var(--nm-warning)] text-[var(--nm-ink)] px-4 py-2 text-xs"
              onClick={goToTemplates}
            >
              <Plus size={16} />
              {t('employee.newCv')}
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="jd-surface-stack flex items-center justify-between gap-4 p-4 mb-8">
          <h2 className="jd-section-title mb-0">{t('employee.savedCvs')} ({cvs.length})</h2>
          <div className="flex gap-3 items-center">
            <div className="relative h-[44px]">
              <input
                type="text"
                placeholder={t('employee.searchPlaceholder')}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="jd-input w-[520px] h-[44px]"
                style={{ paddingLeft: "60px" }}
              />
              <Search
                size={18}
                style={{
                  position: "absolute",
                  left: "20px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                  zIndex: 10,
                }}
                className="text-[var(--nm-text-tertiary)]"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="jd-select h-[44px]"
              style={{ width: "100px" }}
            >
              <option value="newest">{t('employee.newest')}</option>
              <option value="oldest">{t('employee.oldest')}</option>
            </select>
          </div>
        </div>

        {(error || fetchError) && (
          <div className="mb-8 jd-surface-stack border-[var(--nm-error)]">
            <p className="font-mono text-sm text-[var(--nm-error)] m-0 font-bold uppercase py-1">
              {error ||
                fetchError?.response?.data?.message ||
                t("common.operationFailed", {}, "Operation failed.")}
            </p>
          </div>
        )}

        {/* CV Grid */}
        {loading ? (
          <SkCardGrid count={3} height={400}>
            <SkCard style={{ height: 400 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)", height: "100%" }}>
                <div className="sk" style={{ flex: 1, minHeight: 200 }} />
                <SkBox w="70%" h={20} />
                <SkText lines={2} />
              </div>
            </SkCard>
          </SkCardGrid>
        ) : (
          <div className="ats-gallery-grid">
            {filteredCvs.map((cv) => (
              <CVCard
                key={cv._id}
                cv={cv}
                onEdit={handleEdit}
                onDelete={(id) => setDeleteTarget(id)}
              />
            ))}

            {/* Empty State / Add Card */}
            <div
              className="jd-panel flex flex-col items-center justify-center gap-4 min-h-[400px] border-dashed border-[var(--nm-text-tertiary)] cursor-pointer hover:bg-[var(--nm-surface-high)] transition-colors"
              onClick={goToTemplates}
            >
              <div className="w-16 h-16 border-4 border-dashed border-[var(--nm-text-tertiary)] flex items-center justify-center">
                <Plus size={32} className="text-[var(--nm-text-tertiary)]" />
              </div>
              <p className="jd-section-title mb-0">{t('employee.addNewResume')}</p>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {deleteTarget && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            className="nm-card"
            style={{
              background: "var(--nm-surface)",
              padding: "32px",
              maxWidth: "400px",
              width: "90%",
              border: "4px solid var(--nm-ink)",
              boxShadow: "8px 8px 0 var(--nm-ink)",
              borderRadius: "0px",
            }}
          >
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                fontSize: "20px",
                textTransform: "uppercase",
                marginBottom: "12px",
                color: "var(--nm-text-primary)",
              }}
            >
              {t('employee.confirmDeletion')}
            </h3>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "14px",
                marginBottom: "24px",
                color: "var(--nm-text-secondary)",
              }}
            >
              {t('employee.deleteWarn')}
            </p>
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => setDeleteTarget(null)}
                className="nm-btn"
                style={{
                  padding: "10px 16px",
                  background: "var(--nm-surface-high)",
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: "12px",
                  textTransform: "uppercase",
                }}
              >
                {t('auth.back')}
              </button>
              <button
                onClick={handleDelete}
                className="nm-btn"
                style={{
                  padding: "10px 16px",
                  background: "var(--nm-error)",
                  color: "#fff",
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: "12px",
                  textTransform: "uppercase",
                }}
              >
                {t('employee.deleteCv')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
