import React, { useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Plus, Search, UploadCloud, Edit, Trash2 } from "lucide-react";
import DashboardNav from "../../components/shared/DashboardNav";
import CVPreviewCard from "../../components/Employee/ATSScore/CVPreviewCard";
import api from "../../services/api";
import useFetch from "../../hooks/useFetch";

export default function CVs() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
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
      list = list.filter((cv) =>
        (cv.jobTitle || "").toLowerCase().includes(lowerQ) ||
        (cv.fullName || "").toLowerCase().includes(lowerQ)
      );
    }
    if (sortBy === "newest") {
      list.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
    } else if (sortBy === "oldest") {
      list.sort((a, b) => new Date(a.updatedAt || a.createdAt) - new Date(b.updatedAt || b.createdAt));
    }
    return list;
  }, [cvs, query, sortBy]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this CV?")) return;
    try {
      await api.delete(`/cvs/${id}`);
      await refetch();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to delete CV.");
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
    <div className="cvs-page min-h-screen bg-[var(--bg)] text-[var(--fg)]">
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
            <p className="font-mono text-xs text-[var(--fg-muted)]">
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
        <div className="jd-surface-stack flex flex-col sm:flex-row items-center justify-between gap-4 p-4 mb-8">
          <h2 className="jd-section-title mb-0">Saved CVs ({cvs.length})</h2>
          <div className="flex w-full sm:w-auto gap-3">
            <div className="relative flex-grow sm:max-w-xs flex items-center">
              <Search size={16} className="absolute left-3 text-[var(--fg-muted)]" />
              <input
                type="text"
                placeholder="Search resumes..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="jd-input pl-10 h-10 w-full"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="jd-select h-10 min-w-[140px]"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>

        {(error || fetchError) && (
          <div className="mb-8 jd-surface-stack border-[var(--nm-error)]">
            <p className="font-mono text-sm text-[var(--nm-error)] m-0 font-bold uppercase py-1">
              {error || fetchError?.response?.data?.message || "Operation failed."}
            </p>
          </div>
        )}

        {/* CV Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="jd-panel h-[400px] animate-pulse bg-[var(--nm-surface-low)]" />
            ))}
          </div>
        ) : (
          <div className="ats-gallery-grid">
            {filteredCvs.map((cv) => (
              <div key={cv._id} className="relative group flex flex-col">
                <CVPreviewCard
                  cv={{ ...cv, buttonText: "EDIT RESUME" }}
                  onAnalyze={() => handleEdit(cv._id)}
                />
                
                {/* Float Actions */}
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleEdit(cv._id); }}
                    className="w-8 h-8 flex items-center justify-center bg-[var(--nm-primary)] text-white border-4 border-[var(--nm-ink)] hover:translate-x-[2px] hover:translate-y-[2px] transition-transform"
                    title="Edit CV"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(cv._id); }}
                    className="w-8 h-8 flex items-center justify-center bg-[var(--nm-error)] text-white border-4 border-[var(--nm-ink)] hover:translate-x-[2px] hover:translate-y-[2px] transition-transform"
                    title="Delete CV"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}

            {/* Empty State / Add Card */}
            <div
              className="jd-panel flex flex-col items-center justify-center gap-4 min-h-[400px] border-dashed border-[var(--fg-muted)] cursor-pointer hover:bg-[var(--nm-surface-high)] transition-colors"
              onClick={goToTemplates}
            >
              <div className="w-16 h-16 border-4 border-dashed border-[var(--fg-muted)] flex items-center justify-center">
                <Plus size={32} className="text-[var(--fg-muted)]" />
              </div>
              <p className="jd-section-title mb-0">Add New Resume</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
