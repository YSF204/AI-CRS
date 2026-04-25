import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  PlusCircle,
  Search,
  RefreshCcw,
  Edit3,
  Trash2,
  CheckCircle,
  XCircle,
  Power,
  PowerOff,
} from "lucide-react";
import { useDebounce } from "@uidotdev/usehooks";
import DashboardNav from "../../components/shared/DashboardNav";
import api from "../../services/api";
import useFetch from "../../hooks/useFetch";

const roles = ["", "EMPLOYEE", "EMPLOYER", "ADMIN"];
const statuses = ["", "ACTIVE", "INACTIVE", "PENDING"];

const statusClass = (status) => {
  switch (status) {
    case "ACTIVE":
      return "admin-status-chip active-blue";
    case "PENDING":
      return "admin-status-chip pending-blue";
    case "INACTIVE":
      return "admin-status-chip inactive-blue";
    default:
      return "admin-status-chip";
  }
};

export default function UserManagement() {
  const navigate = useNavigate();
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pendingDeleteUser, setPendingDeleteUser] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const debouncedSearch = useDebounce(search, 400);
  const debouncedRoleFilter = useDebounce(roleFilter, 250);
  const debouncedStatusFilter = useDebounce(statusFilter, 250);

  const fetchUsersApi = useCallback(async () => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (debouncedRoleFilter) params.set("role", debouncedRoleFilter);
    if (debouncedStatusFilter) params.set("accountStatus", debouncedStatusFilter);
    params.set("page", String(page));
    params.set("limit", "20");
    const res = await api.get(`/admin/users?${params.toString()}`);
    return res.data?.data || { users: [], pagination: {} };
  }, [debouncedSearch, debouncedRoleFilter, debouncedStatusFilter, page]);

  const {
    data: usersPayload,
    loading,
    error: fetchError,
    refetch: refetchUsers,
  } = useFetch(fetchUsersApi, {
    initialData: { users: [], pagination: {} },
    deps: [debouncedSearch, debouncedRoleFilter, debouncedStatusFilter, page],
  });

  useEffect(() => {
    setUsers(usersPayload?.users || []);
    setPagination(usersPayload?.pagination || {});
  }, [usersPayload]);

  useEffect(() => {
    if (fetchError) {
      setError(fetchError.response?.data?.message || "Unable to load users.");
    }
  }, [fetchError]);

  useEffect(() => {
    if (location.state?.message) {
      setMessage(location.state.message);
      window.history.replaceState({}, document.title, location.pathname);
    }
  }, [location.state, location.pathname]);

  const openDeleteDialog = (user) => {
    setPendingDeleteUser(user);
  };

  const closeDeleteDialog = () => {
    if (deleting) return;
    setPendingDeleteUser(null);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteUser) return;
    setDeleting(true);
    setError("");
    setMessage("");
    try {
      const userId = pendingDeleteUser._id || pendingDeleteUser.id;
      await api.delete(`/admin/users/${userId}`);
      setUsers((prev) =>
        prev.filter((item) => (item._id || item.id) !== userId),
      );
      setMessage("User deleted successfully.");
      setPendingDeleteUser(null);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete user.");
    } finally {
      setDeleting(false);
    }
  };

  // Fast status action
  const handleStatusUpdate = async (userId, newStatus) => {
    if (updatingStatus) return;

    setUpdatingStatus(userId);
    setError("");

    try {
      const res = await api.patch(`/admin/users/${userId}/status`, {
        accountStatus: newStatus,
      });

      setUsers((prev) =>
        prev.map((user) => {
          const id = user._id || user.id;
          if (id === userId) {
            return res.data.data.user || { ...user, accountStatus: newStatus };
          }
          return user;
        })
      );

      setMessage(`User status updated to ${newStatus}`);
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update user status.");
      // Rollback UI on error
      setUsers((prev) =>
        prev.map((user) => {
          const id = user._id || user.id;
          if (id === userId) {
            return { ...user }; // Keep original status
          }
          return user;
        })
      );
    } finally {
      setUpdatingStatus(null);
    }
  };

  return (
    <div className="admin-page">
      <div className="dashboard-nav-area">
        <DashboardNav role="admin" />
      </div>

      <div className="dashboard-shell">
        {/* Header */}
        <div className="admin-header">
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-4)',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
          }}>
            <div>
              <div style={{
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.18em',
                color: 'var(--nm-text-secondary)',
                marginBottom: 'var(--spacing-2)'
              }}>
                User Management
              </div>
              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: 700,
                letterSpacing: '-0.04em',
                lineHeight: 1,
                textTransform: 'uppercase',
                margin: 0,
                color: 'var(--nm-text-primary)'
              }}>
                Manage Platform Users
              </h1>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                color: 'var(--nm-text-secondary)',
                margin: 'var(--spacing-2) 0 0 0',
                maxWidth: '60ch'
              }}>
                List users, update account status, create new users, and remove inactive accounts.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/admin/users/new")}
              className="nm-btn nm-btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--spacing-2)',
                background: 'var(--nm-primary)',
                color: 'var(--nm-text-inverse)'
              }}
            >
              <PlusCircle size={18} strokeWidth={2.5} />
              Add User
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="admin-filter-bar">
          <div className="admin-filter-group">
            <label className="admin-filter-label">Search</label>
            <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search name or email"
                className="admin-filter-input"
                style={{ flex: 1 }}
              />
              <button
                type="button"
                onClick={() => setPage(1)}
                className="nm-btn"
                style={{ padding: 'var(--spacing-3)', minWidth: '44px' }}
              >
                <Search size={16} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          <div className="admin-filter-group">
            <label className="admin-filter-label">Role</label>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="admin-filter-select"
            >
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role || "All Roles"}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-filter-group">
            <label className="admin-filter-label">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="admin-filter-select"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status || "All Statuses"}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div className="admin-alert success">
            {message}
          </div>
        )}
        {error && (
          <div className="admin-alert error">
            {error}
          </div>
        )}

        {/* Users Table */}
        {loading ? (
          <div style={{
            padding: 'var(--spacing-12)',
            textAlign: 'center',
            color: 'var(--nm-text-secondary)'
          }}>
            Loading users...
          </div>
        ) : users.length === 0 ? (
          <div className="nm-card" style={{
            padding: 'var(--spacing-12)',
            textAlign: 'center',
            color: 'var(--nm-text-secondary)'
          }}>
            <Search size={48} style={{ marginBottom: 'var(--spacing-4)', opacity: 0.5 }} />
            <p style={{ margin: 0, fontSize: 'var(--text-lg)', fontWeight: 600 }}>
              No users found
            </p>
            <p style={{ margin: 0, fontSize: 'var(--text-sm)' }}>
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const userId = user._id || user.id;
                  const isUpdating = updatingStatus === userId;
                  const canUpdateStatus = user.role !== 'ADMIN' && user.accountStatus !== 'PENDING';

                  return (
                    <tr key={userId}>
                      <td>
                        <div style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: 'var(--text-sm)',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '-0.02em',
                          color: 'var(--nm-text-primary)',
                          marginBottom: 'var(--spacing-1)'
                        }}>
                          {user.firstName} {user.lastName}
                        </div>
                        <div style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: 'var(--text-sm)',
                          color: 'var(--nm-text-secondary)',
                          marginBottom: 'var(--spacing-1)'
                        }}>
                          {user.email}
                        </div>
                        <div style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: 'var(--text-xs)',
                          color: 'var(--nm-text-tertiary)',
                        }}>
                          {userId}
                        </div>
                      </td>
                      <td>
                        <span className="admin-status-chip">{user.role}</span>
                      </td>
                      <td>
                        <span className={statusClass(user.accountStatus)}>
                          {user.accountStatus}
                        </span>
                      </td>
                      <td>
                        <div style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: 'var(--text-sm)',
                          color: 'var(--nm-text-primary)'
                        }}>
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 'var(--spacing-2)', flexWrap: 'wrap' }}>
                          {/* Edit */}
                          <button
                            onClick={() => navigate(`/admin/users/${userId}/edit`)}
                            className="admin-action-btn"
                            title="Edit"
                          >
                            <Edit3 size={14} strokeWidth={2.5} />
                          </button>

                          {/* Fast Status Actions */}
                          {canUpdateStatus && user.accountStatus !== 'ACTIVE' && (
                            <button
                              onClick={() => handleStatusUpdate(userId, 'ACTIVE')}
                              className="admin-action-btn status-active"
                              disabled={isUpdating}
                              title="Activate"
                            >
                              <Power size={14} strokeWidth={2.5} />
                            </button>
                          )}
                          {canUpdateStatus && user.accountStatus !== 'INACTIVE' && (
                            <button
                              onClick={() => handleStatusUpdate(userId, 'INACTIVE')}
                              className="admin-action-btn status-inactive"
                              disabled={isUpdating}
                              title="Deactivate"
                            >
                              <PowerOff size={14} strokeWidth={2.5} />
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            onClick={() => openDeleteDialog(user)}
                            className="admin-action-btn status-delete"
                            title="Delete"
                          >
                            <Trash2 size={14} strokeWidth={2.5} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="admin-pagination">
              <div className="admin-pagination-info">
                Total users: {pagination.total ?? users.length} | Page {page} of {pagination.pages || 1}
              </div>
              <div className="admin-pagination-controls">
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page <= 1 || loading}
                  className="nm-btn"
                  style={{ padding: 'var(--spacing-2) var(--spacing-4)', minWidth: '100px' }}
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((prev) => prev + 1)}
                  disabled={page >= (pagination.pages || 1) || loading}
                  className="nm-btn"
                  style={{ padding: 'var(--spacing-2) var(--spacing-4)', minWidth: '100px' }}
                >
                  Next
                </button>
                <button
                  onClick={() => refetchUsers().catch(() => {})}
                  disabled={loading}
                  className="nm-btn"
                  style={{ padding: 'var(--spacing-2) var(--spacing-4)' }}
                >
                  <RefreshCcw size={16} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {pendingDeleteUser && (
        <div className="admin-modal">
          <div className="admin-modal-content">
            <h2 className="admin-modal-title">Confirm Delete</h2>
            <p className="admin-modal-description">
              Delete user{" "}
              <span style={{ fontWeight: 700, color: 'var(--nm-text-primary)' }}>
                {pendingDeleteUser.firstName} {pendingDeleteUser.lastName}
              </span>
              ? This action will deactivate the account.
            </p>

            <div className="admin-modal-actions">
              <button
                onClick={closeDeleteDialog}
                className="nm-btn"
                disabled={deleting}
                style={{
                  padding: 'var(--spacing-3) var(--spacing-5)',
                  background: '#3949ab',
                  color: 'white'
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="nm-btn"
                style={{
                  background: '#ba1a1a',
                  color: 'white',
                  padding: 'var(--spacing-3) var(--spacing-5)'
                }}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
