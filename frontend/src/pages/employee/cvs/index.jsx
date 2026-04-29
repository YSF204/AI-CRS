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

export default function CVs() {
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
      setError(err?.response?.data?.message || "Unable to delete CV.");
      setDeleteTarget(null);
    }
  };

  const handleEdit = (id) => navigate(`/employee/cv-editor/${id}`);
  const goToTemplates = () => navigate("/employee/cv-templates");

  const handlePdfUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please upload a PDF file");
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
      setError(err?.response?.data?.message || "Failed to upload PDF.");
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
              Resume Vault
            </h1>
            <p className="font-mono text-xs text-[var(--nm-text-tertiary)]">
              {cvs.length} professional resumes on file
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
              {uploadingPdf ? "ANALYZING..." : "UPLOAD PDF"}
            </button>
            <button
              className="nm-btn bg-[var(--nm-warning)] text-[var(--nm-ink)] px-4 py-2 text-xs"
              onClick={goToTemplates}
            >
              <Plus size={16} />
              NEW CV
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="jd-surface-stack flex items-center justify-between gap-4 p-4 mb-8">
          <h2 className="jd-section-title mb-0">Saved CVs ({cvs.length})</h2>
          <div className="flex gap-3 items-center">
            <div className="relative h-[44px]">
              <input
                type="text"
                placeholder="Search resumes by job title or name..."
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
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>

        {(error || fetchError) && (
          <div className="mb-8 jd-surface-stack border-[var(--nm-error)]">
            <p className="font-mono text-sm text-[var(--nm-error)] m-0 font-bold uppercase py-1">
              {error ||
                fetchError?.response?.data?.message ||
                "Operation failed."}
            </p>
          </div>
        )}

        {/* CV Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="jd-panel h-[400px] animate-pulse bg-[var(--nm-surface-low)]"
              />
            ))}
          </div>
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
              <p className="jd-section-title mb-0">Add New Resume</p>
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
              Confirm Deletion
            </h3>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "14px",
                marginBottom: "24px",
                color: "var(--nm-text-secondary)",
              }}
            >
              Are you sure you want to permanently delete this CV? This action
              cannot be undone.
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
                Cancel
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
                Purge CV
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
