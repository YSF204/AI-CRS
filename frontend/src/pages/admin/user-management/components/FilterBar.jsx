import React from 'react';
import { Search } from 'lucide-react';
import { useTranslation } from '../../../../context/LanguageContext';

export default function FilterBar({ search, setSearch, setPage, roleFilter, setRoleFilter, statusFilter, setStatusFilter }) {
  const { t } = useTranslation();

  const roles = [
    { value: "", label: t('admin.allRoles', {}, "All Roles") },
    { value: "EMPLOYEE", label: t('admin.employeesLabel', {}, "Employee") },
    { value: "EMPLOYER", label: t('admin.employersLabel', {}, "Employer") },
    { value: "ADMIN", label: t('admin.adminsLabel', {}, "Admin") }
  ];

  const statuses = [
    { value: "", label: t('admin.allStatuses', {}, "All Statuses") },
    { value: "ACTIVE", label: t('admin.activeLabel', {}, "Active") },
    { value: "INACTIVE", label: t('admin.inactiveLabel', {}, "Inactive") },
    { value: "PENDING", label: t('admin.pendingLabel', {}, "Pending") }
  ];

  return (
    <div className="admin-filter-bar">
      <div className="admin-filter-group">
        <label htmlFor="um-filter-search" className="admin-filter-label">{t('admin.searchUsers', {}, 'Search')}</label>
        <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
          <input
            id="um-filter-search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={t('admin.searchUsers', {}, "Search users by name or email...")}
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
        <label htmlFor="um-filter-role" className="admin-filter-label">{t('admin.role', {}, 'Role')}</label>
        <div className="admin-filter-select-wrap">
          <select
            id="um-filter-role"
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="admin-filter-select"
          >
            {roles.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="admin-filter-group">
        <label htmlFor="um-filter-status" className="admin-filter-label">{t('admin.status', {}, 'Status')}</label>
        <div className="admin-filter-select-wrap">
          <select
            id="um-filter-status"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="admin-filter-select"
          >
            {statuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
