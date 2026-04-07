import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardNav from '../../components/shared/DashboardNav';
import JobsGrid from './components/JobsGrid';
import api from '../../services/api';
import useFetch from '../../hooks/useFetch';

export default function ManageJobs() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const { data: fetchedJobs = [], loading } = useFetch(async () => {
    const res = await api.get('/jobs/employer/me');
    return res.data?.data?.jobs || [];
  }, { initialData: [], deps: [user?.id || user?._id] });

  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    setJobs(fetchedJobs);
  }, [fetchedJobs]);

  const handleJobDeleted = (id) => {
    setJobs((prev) => prev.filter((j) => j._id !== id));
  };

  const handleJobUpdated = (id, newStatus) => {
    setJobs((prev) => prev.map((j) => j._id === id ? { ...j, status: newStatus } : j));
  };

  const goPostJob = () => navigate('/employer/post-job');
  const goViewCandidates = (jobId) => navigate(`/employer/jobs/${jobId}/applications`);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--fg)', padding: 'clamp(1.5rem, 4%, 2.5rem)', overflowX: 'hidden' }}>
      <div className="dashboard-shell">
        <DashboardNav role="employer" />

        <div style={{ marginBottom: 'clamp(1.5rem, 3%, 2.5rem)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
              Job Management
            </div>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 'clamp(2rem, 5vw, 3.2rem)', color: 'var(--fg)', letterSpacing: '-0.04em', lineHeight: 1 }}>
              All Listings
            </h1>
          </div>
        </div>

        <JobsGrid 
          jobs={jobs} 
          loading={loading} 
          onPostJob={goPostJob} 
          onJobDeleted={handleJobDeleted} 
          onJobUpdated={handleJobUpdated}
          onViewCandidates={goViewCandidates}
        />
      </div>
    </div>
  );
}
