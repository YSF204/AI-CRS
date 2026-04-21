import React, { useState, useMemo } from "react";
import { ClipboardList, Edit3, Loader, Search, ChevronLeft, ChevronRight, XCircle, CheckCircle2, Clock, Calendar, Building2, Filter } from "lucide-react";
import DashboardNav from "../../components/shared/DashboardNav";
import useFetch from "../../hooks/useFetch";
import api from "../../services/api";
import ApplyJobModal from "./ApplyJob/index.jsx";
import { useSearchParams } from "react-router-dom";

const ITEMS_PER_PAGE = 10;

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

  // Update URL params
  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    // Reset to page 1 when changing filters
    if (key !== "page") {
      newParams.set("page", "1");
    }
    setSearchParams(newParams);
  };

  const handleSearchChange = (e) => {
    updateParam("search", e.target.value);
  };

  const handleStatusChange = (status) => {
    updateParam("status", status === "all" ? "" : status);
  };

  const handleSortChange = (e) => {
    updateParam("sort", e.target.value);
  };

  const handlePageChange = (page) => {
    updateParam("page", page.toString());
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Filter and sort applications
  const filteredAndSortedApps = useMemo(() => {
    let result = [...applications];

    // Filter by status
    if (statusFilter && statusFilter !== "all") {
      result = result.filter(app =>
        (app.status || "pending").toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(app => {
        const role = (app.jobId?.position || "").toLowerCase();
        const company = (app.employerId?.company?.name || "").toLowerCase();
        return role.includes(query) || company.includes(query);
      });
    }

    // Sort
    switch (sortOption) {
      case "oldest":
        result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "score-high":
        result.sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0));
        break;
      case "score-low":
        result.sort((a, b) => (a.matchPercentage || 0) - (b.matchPercentage || 0));
        break;
      case "newest":
      default:
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }

    return result;
  }, [applications, statusFilter, searchQuery, sortOption]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedApps.length / ITEMS_PER_PAGE);
  const paginatedApps = filteredAndSortedApps.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Status counts
  const statusCounts = useMemo(() => {
    const counts = { all: applications.length };
    STATUS_OPTIONS.forEach(opt => {
      if (opt.value !== "all") {
        counts[opt.value] = applications.filter(app =>
          (app.status || "pending").toLowerCase() === opt.value.toLowerCase()
        ).length;
      }
    });
    return counts;
  }, [applications]);

  const getStatusClass = (status) => {
    const s = (status || "pending").toLowerCase();
    if (s === "accepted" || s === "shortlisted") return "accepted";
    if (s === "rejected") return "rejected";
    if (s === "under review") return "pending";
    return "pending";
  };

  const getScoreClass = (score) => {
    if (score == null) return "neutral";
    if (score >= 50) return "good";
    return "poor";
  };

  const getStatusDisplay = (status) => {
    const s = (status || "pending").toLowerCase();
    const statusClass = getStatusClass(status);

    let icon;
    if (s === "accepted" || s === "shortlisted") {
      icon = <CheckCircle2 size={12} aria-hidden="true" />;
    } else if (s === "rejected") {
      icon = <XCircle size={12} aria-hidden="true" />;
    } else {
      icon = <Clock size={12} aria-hidden="true" />;
    }

    return (
      <span className={`app-status-badge ${statusClass}`}>
        {icon}
        {status || "Pending"}
      </span>
    );
  };

  const getScoreDisplay = (score) => {
    if (score == null) {
      return (
        <div className="app-score-loading">
          <Loader className="animate-spin" size={12} aria-hidden="true" />
          <span>Calculating...</span>
        </div>
      );
    }

    const scoreClass = getScoreClass(score);
    return (
      <div className={`app-score-badge ${scoreClass}`}>
        <span className="app-score-label">Match</span>
        <span className="app-score-value">{score}%</span>
      </div>
    );
  };

  return (
    <div className="applications-page">
      <div className="dashboard-nav-area">
        <DashboardNav role="employee" />
      </div>

      <div className="dashboard-shell">
        {/* Header */}
        <header className="app-header">
          <div className="app-header-content">
            <div>
              <h1 className="app-header-title">
                <ClipboardList size={24} aria-hidden="true" />
                My Applications
              </h1>
              <p className="app-header-subtitle">
                Track and manage your job applications
              </p>
            </div>

            <div className="app-header-stats" role="region" aria-label="Application statistics">
              <div className="app-stat">
                <span className="app-stat-label">Total</span>
                <span className="app-stat-value">{applications.length}</span>
              </div>
              <div className="app-stat">
                <span className="app-stat-label">Filtered</span>
                <span className="app-stat-value primary">{filteredAndSortedApps.length}</span>
              </div>
              <div className="app-stat">
                <span className="app-stat-label">Pending</span>
                <span className="app-stat-value">{statusCounts.pending || 0}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Controls */}
        <div className="app-controls" role="toolbar" aria-label="Filter and sort applications">
          <div className="app-controls-inner">
            <div className="app-controls-left">
              {/* Status Tabs */}
              <div className="app-status-tabs" role="tablist" aria-label="Filter by status">
                {STATUS_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    className="app-status-tab"
                    role="tab"
                    aria-selected={statusFilter === option.value}
                    aria-controls="applications-list"
                    onClick={() => handleStatusChange(option.value)}
                  >
                    {option.label}
                    <span className="app-status-count">
                      {statusCounts[option.value] || 0}
                    </span>
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="app-search-wrapper">
                <Search className="app-search-icon" aria-hidden="true" />
                <input
                  type="text"
                  className="app-search-input"
                  placeholder="Search role or company..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  aria-label="Search applications"
                />
              </div>
            </div>

            <div className="app-controls-right">
              {/* Sort */}
              <select
                className="app-sort-select"
                value={sortOption}
                onChange={handleSortChange}
                aria-label="Sort applications"
              >
                {SORT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

      {/* Error State */}
      {error && (
        <div className="app-error-state" role="alert">
          <div className="app-error-title">
            <XCircle size={18} aria-hidden="true" />
            Error Loading Applications
          </div>
          <p className="app-error-message">
            {error.response?.data?.message || error.message || "Unable to load applications. Please try again."}
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="app-state-container">
          <div className="app-loading-spinner" aria-hidden="true" />
          <p className="app-state-description">Loading your applications...</p>
        </div>
      ) : applications.length === 0 ? (
        /* Empty State */
        <div className="app-state-container">
          <ClipboardList className="app-state-icon" aria-hidden="true" />
          <h2 className="app-state-title">No Applications Yet</h2>
          <p className="app-state-description">
            Start exploring job opportunities and submit your first application.
          </p>
        </div>
      ) : filteredAndSortedApps.length === 0 ? (
        /* No Results State */
        <div className="app-state-container">
          <Filter className="app-state-icon" aria-hidden="true" />
          <h2 className="app-state-title">No Matching Applications</h2>
          <p className="app-state-description">
            Try adjusting your search or filter criteria to find what you're looking for.
          </p>
        </div>
      ) : (
        /* Applications List */
        <>
          <div className="app-list-container">
            <ul className="app-list" role="list" id="applications-list" aria-live="polite">
              {paginatedApps.map((app) => {
                const statusLower = (app.status || "pending").toLowerCase();
                const canEdit = statusLower === "under review" || statusLower === "pending";

                return (
                  <li key={app._id}>
                    <article className="app-card">
                      <div className="app-card-left">
                        <h2 className="app-card-title">
                          {app.jobId?.position || "Unknown Role"}
                        </h2>
                        <p className="app-card-company">
                          <Building2 size={14} aria-hidden="true" />
                          {app.employerId?.company?.name || "Company"}
                        </p>
                        <div className="app-card-meta">
                          <span className="app-card-meta-item">
                            <Calendar size={12} aria-hidden="true" />
                            {new Date(app.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="app-card-right">
                        {getScoreDisplay(app.matchPercentage)}
                        {getStatusDisplay(app.status)}

                        {canEdit ? (
                          <button
                            className="app-action-btn"
                            onClick={() => handleEditApplication(app)}
                            aria-label={`Update application for ${app.jobId?.position || "this position"}`}
                          >
                            <Edit3 size={14} aria-hidden="true" />
                            Update
                          </button>
                        ) : (
                          <button
                            className="app-action-btn"
                            disabled
                            aria-label="Application locked - cannot be updated"
                          >
                            <CheckCircle2 size={14} aria-hidden="true" />
                            Locked
                          </button>
                        )}
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="app-pagination" aria-label="Pagination">
              <div className="app-pagination-inner">
                <span className="app-pagination-info">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedApps.length)} of {filteredAndSortedApps.length}
                </span>
                <button
                  className="app-pagination-btn"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} aria-hidden="true" />
                </button>

                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      className={`app-pagination-btn ${pageNum === currentPage ? "active" : ""}`}
                      onClick={() => handlePageChange(pageNum)}
                      aria-label={`Page ${pageNum}`}
                      aria-current={pageNum === currentPage ? "page" : undefined}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  className="app-pagination-btn"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                >
                  <ChevronRight size={16} aria-hidden="true" />
                </button>
              </div>
            </nav>
          )}
        </>
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
