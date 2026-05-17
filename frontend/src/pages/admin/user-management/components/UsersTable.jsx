import React from 'react';
import { Edit3, Trash2, Power, PowerOff, RefreshCcw, Search } from 'lucide-react';
import { SkTable } from '../../../../components/ui/Skeleton';

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
          No users found
        </p>
        <p style={{ margin: 0, fontSize: 'var(--text-sm)' }}>
          Try adjusting your search or filter criteria
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="table-scroll-container">
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
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
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
      </div>

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
  );
}
