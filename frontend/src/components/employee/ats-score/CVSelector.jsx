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
      <div className="jd-surface-stack ats-toolbar flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 p-6">
        <div>
          <h2 className="jd-section-title mb-1 tracking-tight">Select a CV to Analyze</h2>
          <p className="text-sm text-[var(--nm-text-secondary)] font-medium font-mono uppercase tracking-wider">
            {filteredCvs.length} CV{filteredCvs.length !== 1 ? 's' : ''} available
          </p>
        </div>

        <div className="flex flex-row items-center gap-4 w-full lg:w-auto">
          <div className="relative group flex-1 md:flex-initial">
            <Search
              size={18}
              className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--nm-text-tertiary)] group-focus-within:text-[var(--nm-primary)] transition-colors z-10"
            />
            <input
              type="text"
              placeholder="Search CVs by name or job title..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="jd-input w-full md:w-[520px]"
              style={{ paddingLeft: '60px' }}
            />
          </div>
          <div className="relative w-[160px] flex-shrink-0">
             <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="jd-select"
              style={{ paddingRight: '44px' }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
            <Filter size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--nm-text-tertiary)]" />
          </div>
        </div>
      </div>

      {/* Grid of CVs */}
      {filteredCvs.length > 0 ? (
        <div className="ats-gallery-grid">
          {filteredCvs.map((cv) => (
            <CVPreviewCard
              key={cv._id}
              cv={cv}
              loading={loading}
              analyzingId={analyzingId}
              onAnalyze={onAnalyze}
            />
          ))}
        </div>
      ) : (
        <div className="jd-surface-stack p-12 text-center flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-[var(--nm-surface-low)] flex items-center justify-center mb-4 border-2 border-[var(--nm-ink)]">
            <Search size={20} className="text-[var(--nm-text-tertiary)]" />
          </div>
          <p className="font-mono text-sm uppercase tracking-widest text-[var(--nm-text-tertiary)]">
            No CVs match your search
          </p>
        </div>
      )}
    </div>
  );
}
