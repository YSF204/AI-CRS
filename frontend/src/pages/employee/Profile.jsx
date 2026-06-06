import React, { useEffect, useMemo, useState } from 'react';
import '../../styles/job-discovery.css';
import { User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/LanguageContext';
import DashboardNav from '../../components/shared/DashboardNav';
import StatsBar from '../../components/shared/StatsBar';
import ProfileHeader from '../../components/employee/ProfileHeader';
import ProfileForm from '../../components/employee/ProfileForm';
import SecuritySettings from '../../components/employee/SecuritySettings';
import api from '../../services/api';
import useFetch from '../../hooks/useFetch';

/**
 * Profile — composes ProfileHeader + ProfileForm + SecuritySettings.
 * Responsible only for layout/composition and data passing.
 */
export default function Profile() {
  const { user, logout, updateUserState, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const { t } = useTranslation();
  const { data: statsState = { cvs: 0, jobs: 0 } } = useFetch(async () => {
    const [cvsRes, jobsRes] = await Promise.all([api.get('/cvs'), api.get('/jobs')]);
    return {
      cvs: cvsRes.data?.data?.cvs?.length || 0,
      jobs: jobsRes.data?.data?.jobs?.length || 0,
    };
  }, { initialData: { cvs: 0, jobs: 0 } });

  const stats = useMemo(
    () => ([
      { label: t('employee.cvsOnFile', {}, 'CVs on File'), value: statsState.cvs, color: 'var(--nm-primary)' },
      { label: t('employee.jobMatches', {}, 'Job Matches'), value: statsState.jobs, color: 'var(--nm-warning)' },
      { label: t('admin.role', {}, 'User Role'), value: user?.role || 'EMPLOYEE', color: 'var(--nm-success)' },
    ]),
    [statsState, user?.role, t],
  );

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const handleSaveProfile = async (updatedData) => {
    const originalUser = { ...user };
    setError('');

    // Optimistic Update
    updateUserState({ ...user, ...updatedData });

    try {
      const res = await api.patch('/users/updateMe', updatedData);
      updateUserState(res.data?.data?.user);
    } catch (err) {
      setError(err.response?.data?.message || t('toast.failed_to_update_profile', {}, 'Unable to update profile.'));
      // Revert
      updateUserState(originalUser);
    }
  };

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="profile-page min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <div className="dashboard-nav-area">
        <DashboardNav role="employee" />
      </div>

      <div className="dashboard-shell jd-shell py-6 lg:py-8">


        {error && (
          <div className="mb-6 jd-surface-stack" style={{ borderColor: 'var(--nm-error)' }}>
            <p className="font-mono text-sm text-[var(--nm-error)] m-0 font-bold uppercase py-1">
              Error: {error}
            </p>
          </div>
        )}

        {/* Header card */}
        <div className="mb-8">
          <ProfileHeader user={user} />
        </div>

        {/* Forms stack */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">
          <div className="md:col-span-7">
            <ProfileForm user={user} onSave={handleSaveProfile} />
          </div>
          <div className="md:col-span-5">
            <SecuritySettings />
          </div>
        </div>
      </div>
    </div>
  );
}
