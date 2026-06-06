import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardNav from '../../components/shared/DashboardNav';
import JobsGrid from './components/JobsGrid';
import api from '../../services/api';
import useFetch from '../../hooks/useFetch';
import { useTranslation } from '../../context/LanguageContext';

export default function ManageJobs() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const { data: fetchedJobs = [], loading } = useFetch(async () => {
    const res = await api.get('/jobs/employer/me');
    return res.data?.data?.jobs || [];
  }, { initialData: [], key: user?.id || user?._id });

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

      <div className="dashboard-shell" style={{ padding: 'var(--spacing-4)' }}>
        <style>{`@media (min-width: 768px) { .manage-jobs-shell { padding: var(--spacing-8) !important; } }`}</style>
        <div style={{ 
          marginBottom: '2rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-end', 
          flexWrap: 'wrap', 
          gap: 'var(--spacing-4)' 
        }}>
          <div>
            <div style={{ 
              fontFamily: 'var(--font-display)', 
              fontSize: 14, 
              fontWeight: 800,
              color: 'var(--nm-text-tertiary)', 
              textTransform: 'uppercase', 
              letterSpacing: '0.15em', 
              marginBottom: 8 
            }}>
              {t("employer.assetAdministration", {}, "Asset Administration")}
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
              {t("employer.jobInventory", {}, "Job Inventory")}
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
