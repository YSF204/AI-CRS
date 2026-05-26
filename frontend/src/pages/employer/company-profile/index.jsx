import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import DashboardNav from '../../../components/shared/DashboardNav';
import api from '../../../services/api';
import useFetch from '../../../hooks/useFetch';
import CompanyForm from './CompanyForm';

export default function CompanyProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [cooldownDaysLeft, setCooldownDaysLeft] = useState(0);

  const [form, setForm] = useState({
    name: '',
    license: '',
    website: '',
    contactEmail: '',
    branches: [{ name: '', city: '', street: '' }]
  });

  const {
    data: employerData,
    error: employerError,
    loading: profileLoading,
  } = useFetch(async () => {
    const res = await api.get('/employers');
    return res.data?.data?.employer || null;
  }, { initialData: null });

  useEffect(() => {
    if (profileLoading) return;
    if (employerError) {
      setIsEditing(false);
      setLoading(false);
      return;
    }
    if (!employerData) {
      setIsEditing(false);
      setLoading(false);
      return;
    }

    const comp = employerData.company || {};
    setForm({
      name: comp.name || '',
      license: comp.license || '',
      website: comp.website || '',
      contactEmail: comp.contactEmail || '',
      branches: comp.branches?.length ? comp.branches : [{ name: '', city: '', street: '' }],
    });
    setIsEditing(true);

    const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
    const timeSinceLastUpdate = Date.now() - new Date(employerData.updatedAt).getTime();
    if (timeSinceLastUpdate < SEVEN_DAYS) {
      setCooldownDaysLeft(Math.ceil((SEVEN_DAYS - timeSinceLastUpdate) / (1000 * 60 * 60 * 24)));
    } else {
      setCooldownDaysLeft(0);
    }
    setLoading(false);
  }, [employerData, employerError, profileLoading]);

  const setField = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const updateBranch = (index, field, value) => {
    const newBranches = [...form.branches];
    newBranches[index][field] = value;
    setForm((p) => ({ ...p, branches: newBranches }));
  };
  const addBranch = () => setForm((p) => ({ ...p, branches: [...p.branches, { name: '', city: '', street: '' }] }));
  const removeBranch = (index) => {
    if (form.branches.length === 1) return;
    setForm((p) => ({ ...p, branches: p.branches.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = { company: form };
      if (isEditing) {
        await api.patch('/employers', payload);
      } else {
        await api.post('/employers', payload);
      }
      navigate('/employer');
    } catch (err) {
      setError(err.response?.data?.message || 'CRITICAL FAILURE: DATA NOT PERSISTED.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--nm-bg)', color: 'var(--nm-text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Loading Profile...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--nm-bg)', color: 'var(--nm-text-primary)', fontFamily: 'var(--font-body)', overflowX: 'hidden' }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 16 }}>
            <div style={{ background: 'var(--nm-primary)', border: '4px solid var(--nm-ink)', padding: 12, boxShadow: '4px 4px 0 var(--nm-ink)', display: 'inline-flex' }}>
              <Building2 size={32} color="#fff" strokeWidth={3} />
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
              {isEditing ? 'Company Profile' : 'Create Profile'}
            </h1>
          </div>
          <p style={{ 
            fontFamily: 'var(--font-body)', 
            fontSize: 16, 
            color: 'var(--nm-text-secondary)', 
            marginBottom: '4rem',
            maxWidth: '600px',
            lineHeight: 1.6
          }}>
            {isEditing 
              ? 'Update your organization details and branch information.' 
              : 'Create your company profile to start posting job listings.'}
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
              SYSTEM ALERT: {error}
            </div>
          )}

          <CompanyForm
            form={form}
            setField={setField}
            updateBranch={updateBranch}
            addBranch={addBranch}
            removeBranch={removeBranch}
            handleSubmit={handleSubmit}
            saving={saving}
            cooldownDaysLeft={cooldownDaysLeft}
            isEditing={isEditing}
            error={error}
          />
        </div>
      </div>
    </div>
  );
}
