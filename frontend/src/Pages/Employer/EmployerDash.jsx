import { useEffect, useState } from 'react';
import { PlusCircle, Briefcase, CheckCircle2, MapPin, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

import DashboardNav from '../../components/shared/DashboardNav';
import StatWidget from './components/StatWidget';
import CompanyProfileCard from './components/CompanyProfileCard';
import HiringPipelineCard from './components/HiringPipelineCard';
import ChartWidget from './components/ChartWidget';

export default function EmployerDash() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // ── Data state ──────────────────────────────────────────────── //
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(false);

  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);

  // ── Fetching ─────────────────────────────────────────────────── //
  useEffect(() => {
    api.get('/employers')
      .then((res) => setProfile(res.data.data.employer))
      .catch(() => setProfileError(true))
      .finally(() => setProfileLoading(false));
  }, []);

  useEffect(() => {
    api.get('/jobs/employer/me')
      .then((res) => {
        setJobs(res.data.data.jobs); 
      })
      .catch(() => {})
      .finally(() => setJobsLoading(false));
  }, [user]);

  // ── Derived values ───────────────────────────────────────────── //
  const company = profile?.company;
  const openJobs = jobs.filter((j) => j.status === 'OPEN').length;

  const goPostJob = () => navigate('/employer/post-job');

  // ── Layout ───────────────────────────────────────────────────── //
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--fg)', padding: 'clamp(1.5rem, 4%, 2.5rem)', overflowX: 'hidden' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <DashboardNav role="employer" />

        {/* Greeting + Post button */}
        <div style={{ marginBottom: 'clamp(1.5rem, 3%, 2.5rem)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
              {profileLoading ? 'Loading Profile...' : company?.name ?? 'Your Company'}
            </div>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 'clamp(2rem, 5vw, 3.2rem)', color: 'var(--fg)', letterSpacing: '-0.04em', lineHeight: 1 }}>
              Employer Dashboard
            </h1>
          </div>
          <button
            onClick={goPostJob}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '14px 26px', background: '#FFE630', color: '#0a0a0a',
              border: '4px solid #0a0a0a', boxShadow: '6px 6px 0 #0a0a0a',
              fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 14,
              textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer',
              transition: 'transform 0.1s ease, box-shadow 0.1s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translate(3px,3px)'; e.currentTarget.style.boxShadow = '3px 3px 0 #0a0a0a'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '6px 6px 0 #0a0a0a'; }}
          >
            <PlusCircle size={18} strokeWidth={2.5} />
            Post New Listing
          </button>
        </div>

        {/* Stat row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'clamp(1rem, 2vw, 1.5rem)', marginBottom: 'clamp(1.5rem, 3%, 2.5rem)' }}>
          <StatWidget label="Open Positions"  value={jobsLoading ? '…' : openJobs}                              accent="#FFE630" icon={Briefcase}     />
          <StatWidget label="Total Posted"    value={jobsLoading ? '…' : jobs.length}                           accent="#4ECDC4" icon={CheckCircle2}  />
          <StatWidget label="Branches"        value={profileLoading ? '…' : (company?.branches?.length ?? '0')} accent="#FF6B6B" icon={MapPin}        />
          <StatWidget label="System Status"   value={profileLoading ? '…' : (company ? 'Active' : 'Setup Req')} accent="#A78BFA" icon={AlertCircle}   />
        </div>

        {/* Main Bento Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 'clamp(1rem, 2vw, 1.5rem)', alignItems: 'stretch' }}>
          
          {/* Chart spans 8, Profile spans 4 */}
          <ChartWidget jobs={jobs} />
          <CompanyProfileCard company={company} loading={profileLoading} error={profileError} />

          {/* Pipeline spans 12 */}
          <HiringPipelineCard totalJobs={jobs.length} openJobs={openJobs} loading={jobsLoading} />
        </div>

      </div>
    </div>
  );
}
