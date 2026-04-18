import React from 'react';
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

/**
 * Application Status Configuration with Paper design tokens
 * Explicit state variants: default, hover, focus-visible, active, disabled, loading, error
 */
export const STATUS_CONFIG = {
  'Under Review': {
    bg: 'var(--color-warning)',
    bgLight: 'var(--color-warning-light)',
    text: 'var(--color-text-primary)',
    Icon: Clock,
    state: 'pending'
  },
  'Shortlisted': {
    bg: 'var(--color-success)',
    bgLight: 'var(--color-success-light)',
    text: 'var(--color-text-primary)',
    Icon: CheckCircle,
    state: 'active'
  },
  'Rejected': {
    bg: 'var(--color-danger)',
    bgLight: 'var(--color-danger-light)',
    text: 'var(--color-text-primary)',
    Icon: XCircle,
    state: 'error'
  },
  'Pending': {
    bg: 'var(--color-warning)',
    bgLight: 'var(--color-warning-light)',
    text: 'var(--color-text-primary)',
    Icon: Clock,
    state: 'pending'
  }
};

/**
 * ApplicationItem — renders a single application row with explicit state variants.
 * Paper design system: clear hierarchy, semantic tokens, accessible states.
 *
 * @param {Object} app - Application data
 * @param {boolean} isSelected - Selection state
 * @param {Function} onClick - Click handler
 */
export default function ApplicationItem({ app, isSelected, onClick }) {
  // Normalize status to handle different case formats
  const normalizedStatus = app.status
    ? Object.keys(STATUS_CONFIG).find(
        key => key.toLowerCase() === app.status.toLowerCase().replace(/_/g, ' ')
      ) || 'Pending'
    : 'Pending';

  const { bg, bgLight, text, Icon, state } = STATUS_CONFIG[normalizedStatus] || STATUS_CONFIG['Pending'];

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 rounded-lg transition-all duration-200 cursor-default ${
        isSelected ? 'bg-[var(--color-primary-light)] border border-[var(--color-primary)]' : 'hover:bg-[var(--bg-alt)]'
      }`}
      role="listitem"
      aria-selected={isSelected}
    >
      {/* Left: role details */}
      <div className="flex-1 min-w-0">
        <p
          className="font-bold font-['Montserrat'] text-base uppercase tracking-tight truncate"
          style={{ color: isSelected ? 'var(--color-primary)' : 'var(--color-text-primary)' }}
        >
          {app.role || app.jobId?.position || 'Unknown Role'}
        </p>
        <p className="font-mono text-xs mt-0.5 truncate" style={{ color: isSelected ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}>
          {app.company || app.employerId?.company?.name || 'Unknown Company'}
        </p>
        <p className="font-mono text-xs mt-1" style={{ color: isSelected ? 'var(--color-primary)' : 'var(--color-text-tertiary)' }}>
          {app.date || new Date(app.createdAt || Date.now()).toLocaleDateString()}
        </p>
      </div>

      {/* Right: status badge with explicit states */}
      <span
        className="flex items-center gap-2 px-3 py-1.5 font-bold text-xs font-mono border-2 border-[var(--color-text-primary)] self-start sm:self-auto shrink-0 transition-all duration-200"
        style={{
          background: isSelected ? 'rgba(255,255,255,0.5)' : bg,
          color: 'var(--color-text-primary)',
        }}
        role="status"
        aria-label={`Status: ${normalizedStatus}, ${state} state`}
      >
        <Icon size={12} aria-hidden="true" />
        {normalizedStatus}
      </span>
    </div>
  );
}
