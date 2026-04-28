import React, { useState, useMemo, useEffect } from "react";
import { 
  ClipboardList, Edit3, Loader, Search, ChevronLeft, ChevronRight, 
  XCircle, CheckCircle2, Clock, Calendar, Building2, Trash2, 
  ArrowRight, FileText, Target, MapPin
} from "lucide-react";
import DashboardNav from "../../components/shared/DashboardNav";
import useFetch from "../../hooks/useFetch";
import api from "../../services/api";
import ApplyJobModal from "./ApplyJob/index.jsx";
import { useSearchParams } from "react-router-dom";

const ITEMS_PER_PAGE = 8;

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" }
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "score-high", label: "Highest Score" },
  { value: "score-low", label: "Lowest Score" }
];

export default function Applications() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedApp, setSelectedApp] = useState(null);

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

  // URL-based state
  const searchQuery = searchParams.get("search") || "";
  const statusFilter = searchParams.get("status") || "all";
  const sortOption = searchParams.get("sort") || "newest";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  const [confirmDelete, setConfirmDelete] = useState(null);
  const [editJobId, setEditJobId] = useState(null);
  const [editAppId, setEditAppId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [localDeleted, setLocalDeleted] = useState(new Set());

  // Auto-select first app on load
  useEffect(() => {
    if (applications.length > 0 && !selectedApp) {
      setSelectedApp(applications[0]);
    }
  }, [applications]);

  const handleEditApplication = (app) => {
    setEditJobId(app.jobId?._id || app.jobId);
    setEditAppId(app._id);
  };

  const handleCloseModal = () => {
    setEditJobId(null);
    setEditAppId(null);
  };

  const handleDeleteApplication = (app) => {
    setConfirmDelete(app);
  };

  const handleConfirmDelete = async () => {
    const app = confirmDelete;
    setConfirmDelete(null);
    setDeletingId(app._id);
    try {
      await api.delete(`/applications/${app._id}`);
      setLocalDeleted(prev => new Set([...prev, app._id]));
      if (selectedApp?._id === app._id) setSelectedApp(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete application.');
    } finally {
      setDeletingId(null);
    }
  };

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(key, value);
    else newParams.delete(key);
    if (key !== "page") newParams.set("page", "1");
    setSearchParams(newParams);
  };

  const filteredAndSortedApps = useMemo(() => {
    let result = [...applications].filter(app => !localDeleted.has(app._id));
    if (statusFilter && statusFilter !== "all") {
      result = result.filter(app => (app.status || "pending").toLowerCase() === statusFilter.toLowerCase());
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(app => {
        const role = (app.jobId?.position || "").toLowerCase();
        const company = (app.employerId?.company?.name || "").toLowerCase();
        return role.includes(query) || company.includes(query);
      });
    }
    switch (sortOption) {
      case "oldest": result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); break;
      case "score-high": result.sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0)); break;
      case "score-low": result.sort((a, b) => (a.matchPercentage || 0) - (b.matchPercentage || 0)); break;
      default: result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
    }
    return result;
  }, [applications, localDeleted, statusFilter, searchQuery, sortOption]);

  const totalPages = Math.ceil(filteredAndSortedApps.length / ITEMS_PER_PAGE);
  const paginatedApps = filteredAndSortedApps.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const statusCounts = useMemo(() => {
    const visible = applications.filter(app => !localDeleted.has(app._id));
    const counts = { all: visible.length };
    STATUS_OPTIONS.forEach(opt => {
      if (opt.value !== "all") {
        counts[opt.value] = visible.filter(app => (app.status || "pending").toLowerCase() === opt.value.toLowerCase()).length;
      }
    });
    return counts;
  }, [applications, localDeleted]);

  const getStatusInfo = (status) => {
    const s = (status || "pending").toLowerCase();
    if (s === "accepted" || s === "shortlisted") return { color: "var(--nm-success)", icon: <CheckCircle2 size={14} />, label: "Accepted" };
    if (s === "rejected") return { color: "var(--nm-error)", icon: <XCircle size={14} />, label: "Rejected" };
    return { color: "var(--nm-warning)", icon: <Clock size={14} />, label: "Under Review" };
  };

  return (
    <div className="min-h-screen bg-[var(--nm-bg)] text-black">
      <div className="dashboard-nav-area">
        <DashboardNav role="employee" />
      </div>

      <div className="dashboard-shell jd-shell py-8">
        {/* Simplified Filter Bar */}
        <div className="jd-surface-stack mb-8 p-5 flex flex-col xl:flex-row items-center justify-between gap-6">
          {/* Filters (Left) */}
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => updateParam("status", opt.value === "all" ? "" : opt.value)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-tight border-2 transition-all ${
                  statusFilter === opt.value 
                    ? "bg-black text-white border-black" 
                    : "bg-white text-black border-black/10 hover:border-black"
                }`}
              >
                {opt.label} ({statusCounts[opt.value] || 0})
              </button>
            ))}
          </div>

          {/* Search & Sort (Right) */}
          <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto items-center">
            <div className="relative w-full xl:w-[460px]">
              <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-black/40 z-10" />
              <input
                type="text"
                placeholder="Search applications..."
                value={searchQuery}
                onChange={(e) => updateParam("search", e.target.value)}
                className="jd-input w-full"
                style={{ paddingLeft: '56px', height: '48px' }}
              />
            </div>
            <select
              value={sortOption}
              onChange={(e) => updateParam("sort", e.target.value)}
              className="jd-select w-full sm:w-44"
              style={{ height: '48px' }}
            >
              {SORT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
        </div>

        {/* Two-Sided Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8 items-start">
          
          {/* Left Panel: List */}
          <div className="space-y-4">
            {loading ? (
              <div className="jd-panel p-20 flex flex-col items-center justify-center gap-4 bg-white">
                <Loader className="animate-spin text-[var(--nm-primary)]" size={32} />
                <p className="font-mono text-xs font-black uppercase tracking-widest">Loading Applications</p>
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
                    onClick={() => setSelectedApp(app)}
                    className={`jd-card bg-white p-5 cursor-pointer transition-all border-2 ${
                      isActive ? "border-[var(--nm-primary)] shadow-[4px_4px_0_black] translate-x-1" : "border-black/5 hover:border-black"
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
                        <span className="text-[8px] font-black opacity-40 uppercase">Match</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2 px-2 py-0.5 border border-black/10 text-[9px] font-black uppercase" style={{ color: status.color, borderColor: status.color }}>
                        {status.icon}
                        {status.label}
                      </div>
                      <span className="text-[10px] font-bold text-black/40">
                        {new Date(app.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}

            {/* List Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 px-2">
                <button 
                  disabled={currentPage === 1} 
                  onClick={() => updateParam("page", currentPage - 1)}
                  className="p-2 border-2 border-black disabled:opacity-20 hover:bg-black hover:text-white transition-all"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs font-black">Page {currentPage} of {totalPages}</span>
                <button 
                  disabled={currentPage === totalPages} 
                  onClick={() => updateParam("page", currentPage + 1)}
                  className="p-2 border-2 border-black disabled:opacity-20 hover:bg-black hover:text-white transition-all"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Right Panel: Details */}
          <div className="lg:sticky lg:top-8">
            {selectedApp ? (
              <div className="jd-panel bg-white overflow-hidden shadow-[8px_8px_0_black]">
                <div className="h-2 bg-[var(--nm-primary)] w-full" />
                <div className="p-8">
                  {/* Header */}
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
                      <span className="flex items-center gap-1.5"><Building2 size={16} />{selectedApp.employerId?.company?.name}</span>
                      <span className="flex items-center gap-1.5"><MapPin size={16} />Remote</span>
                      <span className="flex items-center gap-1.5"><Calendar size={16} />{new Date(selectedApp.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>

                  {/* Intelligence Analysis Section */}
                  <div className="mb-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-black flex items-center justify-center text-white flex-shrink-0">
                        <span className="text-2xl">👁️</span>
                      </div>
                      <div>
                        <h3 className="font-black uppercase text-sm tracking-tight leading-none mb-1">Intelligence Analysis</h3>
                        <p className="text-[10px] font-black text-[var(--nm-primary)] uppercase tracking-widest">AI Core Output</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {/* Score Highlight */}
                      <div className="p-6 border-4 border-black bg-[var(--nm-surface-low)] relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
                          <Target size={120} />
                        </div>
                        <div className="relative z-10">
                          <p className="text-[10px] font-black uppercase tracking-widest text-black/40 mb-2">Match Signal Strength</p>
                          <div className="flex items-baseline gap-2">
                            <span className="text-6xl font-black font-['Space_Grotesk'] tracking-tighter text-black">
                              {selectedApp.matchPercentage || 0}%
                            </span>
                            <span className="font-black text-sm uppercase opacity-40">Accuracy Optimized</span>
                          </div>
                        </div>
                      </div>

                      {/* AI Summary */}
                      <div className="p-6 border-l-8 border-[var(--nm-primary)] bg-[var(--nm-bg)]">
                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--nm-primary)] mb-3">Recruiter Verdict</p>
                        <p className="font-bold text-lg leading-snug text-black">
                          {selectedApp.matchDetails?.matchAnalysis || "Analysis complete. This candidate shows high structural alignment with the core role requirements."}
                        </p>
                        <p className="mt-4 text-xs font-bold text-black/40 italic">
                          * Based on neural cross-referencing of CV nodes and Job criteria.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3 pt-6 border-t-2 border-black/5">
                    <button 
                      onClick={() => handleEditApplication(selectedApp)}
                      className="jd-btn jd-btn-primary py-4 w-full text-sm font-black uppercase tracking-widest shadow-[6px_6px_0_black] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                    >
                      <Edit3 size={18} /> Update Application
                    </button>
                    <button 
                      onClick={() => handleDeleteApplication(selectedApp)}
                      disabled={deletingId === selectedApp._id}
                      className="py-4 w-full text-sm font-black uppercase tracking-widest border-2 border-black bg-white hover:bg-[var(--nm-error-surface)] hover:text-[var(--nm-error)] transition-all flex items-center justify-center gap-2"
                    >
                      {deletingId === selectedApp._id ? <Loader size={18} className="animate-spin" /> : <Trash2 size={18} />}
                      {deletingId === selectedApp._id ? "Removing..." : "Remove Application"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="jd-panel p-20 flex flex-col items-center justify-center text-center bg-white/50 border-dashed">
                <ArrowRight size={48} className="mb-4 opacity-20" />
                <h3 className="font-black uppercase tracking-tight text-black/40">Select an application to view details</h3>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Edit Job Modal */}
      {editJobId && editAppId && (
        <ApplyJobModal
          jobId={editJobId}
          appId={editAppId}
          onClose={handleCloseModal}
        />
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setConfirmDelete(null)}>
          <div className="jd-panel bg-white max-w-md w-full p-8 shadow-[12px_12px_0_var(--nm-error)]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 text-[var(--nm-error)] mb-6">
              <Trash2 size={24} />
              <h2 className="text-xl font-black uppercase tracking-tighter">Confirm Deletion</h2>
            </div>
            <p className="font-bold text-black/60 leading-relaxed mb-8">
              Are you sure you want to remove your application for <span className="text-black">{confirmDelete.jobId?.position}</span>? This action is permanent and cannot be reversed.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={handleConfirmDelete}
                className="py-4 bg-[var(--nm-error)] text-white font-black uppercase tracking-widest border-2 border-black shadow-[4px_4px_0_black] hover:shadow-none transition-all"
              >
                Delete
              </button>
              <button 
                onClick={() => setConfirmDelete(null)}
                className="py-4 bg-white text-black font-black uppercase tracking-widest border-2 border-black hover:bg-black hover:text-white transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
