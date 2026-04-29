import React from "react";
import {
  ClipboardList,
  Loader,
  ChevronLeft,
  ChevronRight,
  Building2,
} from "lucide-react";

export default function ApplicationsList({
  paginatedApps,
  selectedApp,
  onSelectApp,
  getStatusInfo,
  loading,
  currentPage,
  totalPages,
  onPageChange,
}) {
  return (
    <div className="space-y-4">
      {loading ? (
        <div className="jd-panel p-20 flex flex-col items-center justify-center gap-4 bg-white">
          <Loader
            className="animate-spin text-[var(--nm-primary)]"
            size={32}
          />
          <p className="font-mono text-xs font-black uppercase tracking-widest">
            Loading Applications
          </p>
        </div>
      ) : paginatedApps.length === 0 ? (
        <div className="jd-panel p-20 text-center bg-white">
          <ClipboardList size={48} className="mx-auto mb-4 opacity-20" />
          <p className="font-bold">No applications found.</p>
        </div>
      ) : (
        paginatedApps.map((app) => {
          const isActive = selectedApp?._id === app._id;
          const status = getStatusInfo(app.status);
          return (
            <div
              key={app._id}
              onClick={() => onSelectApp(app)}
              className={`jd-card bg-white p-5 cursor-pointer transition-all border-2 ${
                isActive
                  ? "border-[var(--nm-primary)] shadow-[4px_4px_0_black] translate-x-1"
                  : "border-black/5 hover:border-black"
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="space-y-1">
                  <h3 className="font-black text-sm uppercase tracking-tight leading-tight">
                    {app.jobId?.position || "Untitled Position"}
                  </h3>
                  <p className="text-xs font-bold text-black/60 flex items-center gap-1">
                    <Building2 size={12} />
                    {app.employerId?.company?.name || "Company"}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black font-['Space_Grotesk'] leading-none">
                    {app.matchPercentage || 0}%
                  </div>
                  <span className="text-[8px] font-black opacity-40 uppercase">
                    Match
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4">
                <div
                  className="flex items-center gap-2 px-2 py-0.5 border border-black/10 text-[9px] font-black uppercase"
                  style={{ color: status.color, borderColor: status.color }}
                >
                  {status.icon}
                  {status.label}
                </div>
                <span className="text-[10px] font-bold text-black/40">
                  {new Date(app.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                  })}
                </span>
              </div>
            </div>
          );
        })
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 px-2">
          <button
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="p-2 border-2 border-black disabled:opacity-20 hover:bg-black hover:text-white transition-all"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs font-black">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="p-2 border-2 border-black disabled:opacity-20 hover:bg-black hover:text-white transition-all"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
