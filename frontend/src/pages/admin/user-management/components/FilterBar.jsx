import React from 'react';
import { Search } from 'lucide-react';

const roles = ["", "EMPLOYEE", "EMPLOYER", "ADMIN"];
const statuses = ["", "ACTIVE", "INACTIVE", "PENDING"];

export default function FilterBar({ search, setSearch, setPage, roleFilter, setRoleFilter, statusFilter, setStatusFilter }) {
  return (
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
  );
}
