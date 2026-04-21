import React from 'react';
import { User, Mail, Briefcase, MapPin, Camera } from 'lucide-react';

/**
 * ProfileHeader — displays the user's avatar (initials), name, role,
 * and key stats. Purely presentational.
 */
export default function ProfileHeader({ user }) {
  const fullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
  const initials = (fullName || user?.email || 'U')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="nm-card profile-header-card overflow-hidden">
      {/* Accent bar */}
      <div className="h-3 w-full bg-[var(--nm-primary)]" />

      <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div
            className="w-20 h-20 border-4 border-[var(--nm-ink)] flex items-center justify-center font-bold text-2xl font-display bg-[var(--nm-warning)] text-[var(--nm-ink)]"
          >
            {initials}
          </div>
          <button
            className="absolute -bottom-2 -right-2 w-8 h-8 flex items-center justify-center border-4 border-[var(--nm-ink)] bg-[var(--nm-primary)] text-white hover:translate-x-[2px] hover:translate-y-[2px] transition-transform"
            title="Change avatar"
          >
            <Camera size={14} />
          </button>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold font-display uppercase tracking-tight truncate text-[var(--fg)]">
            {fullName || 'Your Name'}
          </h2>

          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3">
            <span className="flex items-center gap-2 font-mono text-sm text-[var(--fg-muted)]">
              <Mail size={14} className="text-[var(--nm-primary)]" />
              {user?.email ?? '—'}
            </span>
            <span className="flex items-center gap-2 font-mono text-sm text-[var(--fg-muted)]">
              <Briefcase size={14} className="text-[var(--nm-primary)]" />
              {user?.role ?? 'EMPLOYEE'}
            </span>
            <span className="flex items-center gap-2 font-mono text-sm text-[var(--fg-muted)]">
              <MapPin size={14} className="text-[var(--nm-primary)]" />
              {user?.telephone?.[0] || 'No phone set'}
            </span>
          </div>
        </div>

        {/* Status badge */}
        <span
          className="nm-status-pill active shrink-0 self-start sm:self-center"
        >
          ACTIVE
        </span>
      </div>
    </div>
  );
}
