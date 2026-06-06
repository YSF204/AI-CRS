import React from 'react';
import { Edit3, Trash2, Power, PowerOff, RefreshCcw, Search } from 'lucide-react';
import { SkTable } from '../../../../components/ui/Skeleton';
import { useTranslation } from '../../../../context/LanguageContext';

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

export default function UsersTable({ users, updatingStatus, handleStatusUpdate, openDeleteDialog, navigate, pagination, page, setPage, refetchUsers, loading }) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="table-scroll-container">
        <SkTable rows={5} cols={5} />
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="nm-card" style={{
        padding: 'var(--spacing-12)',
        textAlign: 'center',
        color: 'var(--nm-text-secondary)'
      }}>
        <Search size={48} style={{ marginBottom: 'var(--spacing-4)', opacity: 0.5 }} />
        <p style={{ margin: 0, fontSize: 'var(--text-lg)', fontWeight: 600 }}>
          {t('admin.noUsersFound', {}, 'No users found')}
        </p>
        <p style={{ margin: 0, fontSize: 'var(--text-sm)' }}>
          {t('admin.noUsersFoundDesc', {}, 'Try adjusting your search or filter criteria')}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* ── Desktop / Tablet: scrollable table ── */}
      <div className="table-scroll-container users-desktop-table">
        <table className="admin-table">
        <thead>
          <tr>
            <th>{t('admin.name', {}, 'User')}</th>
            <th>{t('admin.role', {}, 'Role')}</th>
            <th>{t('admin.status', {}, 'Status')}</th>
            <th>{t('admin.joined', {}, 'Joined')}</th>
            <th>{t('admin.actions', {}, 'Actions')}</th>
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
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 'var(--spacing-2)', flexWrap: 'wrap' }}>
                    {/* Edit */}
                    <button
                      onClick={() => navigate(`/admin/users/${userId}/edit`)}
                      className="admin-action-btn"
                      title={t('admin.edit', {}, 'Edit')}
                    >
                      <Edit3 size={14} strokeWidth={2.5} />
                    </button>

                    {/* Fast Status Actions */}
                    {canUpdateStatus && user.accountStatus !== 'ACTIVE' && (
                      <button
                        onClick={() => handleStatusUpdate(userId, 'ACTIVE')}
                        className="admin-action-btn status-active"
                        disabled={isUpdating}
                        title={t('admin.activate', {}, 'Activate')}
                      >
                        <Power size={14} strokeWidth={2.5} />
                      </button>
                    )}
                    {canUpdateStatus && user.accountStatus !== 'INACTIVE' && (
                      <button
                        onClick={() => handleStatusUpdate(userId, 'INACTIVE')}
                        className="admin-action-btn status-inactive"
                        disabled={isUpdating}
                        title={t('admin.deactivate', {}, 'Deactivate')}
                      >
                        <PowerOff size={14} strokeWidth={2.5} />
                      </button>
                    )}

                    {/* Delete */}
                    <button
                      onClick={() => openDeleteDialog(user)}
                      className="admin-action-btn status-delete"
                      title={t('admin.delete', {}, 'Delete')}
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
      </div>

      {/* ── Mobile: card view ── */}
      <div className="users-mobile-cards">
        {users.map((user) => {
          const userId = user._id || user.id;
          const isUpdating = updatingStatus === userId;
          const canUpdateStatus = user.role !== 'ADMIN' && user.accountStatus !== 'PENDING';

          return (
            <div key={userId} className="user-mobile-card">
              {/* Card header */}
              <div className="user-mobile-card-header">
                <div className="user-mobile-card-name">
                  {user.firstName} {user.lastName}
                </div>
                <span className={statusClass(user.accountStatus)}>
                  {user.accountStatus}
                </span>
              </div>

              {/* Card body */}
              <div className="user-mobile-card-body">
                <div className="user-mobile-card-row">
                  <span className="user-mobile-card-label">{t('auth.email', {}, 'Email')}</span>
                  <span className="user-mobile-card-value">{user.email}</span>
                </div>
                <div className="user-mobile-card-row">
                  <span className="user-mobile-card-label">{t('admin.role', {}, 'Role')}</span>
                  <span className="admin-status-chip" style={{ fontSize: '10px', padding: '2px 8px' }}>{user.role}</span>
                </div>
                <div className="user-mobile-card-row">
                  <span className="user-mobile-card-label">{t('admin.joined', {}, 'Joined')}</span>
                  <span className="user-mobile-card-value">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                  </span>
                </div>
                <div className="user-mobile-card-row">
                  <span className="user-mobile-card-label">ID</span>
                  <span className="user-mobile-card-value user-mobile-card-id">{userId}</span>
                </div>
              </div>

              {/* Card actions */}
              <div className="user-mobile-card-actions">
                <button
                  onClick={() => navigate(`/admin/users/${userId}/edit`)}
                  className="admin-action-btn user-mobile-action-btn"
                >
                  {t('admin.edit', {}, 'Edit')}
                </button>

                {canUpdateStatus && user.accountStatus !== 'ACTIVE' && (
                  <button
                    onClick={() => handleStatusUpdate(userId, 'ACTIVE')}
                    className="admin-action-btn status-active user-mobile-action-btn"
                    disabled={isUpdating}
                  >
                    {t('admin.activate', {}, 'Activate')}
                  </button>
                )}
                {canUpdateStatus && user.accountStatus !== 'INACTIVE' && (
                  <button
                    onClick={() => handleStatusUpdate(userId, 'INACTIVE')}
                    className="admin-action-btn status-inactive user-mobile-action-btn"
                    disabled={isUpdating}
                  >
                    {t('admin.deactivate', {}, 'Deactivate')}
                  </button>
                )}

                <button
                  onClick={() => openDeleteDialog(user)}
                  className="admin-action-btn status-delete user-mobile-action-btn"
                >
                  {t('admin.delete', {}, 'Delete')}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="admin-pagination">
        <div className="admin-pagination-info">
          {t('admin.totalUsers', {}, 'Total Users')}: {pagination.total ?? users.length} | {t('common.page')} {page} {t('common.of')} {pagination.pages || 1}
        </div>
        <div className="admin-pagination-controls">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page <= 1 || loading}
            className="nm-btn"
            style={{ padding: 'var(--spacing-2) var(--spacing-4)', minWidth: '100px' }}
          >
            {t('common.previous')}
          </button>
          <button
            onClick={() => setPage((prev) => prev + 1)}
            disabled={page >= (pagination.pages || 1) || loading}
            className="nm-btn"
            style={{ padding: 'var(--spacing-2) var(--spacing-4)', minWidth: '100px' }}
          >
            {t('common.next')}
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
  );
}
