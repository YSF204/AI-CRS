import React, { useState, useMemo } from "react";
import { Plus, Search, Filter } from "lucide-react";
import CVPreviewCard from "./CVPreviewCard";

export default function CVSelector({ cvs, loading, onAnalyze, analyzingId }) {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const cvList = useMemo(() => {
    return Array.isArray(cvs) ? cvs : [];
  }, [cvs]);

  const filteredCvs = useMemo(() => {
    let list = [...cvList];
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
  }, [cvList, query, sortBy]);

  const isEmpty = cvList.length === 0;

  if (isEmpty) {
    return (
      <div className="jd-surface-stack p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
        <p className="font-mono text-[var(--nm-text-tertiary)] mb-6">
          No CVs found. Create your first CV to unlock ATS optimization
          insights.
        </p>
        <a
          href="/employee/cv-templates"
          className="jd-btn jd-btn-primary inline-flex items-center gap-2"
        >
          <Plus size={18} />
          Create New CV
        </a>
      </div>
    );
  }

  return (
    <div className="ats-gallery-root space-y-6">
      {/* ATS Gallery Toolbar */}
      <div className="jd-surface-stack ats-toolbar flex items-center justify-between gap-4 p-4">
        <h2 className="jd-section-title mb-0">Select a CV to Analyze</h2>
        <div className="flex gap-3 items-center">
          <div className="relative h-[44px]">
            <input
              type="text"
              placeholder="Search CV names..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="jd-input h-[44px]"
              style={{ paddingLeft: "40px", width: "280px" }}
            />
            <Search
              size={16}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
              className="text-[var(--nm-text-tertiary)]"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="jd-select h-[44px]"
            style={{ width: "135px" }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Grid of CVs */}
      {filteredCvs.length > 0 ? (
        <div className="ats-gallery-grid">
          {filteredCvs.map((cv) => (
            <CVPreviewCard
              key={cv._id}
              cv={cv}
              loading={
                analyzingId === cv._id || (loading && analyzingId == null)
              }
              onAnalyze={onAnalyze}
            />
          ))}
        </div>
      ) : (
        <div className="jd-surface-stack p-8 text-center text-[var(--nm-text-tertiary)]">
          No CVs match your search criteria.
        </div>
      )}
    </div>
  );
}
