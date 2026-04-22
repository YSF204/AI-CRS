import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardNav from '../../components/shared/DashboardNav';
import api from '../../services/api';

const INPUT = {
  width: '100%', 
  padding: '16px 20px', 
  boxSizing: 'border-box',
  fontFamily: 'var(--font-body)', 
  fontSize: 15,
  fontWeight: 600,
  background: 'var(--nm-bg)', 
  color: 'var(--nm-text-primary)',
  border: '4px solid var(--nm-ink)', 
  outline: 'none',
  boxShadow: '4px 4px 0 var(--nm-ink)',
  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
  borderRadius: '0px',
};

const LABEL = {
  display: 'block', 
  fontFamily: 'var(--font-display)',
  fontWeight: 800, 
  fontSize: 12, 
  textTransform: 'uppercase',
  letterSpacing: '0.15em', 
  color: 'var(--nm-text-tertiary)', 
  marginBottom: 10,
};

const EMPTY = {
  position: '', description: '', salary: '',
  workSite: 'REMOTE', workDuration: 'FULL_TIME',
  yearsOfExperience: '', technicalSkills: '', softSkills: '',
};

export default function PostJob() {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
        technicalSkills: form.technicalSkills.split(',').map((s) => s.trim()).filter(Boolean),
        softSkills: form.softSkills.split(',').map((s) => s.trim()).filter(Boolean),
      });
      navigate('/employer');
    } catch (err) {
      if (err.response?.status === 404) {
        setError('COMPANY PROFILE INCOMPLETE. POSTING RESTRICTED.');
      } else {
        setError(err.response?.data?.message || 'CRITICAL FAILURE: LISTING NOT PUBLISHED.');
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

      <div className="dashboard-shell" style={{ padding: 'var(--spacing-8)' }}>

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
          <div style={{ 
            fontFamily: 'var(--font-display)', 
            fontSize: 14, 
            color: 'var(--nm-primary)', 
            fontWeight: 900, 
            textTransform: 'uppercase', 
            letterSpacing: '0.2em', 
            marginBottom: 8 
          }}>
            Asset Deployment
          </div>
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
            Publish Listing
          </h1>
          <p style={{ 
            fontFamily: 'var(--font-body)', 
            fontSize: 16, 
            color: 'var(--nm-text-secondary)', 
            marginBottom: '4rem',
            maxWidth: '600px',
            lineHeight: 1.6
          }}>
            Configure the parameters for the new talent requisition. All fields marked are required for system indexing.
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

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>
              <div>
                <label style={LABEL}>Position Title *</label>
                <input 
                  style={INPUT} 
                  value={form.position} 
                  onChange={set('position')} 
                  placeholder="e.g. OPERATIONS ANALYST" 
                  required 
                  onFocus={e => e.target.style.transform = 'translate(-2px, -2px)'}
                  onBlur={e => e.target.style.transform = 'none'}
                />
              </div>
              <div>
                <label style={LABEL}>Base Remuneration ($/YR) *</label>
                <input 
                  style={INPUT} 
                  type="number" 
                  value={form.salary} 
                  onChange={set('salary')} 
                  placeholder="e.g. 85000" 
                  required 
                  onFocus={e => e.target.style.transform = 'translate(-2px, -2px)'}
                  onBlur={e => e.target.style.transform = 'none'}
                />
              </div>
            </div>

            <div>
              <label style={LABEL}>Role Specification *</label>
              <textarea 
                style={{ ...INPUT, minHeight: 180, resize: 'vertical', lineHeight: 1.7 }} 
                value={form.description} 
                onChange={set('description')} 
                placeholder="Detail the operational scope and mission objectives..." 
                required 
                onFocus={e => e.target.style.transform = 'translate(-2px, -2px)'}
                onBlur={e => e.target.style.transform = 'none'}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32 }}>
              <div>
                <label style={LABEL}>Workspace Configuration *</label>
                <select 
                  style={{ ...INPUT, cursor: 'pointer' }} 
                  value={form.workSite} 
                  onChange={set('workSite')}
                  onFocus={e => e.target.style.transform = 'translate(-2px, -2px)'}
                  onBlur={e => e.target.style.transform = 'none'}
                >
                  <option value="REMOTE">REMOTE</option>
                  <option value="ON_SITE">ON-SITE</option>
                  <option value="HYBRID">HYBRID</option>
                </select>
              </div>
              <div>
                <label style={LABEL}>Temporal Commitment *</label>
                <select 
                  style={{ ...INPUT, cursor: 'pointer' }} 
                  value={form.workDuration} 
                  onChange={set('workDuration')}
                  onFocus={e => e.target.style.transform = 'translate(-2px, -2px)'}
                  onBlur={e => e.target.style.transform = 'none'}
                >
                  <option value="FULL_TIME">FULL-TIME</option>
                  <option value="PART_TIME">PART-TIME</option>
                  <option value="CONTRACT">CONTRACT</option>
                  <option value="INTERNSHIP">INTERNSHIP</option>
                </select>
              </div>
              <div>
                <label style={LABEL}>Exp. Threshold (Y) *</label>
                <input 
                  style={INPUT} 
                  type="number" 
                  min="0" 
                  value={form.yearsOfExperience} 
                  onChange={set('yearsOfExperience')} 
                  placeholder="e.g. 3" 
                  required 
                  onFocus={e => e.target.style.transform = 'translate(-2px, -2px)'}
                  onBlur={e => e.target.style.transform = 'none'}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>
              <div>
                <label style={LABEL}>Technical Competencies <span style={{ textTransform: 'none', fontWeight: 500, opacity: 0.6 }}>(CSV)</span></label>
                <input 
                  style={INPUT} 
                  value={form.technicalSkills} 
                  onChange={set('technicalSkills')} 
                  placeholder="e.g. PYTHON, AWS, SQL" 
                  onFocus={e => e.target.style.transform = 'translate(-2px, -2px)'}
                  onBlur={e => e.target.style.transform = 'none'}
                />
              </div>
              <div>
                <label style={LABEL}>Operational Traits <span style={{ textTransform: 'none', fontWeight: 500, opacity: 0.6 }}>(CSV)</span></label>
                <input 
                  style={INPUT} 
                  value={form.softSkills} 
                  onChange={set('softSkills')} 
                  placeholder="e.g. STRATEGIC, AGILE" 
                  onFocus={e => e.target.style.transform = 'translate(-2px, -2px)'}
                  onBlur={e => e.target.style.transform = 'none'}
                />
              </div>
            </div>

            <button
              type="submit" 
              disabled={loading}
              className="nm-btn"
              style={{
                marginTop: '1.5rem',
                padding: '22px', 
                background: 'var(--nm-primary)', 
                color: '#fff',
                fontFamily: 'var(--font-display)', 
                fontWeight: 900, 
                fontSize: 18,
                textTransform: 'uppercase', 
                letterSpacing: '0.15em',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'PUBLISHING...' : 'CONFIRM DEPLOYMENT →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
