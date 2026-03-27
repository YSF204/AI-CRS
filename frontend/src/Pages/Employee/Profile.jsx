import React from 'react';
import { User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardNav from '../../components/shared/DashboardNav';
import StatsBar from '../../components/shared/StatsBar';
import ProfileHeader from '../../components/Employee/ProfileHeader';
import ProfileForm from '../../components/Employee/ProfileForm';
import SecuritySettings from '../../components/Employee/SecuritySettings';

const STATS = [
  { label: 'Applications', value: 4, color: 'var(--blue)'  },
  { label: 'CVs',          value: 3, color: 'var(--coral)' },
  { label: 'Interviews',   value: 1, color: 'var(--mint)'  },
];

/**
 * Profile — composes ProfileHeader + ProfileForm + SecuritySettings.
 * Responsible only for layout/composition and data passing.
 */
export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSaveProfile = (updatedData) => {
    // TODO: call PATCH /auth/me with updatedData
    console.log('Saving profile:', updatedData);
  };

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen p-8 bg-(--bg) text-(--fg)">
      <div className="max-w-4xl mx-auto">
        <DashboardNav role="employee" />

        {/* Page heading */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-['Space_Grotesk'] uppercase tracking-tight flex items-center gap-3">
              <User size={28} className="text-(--teal)" />
              My Profile
            </h1>
            <p className="font-mono text-sm text-(--fg-muted) mt-1">
              Manage your personal info and account security
            </p>
          </div>

          {/* Sign-out button */}
          <button
            onClick={handleSignOut}
            className="brutal-btn px-5 py-2.5 font-bold flex items-center gap-2 text-sm shrink-0"
            style={{ background: 'var(--coral)', color: '#0a0a0a' }}
          >
            <LogOut size={15} />
            SIGN OUT
          </button>
        </div>

        {/* Quick stats */}
        <StatsBar stats={STATS} className="mb-6" />

        {/* Header card */}
        <ProfileHeader user={user} />

        {/* Two-section stack */}
        <div className="flex flex-col gap-6">
          <ProfileForm user={user} onSave={handleSaveProfile} />
          <SecuritySettings />
        </div>
      </div>
    </div>
  );
}
