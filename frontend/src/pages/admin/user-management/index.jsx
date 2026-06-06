import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import { useDebounce } from '@uidotdev/usehooks';
import DashboardNav from '../../../components/shared/DashboardNav';
import api from '../../../services/api';
import useFetch from '../../../hooks/useFetch';
import FilterBar from './components/FilterBar';
import UsersTable from './components/UsersTable';
import { useTranslation } from '../../../context/LanguageContext';

export default function UserManagement() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
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
    key: `${debouncedSearch}|${debouncedRoleFilter}|${debouncedStatusFilter}|${page}`,
  });

  useEffect(() => {
    setUsers(usersPayload?.users || []);
    setPagination(usersPayload?.pagination || {});
  }, [usersPayload]);

  useEffect(() => {
    if (fetchError) {
      setError(fetchError.response?.data?.message || t('admin.unableLoadUsers', {}, "Unable to load users."));
    }
  }, [fetchError, t]);

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
      setMessage(t('toast.user_deleted', {}, "User deleted successfully."));
      setPendingDeleteUser(null);
    } catch (err) {
      setError(err.response?.data?.message || t('admin.unableDeleteUser', {}, "Unable to delete user."));
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

      setMessage(t('admin.userStatusUpdated', { status: newStatus }, `User status updated to ${newStatus}`));
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || t('admin.failedUpdateUserStatus', {}, "Failed to update user status."));
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
          <div className="admin-header-row">
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
                {t('admin.userManagement', {}, 'User Management')}
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
                {t('admin.managePlatformUsers', {}, 'Manage Platform Users')}
              </h1>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                color: 'var(--nm-text-secondary)',
                margin: 'var(--spacing-2) 0 0 0',
                maxWidth: '60ch'
              }}>
                {t('admin.managePlatformUsersDesc', {}, 'List users, update account status, create new users, and remove inactive accounts.')}
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
              {t('admin.addUser', {}, 'Add User')}
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <FilterBar
          search={search}
          setSearch={setSearch}
          setPage={setPage}
          roleFilter={roleFilter}
          setRoleFilter={setRoleFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />

        {/* Messages */}
        {message && (
          <div className="admin-toast" role="status" aria-live="polite">
            {message}
          </div>
        )}
        {error && (
          <div className="admin-alert error">
            {error}
          </div>
        )}

        {/* Users Table */}
        <UsersTable
          users={users}
          updatingStatus={updatingStatus}
          handleStatusUpdate={handleStatusUpdate}
          openDeleteDialog={openDeleteDialog}
          navigate={navigate}
          pagination={pagination}
          page={page}
          setPage={setPage}
          refetchUsers={refetchUsers}
          loading={loading}
        />
      </div>

      {/* Delete Confirmation Modal */}
      {pendingDeleteUser && (
        <div className="admin-modal">
          <div className="admin-modal-content">
            <h2 className="admin-modal-title">{t('admin.confirmDelete', {}, 'Confirm Delete')}</h2>
            <p className="admin-modal-description">
              {t('admin.deleteUserWarn', { name: `${pendingDeleteUser.firstName} ${pendingDeleteUser.lastName}` }, `Delete user ${pendingDeleteUser.firstName} ${pendingDeleteUser.lastName}? This action will deactivate the account.`)}
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
                {t('common.cancel')}
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
                {deleting ? t('admin.deleting', {}, "Deleting...") : t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
