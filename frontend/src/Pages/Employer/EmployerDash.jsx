import { useState } from 'react';
import { PlusCircle, Briefcase, CheckCircle2, MapPin, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import useFetch from '../../hooks/useFetch';

import DashboardNav from '../../components/shared/DashboardNav';
import StatWidget from './components/StatWidget';
import CompanyProfileCard from './components/CompanyProfileCard';
import HiringPipelineCard from './components/HiringPipelineCard';
import ChartWidget from './components/ChartWidget';

export default function EmployerDash() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // ── Data state ──────────────────────────────────────────────── //
  const {
    data: profile = null,
    loading: profileLoading,
    error: profileFetchError,
  } = useFetch(async () => {
    const res = await api.get('/employers');
    return res.data?.data?.employer || null;
  }, { initialData: null });

  const {
    data: jobs = [],
    loading: jobsLoading,
  } = useFetch(async () => {
    const res = await api.get('/jobs/employer/me');
    return res.data?.data?.jobs || [];
  }, { initialData: [], deps: [user?.id || user?._id] });

  const profileError = Boolean(profileFetchError);

  // ── Derived values ───────────────────────────────────────────── //
  const company = profile?.company;
  const openJobs = jobs.filter((j) => j.status === 'OPEN').length;

  const goPostJob = () => navigate('/employer/post-job');

  // ── Layout ───────────────────────────────────────────────────── //
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--nm-bg)',
      color: 'var(--nm-text-primary)',
      fontFamily: 'var(--font-body)',
      overflowX: 'hidden'
    }}>
      <div className="dashboard-nav-area">
        <DashboardNav role="employer" />
      </div>

      <div className="dashboard-shell" style={{ padding: 'var(--spacing-6)' }}>
        {/* Greeting + Post button */}
        <div style={{
          marginBottom: 'clamp(1.5rem, 3%, 2.5rem)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: 'var(--spacing-4)'
        }}>
          <div>
            <div style={{
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--nm-text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '6px'
            }}>
              {profileLoading ? 'Loading Profile...' : company?.name ?? 'Your Company'}
            </div>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 'clamp(2rem, 5vw, 3.2rem)',
              color: 'var(--nm-text-primary)',
              letterSpacing: '-0.04em',
              lineHeight: 1,
              textTransform: 'uppercase',
              margin: 0
            }}>
              Employer Dashboard
            </h1>
          </div>
          <button
            onClick={goPostJob}
            className="nm-btn nm-btn-primary"
            style={{
              background: '#FFE630',
              color: '#0a0a0a',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-2)',
              padding: '14px 26px'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translate(2px, 2px)';
              e.currentTarget.style.boxShadow = '-2px -2px 0 var(--nm-ink)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = '';
              e.currentTarget.style.boxShadow = '';
            }}
          >
            <PlusCircle size={18} strokeWidth={2.5} />
            Post New Listing
          </button>
        </div>

        {/* Stat row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'clamp(1rem, 2vw, 1.5rem)',
          marginBottom: 'clamp(1.5rem, 3%, 2.5rem)'
        }}>
          <StatWidget label="Open Positions"  value={jobsLoading ? '…' : openJobs}                              accent="#FFE630" icon={Briefcase}     />
          <StatWidget label="Total Posted"    value={jobsLoading ? '…' : jobs.length}                           accent="#4ECDC4" icon={CheckCircle2}  />
          <StatWidget label="Branches"        value={profileLoading ? '…' : (company?.branches?.length ?? '0')} accent="#FF6B6B" icon={MapPin}        />
          <StatWidget label="System Status"   value={profileLoading ? '…' : (company ? 'Active' : 'Setup Req')} accent="#A78BFA" icon={AlertCircle}   />
        </div>

        {/* Main Bento Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
          gap: 'clamp(1rem, 2vw, 1.5rem)',
          alignItems: 'stretch'
        }}>
          <style>{`@media (min-width: 1024px) { .bento-grid { grid-template-columns: repeat(12, 1fr); } }`}</style>
          <div className="bento-grid" style={{ display: 'grid', gap: 'clamp(1rem, 2vw, 1.5rem)', alignItems: 'stretch' }}>

            {/* Chart spans 8, Profile spans 4 */}
            <ChartWidget jobs={jobs} />
            <CompanyProfileCard company={company} loading={profileLoading} error={profileError} />

            {/* Pipeline spans 12 */}
            <HiringPipelineCard totalJobs={jobs.length} openJobs={openJobs} loading={jobsLoading} />
          </div>
        </div>

      </div>
    </div>
  );
}
