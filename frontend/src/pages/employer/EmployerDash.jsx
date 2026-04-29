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

      <div className="dashboard-shell" style={{ padding: 'var(--spacing-8)' }}>
        {/* Greeting + Post button */}
        <div style={{
          marginBottom: '3.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: 'var(--spacing-6)'
        }}>
          <div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: '14px',
              fontWeight: 800,
              color: 'var(--nm-text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              marginBottom: '8px'
            }}>
              {profileLoading ? 'Loading Profile...' : company?.name ?? 'Corporate Entity'}
            </div>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 900,
              fontSize: 'clamp(2.5rem, 6vw, 3.5rem)',
              color: 'var(--nm-text-primary)',
              letterSpacing: '-0.04em',
              lineHeight: 1,
              textTransform: 'uppercase',
              margin: 0
            }}>
              Command Center
            </h1>
          </div>
          <button
            onClick={goPostJob}
            className="nm-btn"
            style={{
              background: 'var(--nm-primary)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-3)',
              padding: '16px 32px',
              fontSize: '15px',
              fontWeight: 800
            }}
          >
            <PlusCircle size={20} strokeWidth={3} />
            Initialize Listing
          </button>
        </div>

        {/* Stat row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2.5rem'
        }}>
          <StatWidget label="Live Listings"  value={jobsLoading ? '…' : openJobs}                              accent="var(--nm-warning)" icon={Briefcase}     />
          <StatWidget label="History Total"    value={jobsLoading ? '…' : jobs.length}                           accent="var(--nm-primary)" icon={CheckCircle2}  />
          <StatWidget label="Global Nodes"        value={profileLoading ? '…' : (company?.branches?.length ?? '0')} accent="var(--nm-error)" icon={MapPin}        />
          <StatWidget label="Access Level"   value={profileLoading ? '…' : (company ? 'Verified' : 'Pending')} accent="#A78BFA" icon={AlertCircle}   />
        </div>

        {/* Main Bento Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
          gap: '1.5rem',
          alignItems: 'stretch'
        }}>
          <style>{`@media (min-width: 1024px) { .bento-grid { grid-template-columns: repeat(12, 1fr); } }`}</style>
          <div className="bento-grid" style={{ display: 'grid', gap: '1.5rem', alignItems: 'stretch' }}>

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
