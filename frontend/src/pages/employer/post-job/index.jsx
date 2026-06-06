import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardNav from '../../../components/shared/DashboardNav';
import api from '../../../services/api';
import PostJobForm from './PostJobForm';
import { useTranslation } from '../../../context/LanguageContext';

const EMPTY = {
  position: '', description: '', salary: '',
  workSite: 'REMOTE', workDuration: 'FULL_TIME',
  yearsOfExperience: '', technicalSkills: '', softSkills: '',
};

export default function PostJob() {
  const { t } = useTranslation();
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const parseList = (value) => String(value || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/jobs/create', {
        ...form,
        salary: Number(form.salary),
        yearsOfExperience: Number(form.yearsOfExperience),
        technicalSkills: parseList(form.technicalSkills),
        softSkills: parseList(form.softSkills),
      });
      navigate('/employer');
    } catch (err) {
      if (err.response?.status === 404) {
        setError(t('employer.companyProfileIncomplete', {}, 'COMPANY PROFILE INCOMPLETE. POSTING RESTRICTED.'));
      } else {
        setError(err.response?.data?.message || t('employer.criticalFailureListingNotPublished', {}, 'CRITICAL FAILURE: LISTING NOT PUBLISHED.'));
      }
    } finally {
      setLoading(false);
    }
  };

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
        <style>{`@media (min-width: 768px) { .dashboard-shell { padding: var(--spacing-8) !important; } }`}</style>

        <div
          className="nm-card"
          style={{
            background: 'var(--nm-surface)',
            borderWidth: '4px',
            boxShadow: '12px 12px 0 var(--nm-ink)',
            padding: 'clamp(2rem, 6vw, 4rem)',
            borderRadius: '0px',
          }}
        >
          
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 900,
            fontSize: 'clamp(2.5rem, 6vw, 4rem)',
            color: 'var(--nm-text-primary)',
            textTransform: 'uppercase',
            letterSpacing: '-0.04em',
            marginBottom: 12,
            lineHeight: 1,
            margin: 0
          }}>
            {t('employer.postNewJob', {}, 'Publish a Job Listing')}
          </h1>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 16,
            color: 'var(--nm-text-secondary)',
            marginBottom: '4rem',
            maxWidth: '600px',
            lineHeight: 1.6
          }}>
            {t('employer.postJobDesc', {}, 'Configure the parameters for the new talent requisition. All fields marked are required for system indexing.')}
          </p>

          {error && (
            <div style={{
              padding: '20px 24px',
              background: 'var(--nm-error)',
              color: '#fff',
              border: '4px solid var(--nm-ink)',
              fontFamily: 'var(--font-display)',
              fontWeight: 900,
              fontSize: 14,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: 32,
              boxShadow: '4px 4px 0 var(--nm-ink)'
            }}>
              {t('employer.systemAlert', {}, 'SYSTEM ALERT')}: {error}
            </div>
          )}

          <PostJobForm
            form={form}
            set={set}
            handleSubmit={handleSubmit}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}
