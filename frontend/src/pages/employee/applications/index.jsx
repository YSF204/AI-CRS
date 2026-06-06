import React, { useState, useMemo, useEffect } from "react";
import { Search, XCircle, CheckCircle2, Clock, Trash2 } from "lucide-react";
import DashboardNav from "../../../components/shared/DashboardNav";
import useFetch from "../../../hooks/useFetch";
import api from "../../../services/api";
import ApplyJobModal from "../apply-job/index.jsx";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "../../../context/LanguageContext";
import ApplicationsList from "./components/ApplicationsList";
import ApplicationDetails from "./components/ApplicationDetails";

const ITEMS_PER_PAGE = 8;

const STATUS_OPTIONS = [
  { value: "all", label: "applications.all" },
  { value: "pending", label: "applications.pending" },
  { value: "accepted", label: "applications.accepted" },
  { value: "rejected", label: "applications.rejected" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "employeeJobs.newestFirst" },
  { value: "oldest", label: "employeeJobs.oldestFirst" },
  { value: "score-high", label: "applications.scoreHigh" },
  { value: "score-low", label: "applications.scoreLow" },
];

export default function Applications() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedApp, setSelectedApp] = useState(null);
  const { t } = useTranslation();

  const {
    data: applications = [],
    loading,
    error,
    refetch,
    setData: setApplications,
  } = useFetch(
    async () => {
      const res = await api.get("/applications/my-applications", { __noCache: true });
      return res.data?.data?.applications || [];
    },
    { initialData: [] },
  );

  const searchQuery = searchParams.get("search") || "";
  const statusFilter = searchParams.get("status") || "all";
  const sortOption = searchParams.get("sort") || "newest";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  const [confirmDelete, setConfirmDelete] = useState(null);
  const [editJobId, setEditJobId] = useState(null);
  const [editAppId, setEditAppId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [localDeleted, setLocalDeleted] = useState(new Set());

  useEffect(() => {
    const isDesktop = typeof window !== "undefined" && window.innerWidth >= 1024;
    if (isDesktop && applications.length > 0 && !selectedApp) {
      setSelectedApp(applications[0]);
    }
  }, [applications, selectedApp]);

  const handleEditApplication = (app) => {
    setEditJobId(app.jobId?._id || app.jobId);
    setEditAppId(app._id);
  };

  const handleCloseModal = () => {
    setEditJobId(null);
    setEditAppId(null);
    refetch();
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
      setLocalDeleted((prev) => new Set([...prev, app._id]));
      setApplications((prev = []) => prev.filter((item) => item._id !== app._id));
      if (selectedApp?._id === app._id) setSelectedApp(null);
    } catch (err) {
      alert(err.response?.data?.message || t("toast.failed_to_delete", {}, "Failed to delete application."));
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
    let result = [...applications].filter((app) => !localDeleted.has(app._id));
    if (statusFilter && statusFilter !== "all") {
      result = result.filter(
        (app) =>
          (app.status || "pending").toLowerCase() ===
          statusFilter.toLowerCase(),
      );
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((app) => {
        const role = (app.jobId?.position || "").toLowerCase();
        const company = (app.employerId?.company?.name || "").toLowerCase();
        return role.includes(query) || company.includes(query);
      });
    }
    switch (sortOption) {
      case "oldest":
        result.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        );
        break;
      case "score-high":
        result.sort(
          (a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0),
        );
        break;
      case "score-low":
        result.sort(
          (a, b) => (a.matchPercentage || 0) - (b.matchPercentage || 0),
        );
        break;
      default:
        result.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );
        break;
    }
    return result;
  }, [applications, localDeleted, statusFilter, searchQuery, sortOption]);

  const totalPages = Math.ceil(
    filteredAndSortedApps.length / ITEMS_PER_PAGE,
  );
  const paginatedApps = filteredAndSortedApps.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const statusCounts = useMemo(() => {
    const visible = applications.filter((app) => !localDeleted.has(app._id));
    const counts = { all: visible.length };
    STATUS_OPTIONS.forEach((opt) => {
      if (opt.value !== "all") {
        counts[opt.value] = visible.filter(
          (app) =>
            (app.status || "pending").toLowerCase() ===
            opt.value.toLowerCase(),
        ).length;
      }
    });

    return counts;
  }, [applications, localDeleted]);

  const getStatusInfo = (status) => {
    const s = (status || "pending").toLowerCase();
    if (s === "accepted" || s === "shortlisted")
      return {
        color: "var(--nm-success)",
        icon: <CheckCircle2 size={14} />,
        label: t("applications.accepted"),
      };
    if (s === "rejected")
      return {
        color: "var(--nm-error)",
        icon: <XCircle size={14} />,
        label: t("applications.rejected"),
      };
    return {
      color: "var(--nm-warning)",
      icon: <Clock size={14} />,
      label: t("applications.underReview"),
    };
  };

  return (
    <div className="min-h-screen bg-[var(--nm-bg)] text-[var(--nm-text-primary)]">
      <div className="dashboard-nav-area">
        <DashboardNav role="employee" />
      </div>

      <div className="dashboard-shell jd-shell py-8">
        <div className="jd-surface-stack mb-8 p-5 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-6">
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() =>
                  updateParam("status", opt.value === "all" ? "" : opt.value)
                }
                className={`px-4 py-2 text-xs font-bold uppercase tracking-tight border-2 transition-all ${statusFilter === opt.value
                  ? "bg-[var(--nm-ink)] text-white border-[var(--nm-ink)]"
                  : "bg-[var(--nm-surface)] text-[var(--nm-text-primary)] border-[var(--nm-ink)]/10 hover:border-[var(--nm-ink)]"
                  }`}
              >
                {t(opt.label)} ({statusCounts[opt.value] || 0})
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto items-center">
            <div className="relative w-full xl:w-[460px]">
              <Search
                size={18}
                className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--nm-text-tertiary)] z-10"
              />
              <input
                type="text"
                placeholder={t("applications.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => updateParam("search", e.target.value)}
                className="jd-input w-full bg-[var(--nm-surface)] text-[var(--nm-text-primary)] border-[var(--nm-ink)]"
                style={{ paddingLeft: "56px", height: "48px" }}
              />
            </div>
            <select
              value={sortOption}
              onChange={(e) => updateParam("sort", e.target.value)}
              className="jd-select w-full sm:w-44 bg-[var(--nm-surface)] text-[var(--nm-text-primary)] border-[var(--nm-ink)]"
              style={{ height: "48px" }}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {t(opt.label)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,400px)_1fr] gap-6 lg:gap-8 items-start">
          <div className={selectedApp ? "hidden lg:block" : "block"}>
            <ApplicationsList
              paginatedApps={paginatedApps}
              selectedApp={selectedApp}
              onSelectApp={setSelectedApp}
              getStatusInfo={getStatusInfo}
              loading={loading}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => updateParam("page", page)}
            />
          </div>

          <div className={`lg:sticky lg:top-8 ${selectedApp ? "block" : "hidden lg:block"}`}>
            <ApplicationDetails
              selectedApp={selectedApp}
              onEdit={handleEditApplication}
              onDelete={handleDeleteApplication}
              deletingId={deletingId}
              onBack={() => setSelectedApp(null)}
            />
          </div>
        </div>
      </div>

      {editJobId && editAppId && (
        <ApplyJobModal
          jobId={editJobId}
          appId={editAppId}
          onClose={handleCloseModal}
        />
      )}

      {confirmDelete && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="jd-panel bg-[var(--nm-surface)] max-w-md w-full p-8 shadow-[12px_12px_0_var(--nm-error)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-[var(--nm-error)] mb-6">
              <Trash2 size={24} />
              <h2 className="text-xl font-black uppercase tracking-tighter">
                {t("common.confirmDeletion")}
              </h2>
            </div>
            <p className="font-bold text-[var(--nm-text-secondary)] leading-relaxed mb-8">
              {t("applications.deleteWarn", { position: confirmDelete.jobId?.position || t("applications.untitledPosition") })}
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleConfirmDelete}
                className="py-4 bg-[var(--nm-error)] text-white font-black uppercase tracking-widest border-2 border-[var(--nm-ink)] shadow-[4px_4px_0_var(--nm-ink)] hover:shadow-none transition-all"
              >
                {t("common.delete")}
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                className="py-4 bg-[var(--nm-surface)] text-[var(--nm-text-primary)] font-black uppercase tracking-widest border-2 border-[var(--nm-ink)] hover:bg-[var(--nm-ink)] hover:text-white transition-all"
              >
                {t("common.cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
