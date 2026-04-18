import React, { useMemo, useState } from "react";
import { ClipboardList, Edit3, Loader, CheckCircle2, XCircle, Clock } from "lucide-react";
import DashboardNav from "../../components/shared/DashboardNav";
import StatsBar from "../../components/shared/StatsBar";
import useFetch from "../../hooks/useFetch";
import api from "../../services/api";
import ApplyJobModal from "./ApplyJob/index.jsx";

export default function Applications() {
  const {
    data: applications = [],
    loading,
    error,
  } = useFetch(
    async () => {
      const res = await api.get("/applications/my-applications");
      return res.data?.data?.applications || [];
    },
    { initialData: [] },
  );

  const [editJobId, setEditJobId] = useState(null);
  const [editAppId, setEditAppId] = useState(null);

  const handleEditApplication = (app) => {
    setEditJobId(app.jobId?._id || app.jobId);
    setEditAppId(app._id);
  };

  const handleCloseModal = () => {
    setEditJobId(null);
    setEditAppId(null);
  };

  const stats = useMemo(() => {
    return [
      {
        label: "Total Applied",
        value: applications.length,
        color: "var(--teal)",
      },
      {
        label: "Shortlisted",
        value: applications.filter((a) => a.status === "Shortlisted").length,
        color: "var(--yellow)",
      },
      {
        label: "Under Review",
        value: applications.filter((a) => a.status === "Under Review" || a.status === "pending").length,
        color: "var(--blue)",
      },
      {
        label: "Rejected",
        value: applications.filter((a) => a.status === "Rejected" || a.status === "rejected").length,
        color: "var(--coral)",
      },
    ];
  }, [applications]);

  const getStatusDisplay = (status) => {
    const s = status?.toLowerCase() || "pending";
    if (s === "shortlisted" || s === "accepted") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 font-mono text-xs font-bold uppercase border-2 border-black bg-[var(--teal)] text-black">
          <CheckCircle2 size={14} /> {s}
        </span>
      );
    }
    if (s === "rejected") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 font-mono text-xs font-bold uppercase border-2 border-black bg-[var(--coral)] text-black">
          <XCircle size={14} /> {s}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 font-mono text-xs font-bold uppercase border-2 border-black bg-[var(--bg)] text-black shadow-[2px_2px_0px_#000]">
        <Clock size={14} /> {status || "Under Review"}
      </span>
    );
  };

  const getScoreDisplay = (score) => {
    if (score == null) {
      return (
        <div className="flex items-center gap-2 px-3 py-2 border-2 border-black shadow-[3px_3px_0px_#000] bg-[#e5e5e5]">
          <Loader className="animate-spin text-[var(--fg-muted)]" size={16} />
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#555]">
            Calculating AI Match...
          </span>
        </div>
      );
    }
    
    const isGood = score >= 50;
    return (
      <div 
        className="flex items-center gap-3 px-4 py-2 border-2 border-black shadow-[4px_4px_0px_#000]"
        style={{ backgroundColor: isGood ? "var(--teal)" : "var(--coral)" }}
      >
        <span className="font-mono text-xs font-bold uppercase tracking-widest text-black">
          Match Score
        </span>
        <span className="font-bold text-xl text-black">
          {score}%
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-[var(--bg)] text-[var(--fg)]">
      <div className="dashboard-shell max-w-7xl mx-auto">
        <DashboardNav role="employee" />

        {/* Header */}
        <div className="mb-10 mt-8 border-b-8 border-black pb-8">
          <h1 className="text-4xl md:text-5xl font-black font-['Space_Grotesk'] uppercase tracking-tight flex items-center gap-4 drop-shadow-[2px_2px_0px_#000]">
            <ClipboardList size={36} className="text-[var(--teal)]" />
            My Applications
          </h1>
          <p className="font-mono text-base font-bold text-[var(--fg-muted)] mt-2 uppercase tracking-widest">
            Track your job submissions and AI match statuses
          </p>
        </div>

        <StatsBar stats={stats} />

        {/* Error State */}
        {error && (
          <div className="mt-8 brutal-card p-6 bg-[var(--coral)] border-4 border-black shadow-[6px_6px_0px_0px_#000]">
            <p className="font-mono font-bold uppercase text-black">
              ⚠️{" "}
              {error.response?.data?.message ||
                error.message ||
                "Unable to load applications."}
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="mt-8 border-4 border-black p-12 bg-[var(--card-bg)] text-center text-black flex flex-col items-center">
            <Loader className="animate-spin mb-4" size={32} />
            <p className="font-mono uppercase font-bold tracking-widest">Loading Records...</p>
          </div>
        ) : applications.length === 0 ? (
          /* Empty State */
          <div className="mt-8 border-[6px] border-black p-16 bg-[var(--card-bg)] shadow-[12px_12px_0px_0px_#000] text-center flex flex-col items-center justify-center">
            <ClipboardList
              size={64}
              className="mb-6 text-[var(--fg-muted)]"
            />
            <h3 className="font-['Space_Grotesk'] font-black text-3xl uppercase mb-3 drop-shadow-[2px_2px_0px_#000]">
              No Applications Found
            </h3>
            <p className="font-mono text-base font-bold text-[var(--fg-muted)] uppercase tracking-wider">
              Browse the job board and submit your first application.
            </p>
          </div>
        ) : (
          /* Applications List */
          <div className="mt-12 flex flex-col gap-6">
            {applications.map((app) => {
              const statusLower = (app.status || "pending").toLowerCase();
              const canEdit = statusLower === "under review" || statusLower === "pending";

              return (
                <div
                  key={app._id}
                  className="bg-white border-[4px] border-black p-6 shadow-[8px_8px_0px_0px_#000] flex flex-col xl:flex-row xl:items-center justify-between gap-6 hover:translate-x-1 hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_var(--teal)] transition-all"
                >
                  {/* Left block: Title and Company */}
                  <div className="flex-1">
                     <h2 className="font-black font-['Space_Grotesk'] text-2xl uppercase tracking-wider text-black truncate max-w-[500px]">
                       {app.jobId?.position || "Unknown Role"}
                     </h2>
                     <p className="font-mono text-sm uppercase tracking-widest text-[var(--fg-muted)] mt-1 font-bold">
                       {app.employerId?.company?.name || "Company"}
                     </p>
                     <div className="mt-4 flex gap-3 text-xs font-mono text-[var(--fg-muted)] font-bold uppercase">
                        <span>Submitted: {new Date(app.createdAt).toLocaleDateString()}</span>
                     </div>
                  </div>

                  {/* Right block: Matrix (Score + Status + Edit) */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 shrink-0 mt-4 xl:mt-0">
                    {/* Dynamic AI Score Widget */}
                    {getScoreDisplay(app.matchPercentage)}
                    
                    {/* Status Badge */}
                    <div className="min-w-[140px] flex items-center justify-center">
                      {getStatusDisplay(app.status)}
                    </div>
                    
                    {/* Update Action */}
                    {canEdit ? (
                       <button 
                         className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-black bg-[var(--yellow)] hover:bg-black hover:text-white transition-colors font-bold uppercase font-mono text-xs shadow-[3px_3px_0px_#000]"
                         onClick={() => handleEditApplication(app)}
                       >
                         <Edit3 size={14} /> Update
                       </button>
                    ) : (
                       <button disabled className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-[#ccc] text-[#999] bg-[#eee] font-bold uppercase font-mono text-xs cursor-not-allowed">
                         <CheckCircle2 size={14} /> Locked
                       </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Job Modal */}
      {editJobId && editAppId && (
        <ApplyJobModal 
          jobId={editJobId} 
          appId={editAppId} 
          onClose={handleCloseModal} 
        />
      )}
    </div>
  );
}
