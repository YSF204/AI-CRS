import React from "react";
import {
  Edit3,
  Loader,
  Trash2,
  ArrowRight,
  Building2,
  Calendar,
  MapPin,
  Target,
} from "lucide-react";

export default function ApplicationDetails({
  selectedApp,
  onEdit,
  onDelete,
  deletingId,
}) {
  if (selectedApp) {
    return (
      <div className="jd-panel bg-white overflow-hidden shadow-[8px_8px_0_black]">
        <div className="h-2 bg-[var(--nm-primary)] w-full" />
        <div className="p-8">
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="px-3 py-1 bg-black text-white text-[10px] font-black uppercase tracking-[0.2em]">
                Application Details
              </div>
              <div className="h-[2px] flex-1 bg-black/5" />
            </div>
            <h2 className="text-4xl font-black tracking-tighter leading-tight mb-2">
              {selectedApp.jobId?.position || "Untitled Position"}
            </h2>
            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-black/60 font-bold text-sm">
              <span className="flex items-center gap-1.5">
                <Building2 size={16} />
                {selectedApp.employerId?.company?.name}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin size={16} />
                Remote
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={16} />
                {new Date(selectedApp.createdAt).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-black flex items-center justify-center text-white flex-shrink-0">
                <span className="text-2xl">👁️</span>
              </div>
              <div>
                <h3 className="font-black uppercase text-sm tracking-tight leading-none mb-1">
                  Intelligence Analysis
                </h3>
                <p className="text-[10px] font-black text-[var(--nm-primary)] uppercase tracking-widest">
                  AI Core Output
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-6 border-4 border-black bg-[var(--nm-surface-low)] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
                  <Target size={120} />
                </div>
                <div className="relative z-10">
                  <p className="text-[10px] font-black uppercase tracking-widest text-black/40 mb-2">
                    Match Signal Strength
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-6xl font-black font-['Space_Grotesk'] tracking-tighter text-black">
                      {selectedApp.matchPercentage || 0}%
                    </span>
                    <span className="font-black text-sm uppercase opacity-40">
                      Accuracy Optimized
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 border-l-8 border-[var(--nm-primary)] bg-[var(--nm-bg)]">
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--nm-primary)] mb-3">
                  Recruiter Verdict
                </p>
                <p className="font-bold text-lg leading-snug text-black">
                  {selectedApp.matchDetails?.matchAnalysis ||
                    "Analysis complete. This candidate shows high structural alignment with the core role requirements."}
                </p>
                <p className="mt-4 text-xs font-bold text-black/40 italic">
                  * Based on neural cross-referencing of CV nodes and Job
                  criteria.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-6 border-t-2 border-black/5">
            <button
              onClick={() => onEdit(selectedApp)}
              className="jd-btn jd-btn-primary py-4 w-full text-sm font-black uppercase tracking-widest shadow-[6px_6px_0_black] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
            >
              <Edit3 size={18} /> Update Application
            </button>
            <button
              onClick={() => onDelete(selectedApp)}
              disabled={deletingId === selectedApp._id}
              className="py-4 w-full text-sm font-black uppercase tracking-widest border-2 border-black bg-white hover:bg-[var(--nm-error-surface)] hover:text-[var(--nm-error)] transition-all flex items-center justify-center gap-2"
            >
              {deletingId === selectedApp._id ? (
                <Loader size={18} className="animate-spin" />
              ) : (
                <Trash2 size={18} />
              )}
              {deletingId === selectedApp._id
                ? "Removing..."
                : "Remove Application"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="jd-panel p-20 flex flex-col items-center justify-center text-center bg-white/50 border-dashed">
      <ArrowRight size={48} className="mb-4 opacity-20" />
      <h3 className="font-black uppercase tracking-tight text-black/40">
        Select an application to view details
      </h3>
    </div>
  );
}
