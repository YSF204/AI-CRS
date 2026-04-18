import React, { useMemo, useState } from 'react';
import { User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardNav from '../../components/shared/DashboardNav';
import StatsBar from '../../components/shared/StatsBar';
import ProfileHeader from '../../components/Employee/ProfileHeader';
import ProfileForm from '../../components/Employee/ProfileForm';
import SecuritySettings from '../../components/Employee/SecuritySettings';
import api from '../../services/api';
import useFetch from '../../hooks/useFetch';

/**
 * Profile — composes ProfileHeader + ProfileForm + SecuritySettings.
 * Responsible only for layout/composition and data passing.
 */
export default function Profile() {
  const { user, logout, updateUserState } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const { data: statsState = { cvs: 0, jobs: 0 } } = useFetch(async () => {
    const [cvsRes, jobsRes] = await Promise.all([api.get('/cvs'), api.get('/jobs')]);
    return {
      cvs: cvsRes.data?.data?.cvs?.length || 0,
      jobs: jobsRes.data?.data?.jobs?.length || 0,
    };
  }, { initialData: { cvs: 0, jobs: 0 } });

  const stats = useMemo(
    () => ([
      { label: 'Open Jobs', value: statsState.jobs, color: 'var(--blue)' },
      { label: 'CVs', value: statsState.cvs, color: 'var(--coral)' },
      { label: 'Role', value: user?.role || 'EMPLOYEE', color: 'var(--mint)' },
    ]),
    [statsState, user?.role],
  );

  const handleSaveProfile = async (updatedData) => {
    setError('');
    try {
      const res = await api.patch('/users/updateMe', updatedData);
      updateUserState(res.data?.data?.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update profile.');
    }
  };

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen p-8 bg-(--bg) text-(--fg)">
      <div className="dashboard-shell">
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
        <StatsBar stats={stats} className="mb-6" />

        {error && (
          <div className="mb-6 brutal-card p-4 bg-(--coral) text-black font-mono text-sm">
            {error}
          </div>
        )}

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
