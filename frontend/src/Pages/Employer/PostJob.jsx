import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardNav from '../../components/shared/DashboardNav';
import api from '../../services/api';

const INPUT = {
  width: '100%', padding: '14px 18px', boxSizing: 'border-box',
  fontFamily: "'DM Mono', monospace", fontSize: 14,
  background: 'var(--bg)', color: 'var(--fg)',
  border: '3px solid var(--border-color)', outline: 'none',
  boxShadow: '4px 4px 0 var(--shadow-color)',
  transition: 'all 0.15s ease'
};
const LABEL = {
  display: 'block', fontFamily: "'Space Grotesk', sans-serif",
  fontWeight: 800, fontSize: 12, textTransform: 'uppercase',
  letterSpacing: '0.1em', color: 'var(--fg)', marginBottom: 8,
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
        setError('You must complete your Company Profile before posting jobs.');
      } else {
        setError(err.response?.data?.message || 'Failed to create job');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--fg)', padding: 'clamp(1.5rem, 4%, 2.5rem)' }}>
      <div className="dashboard-shell" style={{ marginBottom: '1rem' }}>
        <DashboardNav role="employer" />
      </div>
      <div className="dashboard-shell">

        <div style={{
          background: 'var(--card-bg)', border: '4px solid var(--border-color)',
          boxShadow: '8px 8px 0 var(--shadow-color)', padding: 'clamp(2rem, 5vw, 4rem)',
          marginTop: '2rem'
        }}>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: 'var(--fg)', textTransform: 'uppercase', letterSpacing: '-0.03em', marginBottom: 10, lineHeight: 1 }}>
            Post a New Role
          </h1>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: 'var(--fg-muted)', marginBottom: '3rem' }}>
            Fill out the form below to create a new job listing.
          </p>

          {error && (
            <div style={{ padding: '16px 20px', background: '#FF6B6B', color: '#0a0a0a', border: '3px solid #0a0a0a', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 24 }}>
              ⚠ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <label style={LABEL}>Position *</label>
                <input style={INPUT} value={form.position} onChange={set('position')} placeholder="e.g. Frontend Developer" required />
              </div>
              <div>
                <label style={LABEL}>Salary ($/yr) *</label>
                <input style={INPUT} type="number" value={form.salary} onChange={set('salary')} placeholder="e.g. 60000" required />
              </div>
            </div>

            <div>
              <label style={LABEL}>Description *</label>
              <textarea style={{ ...INPUT, minHeight: 150, resize: 'vertical', lineHeight: 1.6 }} value={form.description} onChange={set('description')} placeholder="Describe the role and responsibilities..." required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
              <div>
                <label style={LABEL}>Work Site *</label>
                <select style={INPUT} value={form.workSite} onChange={set('workSite')}>
                  <option value="REMOTE">Remote</option>
                  <option value="ON_SITE">On-site</option>
                  <option value="HYBRID">Hybrid</option>
                </select>
              </div>
              <div>
                <label style={LABEL}>Duration *</label>
                <select style={INPUT} value={form.workDuration} onChange={set('workDuration')}>
                  <option value="FULL_TIME">Full-time</option>
                  <option value="PART_TIME">Part-time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="INTERNSHIP">Internship</option>
                </select>
              </div>
              <div>
                <label style={LABEL}>Years Exp. *</label>
                <input style={INPUT} type="number" min="0" value={form.yearsOfExperience} onChange={set('yearsOfExperience')} placeholder="e.g. 2" required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <label style={LABEL}>Technical Skills <span style={{ textTransform: 'none', fontWeight: 500, color: 'var(--fg-muted)' }}>(comma-separated)</span></label>
                <input style={INPUT} value={form.technicalSkills} onChange={set('technicalSkills')} placeholder="React, Node.js, MongoDB" />
              </div>
              <div>
                <label style={LABEL}>Soft Skills <span style={{ textTransform: 'none', fontWeight: 500, color: 'var(--fg-muted)' }}>(comma-separated)</span></label>
                <input style={INPUT} value={form.softSkills} onChange={set('softSkills')} placeholder="Communication, Leadership" />
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              style={{
                marginTop: '1rem',
                padding: '18px', background: '#FFE630', color: '#0a0a0a',
                border: '4px solid #0a0a0a', boxShadow: '6px 6px 0 #0a0a0a',
                fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 18,
                textTransform: 'uppercase', letterSpacing: '0.1em',
                cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
                transition: 'transform 0.1s ease, box-shadow 0.1s ease'
              }}
              onMouseEnter={e => { if(!loading) { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = '4px 4px 0 #0a0a0a'; } }}
              onMouseLeave={e => { if(!loading) { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '6px 6px 0 #0a0a0a'; } }}
            >
              {loading ? 'POSTING...' : 'PUBLISH JOB LISTING →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
