import { useMemo } from "react";
import { PlusCircle, Briefcase, CheckCircle2, MapPin, AlertCircle } from "lucide-react";
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import useEmployerDash from '../../hooks/useEmployerDash';

import DashboardNav from '../../components/shared/DashboardNav';
import StatWidget from './components/StatWidget';
import CompanyProfileCard from './components/CompanyProfileCard';
import HiringPipelineCard from './components/HiringPipelineCard';
import ChartWidget from './components/ChartWidget';

export default function EmployerDash() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { fetchAll } = useEmployerDash();

  const {
    data: dashData,
    loading,
  } = useFetch(fetchAll, { initialData: { profile: null, jobs: [] } });

  const { profile = null, jobs = [] } = dashData;
  const company = profile?.company;
  const openJobs = useMemo(() => jobs.filter((j) => j.status === 'OPEN').length, [jobs]);
  const profileError = loading ? false : !profile;
  const goPostJob = () => navigate('/employer/post-job');

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
              {loading ? 'Loading Profile...' : company?.name ?? 'Corporate Entity'}
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

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2.5rem'
        }}>
          <StatWidget label="Live Listings"  value={loading ? '…' : openJobs}                              accent="var(--nm-warning)" icon={Briefcase}     />
          <StatWidget label="History Total"    value={loading ? '…' : jobs.length}                           accent="var(--nm-primary)" icon={CheckCircle2}  />
          <StatWidget label="Global Nodes"        value={loading ? '…' : (company?.branches?.length ?? '0')} accent="var(--nm-error)" icon={MapPin}        />
          <StatWidget label="Access Level"   value={loading ? '…' : (company ? 'Verified' : 'Pending')} accent="#A78BFA" icon={AlertCircle}   />
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
          gap: '1.5rem',
          alignItems: 'stretch'
        }}>
          <style>{`@media (min-width: 1024px) { .bento-grid { grid-template-columns: repeat(12, 1fr); } }`}</style>
          <div className="bento-grid" style={{ display: 'grid', gap: '1.5rem', alignItems: 'stretch' }}>
            <ChartWidget jobs={jobs} />
            <CompanyProfileCard company={company} loading={loading} error={profileError} />
            <HiringPipelineCard totalJobs={jobs.length} openJobs={openJobs} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
}
