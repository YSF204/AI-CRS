import { useMemo } from "react";
import { PlusCircle, Briefcase, CheckCircle2, MapPin } from "lucide-react";
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import useEmployerDash from '../../hooks/useEmployerDash';

import DashboardNav from '../../components/shared/DashboardNav';
import StatWidget from './components/StatWidget';
import CompanyProfileCard from './components/CompanyProfileCard';
import HiringPipelineCard from './components/HiringPipelineCard';
import ChartWidget from './components/ChartWidget';
import { useTranslation } from '../../context/LanguageContext';

export default function EmployerDash() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
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
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--nm-bg)',
        color: 'var(--nm-text-primary)',
        fontFamily: 'var(--font-body)',
        overflowX: 'hidden',
      }}
    >
      <div className="dashboard-nav-area">
        <DashboardNav role="employer" />
      </div>

      <div className="dashboard-shell">

        {/* ── Page Header ── */}
        <div className="employer-dash-header">
          <div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '12px',
                fontWeight: 800,
                color: 'var(--nm-text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                marginBottom: '6px',
              }}
            >
              {loading ? t('employer.loading') : (company?.name ?? 'Company')}
            </div>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 900,
                fontSize: 'clamp(2rem, 6vw, 3.5rem)',
                color: 'var(--nm-text-primary)',
                letterSpacing: '-0.04em',
                lineHeight: 1,
                textTransform: 'uppercase',
                margin: 0,
              }}
            >
              {t('dashboard.dashboard')}
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
              gap: '8px',
              padding: '12px 20px',
              fontSize: '14px',
              fontWeight: 800,
              whiteSpace: 'nowrap',
              minHeight: 44,
              flexShrink: 0,
            }}
          >
            <PlusCircle size={18} strokeWidth={3} />
            {t('dashboard.postJob')}
          </button>
        </div>

        {/* ── Stat Widgets ── */}
        <div className="employer-stats-grid">
          <StatWidget
            label={t('employer.openJobs')}
            value={loading ? '…' : openJobs}
            accent="var(--nm-warning)"
            icon={Briefcase}
          />
          <StatWidget
            label={t('employer.totalJobs')}
            value={loading ? '…' : jobs.length}
            accent="var(--nm-primary)"
            icon={CheckCircle2}
          />
          <StatWidget
            label={t('employer.locations')}
            value={loading ? '…' : (company?.branches?.length ?? '0')}
            accent="var(--nm-error)"
            icon={MapPin}
          />
        </div>

        {/* ── Bento Grid ── */}
        <div className="bento-grid">
          <div className="bento-chart">
            <ChartWidget jobs={jobs} />
          </div>
          <div className="bento-profile">
            <CompanyProfileCard company={company} loading={loading} error={profileError} />
          </div>
          <div className="bento-pipeline">
            <HiringPipelineCard totalJobs={jobs.length} openJobs={openJobs} loading={loading} />
          </div>
        </div>

      </div>
    </div>
  );
}
