import React, { useState, useMemo } from "react";
import { Zap, Calendar } from "lucide-react";

export default function CVSelector({ cvs, loading, onAnalyze }) {
  const [selectedId, setSelectedId] = useState(null);

  const cvList = useMemo(() => {
    return Array.isArray(cvs) ? cvs : [];
  }, [cvs]);

  const handleAnalyzeClick = () => {
    if (selectedId) {
      onAnalyze(selectedId);
    }
  };

  const isEmpty = cvList.length === 0;

  return (
    <div className="space-y-6">
      {isEmpty ? (
        <div className="brutal-card p-12 text-center bg-[var(--card-bg)]">
          <p className="font-mono text-[var(--fg-muted)] mb-4">
            No CVs found. Create your first CV to get started.
          </p>
          <a
            href="/employee/cv-templates"
            className="brutal-btn inline-block px-5 py-3 font-bold"
            style={{ background: "var(--teal)", color: "#0a0a0a" }}
          >
            Create CV
          </a>
        </div>
      ) : (
        <>
          {/* FIX #3: CV List in card style matching applications list */}
          <div className="flex flex-col gap-4">
            {cvList.map((cv) => {
              const isSelected = cv._id === selectedId;
              const createdDate = new Date(cv.updatedAt).toLocaleDateString();

              return (
                <div
                  key={cv._id}
                  onClick={() => setSelectedId(cv._id)}
                  className={`bg-white border-[4px] border-black p-6 cursor-pointer transition-all hover:translate-x-1 hover:-translate-y-1 ${
                    isSelected
                      ? "shadow-[12px_12px_0px_0px_var(--teal)]"
                      : "shadow-[8px_8px_0px_0px_#000] hover:shadow-[12px_12px_0px_0px_var(--teal)]"
                  }`}
                  style={{
                    background: isSelected ? "var(--teal)" : "#fff",
                    color: isSelected ? "#0a0a0a" : "var(--fg)",
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-black font-['Space_Grotesk'] text-lg uppercase tracking-wider mb-2">
                        {cv.jobTitle || "Untitled CV"}
                      </h3>
                      <div
                        className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest text-[var(--fg-muted)]"
                        style={{
                          color: isSelected ? "#0a0a0a" : "var(--fg-muted)",
                        }}
                      >
                        <Calendar size={14} />
                        <span>Created: {createdDate}</span>
                      </div>
                    </div>
                    <div
                      className="flex items-center justify-center w-8 h-8 border-2 border-current rounded"
                      style={{
                        borderColor: isSelected
                          ? "#0a0a0a"
                          : "var(--border-color)",
                        background: isSelected ? "#0a0a0a" : "transparent",
                      }}
                    >
                      {isSelected && (
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ background: "var(--teal)" }}
                        ></div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Analyze Button */}
          <div className="flex justify-center pt-4">
            <button
              onClick={handleAnalyzeClick}
              disabled={!selectedId || loading}
              className="brutal-btn px-8 py-4 font-bold text-lg flex items-center gap-3"
              style={{
                background: selectedId && !loading ? "var(--teal)" : "#ccc",
                color: "#0a0a0a",
                opacity: selectedId && !loading ? 1 : 0.5,
              }}
            >
              <Zap size={18} />
              {loading ? "ANALYZING..." : "ANALYZE ATS SCORE"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
