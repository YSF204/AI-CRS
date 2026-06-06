import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Briefcase, ArrowLeft } from 'lucide-react';
import DashboardNav from '../../../components/shared/DashboardNav';
import api from '../../../services/api';
import useFetch from '../../../hooks/useFetch';
import JobForm from './JobForm';
import { useTranslation } from '../../../context/LanguageContext';

export default function EditJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [form, setForm] = useState({
    position: '',
    description: '',
    yearsOfExperience: '',
    workSite: 'ON_SITE',
    workDuration: 'FULL_TIME',
    salary: '',
    technicalSkills: '',
    softSkills: '',
    status: 'OPEN'
  });

  const { data: jobData, error: jobError, loading: jobLoading } = useFetch(async () => {
    const res = await api.get(`/jobs/${id}`);
    return res.data?.data?.job || null;
  }, { initialData: null, key: id });

  useEffect(() => {
    if (jobLoading) return;
    if (jobError) {
      setError(t('employer.failedToLoadUnitData', {}, 'FAILED TO LOAD UNIT DATA.'));
      setLoading(false);
      return;
    }
    if (!jobData) {
      setLoading(false);
      return;
    }
    setForm({
      position: jobData.position || '',
      description: jobData.description || '',
      yearsOfExperience: jobData.yearsOfExperience || '',
      workSite: jobData.workSite || 'ON_SITE',
      workDuration: jobData.workDuration || 'FULL_TIME',
      salary: jobData.salary || '',
      technicalSkills: jobData.technicalSkills?.join(', ') || '',
      softSkills: jobData.softSkills?.join(', ') || '',
      status: jobData.status || 'OPEN',
    });
    setLoading(false);
  }, [jobData, jobError, jobLoading, t]);

  const setField = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    
    const parseList = (str) => str.split(',').map(s => s.trim()).filter(Boolean);
    
    const payload = {
      ...form,
      technicalSkills: parseList(form.technicalSkills),
      softSkills: parseList(form.softSkills),
      yearsOfExperience: Number(form.yearsOfExperience),
      salary: form.salary ? Number(form.salary) : undefined
    };

    try {
      await api.patch(`/jobs/${id}`, payload);
      navigate('/employer');
    } catch (err) {
      setError(err.response?.data?.message || t('employer.systemUpdateFailure', {}, 'SYSTEM UPDATE FAILURE.'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--nm-bg)', color: 'var(--nm-text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{t('employer.accessingDataStream', {}, 'Accessing Data Stream...')}</div>
      </div>
    );
  }

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

        <button 
          onClick={() => navigate(-1)}
          className="nm-btn"
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 12, 
            fontFamily: 'var(--font-display)', 
            fontSize: 12, 
            fontWeight: 900, 
            textTransform: 'uppercase', 
            background: 'var(--nm-surface)', 
            color: 'var(--nm-text-primary)', 
            cursor: 'pointer', 
            marginBottom: '2rem', 
            padding: '10px 20px',
            border: '4px solid var(--nm-ink)'
          }}
        >
          <ArrowLeft size={18} strokeWidth={3} /> {t('common.back', {}, 'Return')}
        </button>

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
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 12 }}>
            <div style={{ background: 'var(--nm-primary)', border: '4px solid var(--nm-ink)', padding: 12, boxShadow: '4px 4px 0 var(--nm-ink)', display: 'inline-flex' }}>
              <Briefcase size={32} color="#fff" strokeWidth={3} />
            </div>
            <h1 style={{ 
              fontFamily: 'var(--font-display)', 
              fontWeight: 900, 
              fontSize: 'clamp(2.5rem, 6vw, 4rem)', 
              color: 'var(--nm-text-primary)', 
              textTransform: 'uppercase', 
              letterSpacing: '-0.04em', 
              lineHeight: 1,
              margin: 0
            }}>
              {t('employer.editJob', {}, 'Adjust Listing')}
            </h1>
          </div>
          
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
              marginTop: 32,
              boxShadow: '4px 4px 0 var(--nm-ink)'
            }}>
              {t('employer.systemAlert', {}, 'SYSTEM ALERT')}: {error}
            </div>
          )}

          <JobForm
            form={form}
            setField={setField}
            handleSubmit={handleSubmit}
            saving={saving}
          />
        </div>
      </div>
    </div>
  );
}
