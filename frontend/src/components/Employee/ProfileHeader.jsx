import React from 'react';
import { User, Mail, Briefcase, MapPin, Camera } from 'lucide-react';

/**
 * ProfileHeader — displays the user's avatar (initials), name, role,
 * and key stats. Purely presentational.
 */
export default function ProfileHeader({ user }) {
  const initials = (user?.fullName ?? user?.email ?? 'U')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="brutal-card bg-(--card-bg) overflow-hidden mb-6">
      {/* Accent bar */}
      <div className="h-3 w-full" style={{ background: 'var(--teal)' }} />

      <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div
            className="w-20 h-20 border-4 border-black flex items-center justify-center font-bold text-2xl font-['Space_Grotesk']"
            style={{ background: 'var(--yellow)', color: '#0a0a0a' }}
          >
            {initials}
          </div>
          <button
            className="absolute -bottom-2 -right-2 w-7 h-7 flex items-center justify-center border-2 border-black"
            style={{ background: 'var(--teal)', color: '#0a0a0a' }}
            title="Change avatar"
          >
            <Camera size={13} />
          </button>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold font-['Space_Grotesk'] uppercase tracking-tight truncate">
            {user?.fullName ?? 'Your Name'}
          </h2>

          <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2">
            <span className="flex items-center gap-1.5 font-mono text-sm text-(--fg-muted)">
              <Mail size={13} />
              {user?.email ?? '—'}
            </span>
            <span className="flex items-center gap-1.5 font-mono text-sm text-(--fg-muted)">
              <Briefcase size={13} />
              {user?.role ?? 'EMPLOYEE'}
            </span>
            {user?.location && (
              <span className="flex items-center gap-1.5 font-mono text-sm text-(--fg-muted)">
                <MapPin size={13} />
                {user.location}
              </span>
            )}
          </div>
        </div>

        {/* Status badge */}
        <span
          className="px-3 py-1 text-xs font-bold font-mono border-2 border-black shrink-0 self-start"
          style={{ background: 'var(--mint)', color: '#0a0a0a' }}
        >
          ACTIVE
        </span>
      </div>
    </div>
  );
}
