import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Briefcase, ArrowLeft } from 'lucide-react';
import DashboardNav from '../../components/shared/DashboardNav';
import api from '../../services/api';
import useFetch from '../../hooks/useFetch';

const INPUT = {
  width: '100%', padding: '14px 18px', boxSizing: 'border-box',
  fontFamily: "'DM Mono', monospace", fontSize: 14,
  background: 'var(--bg)', color: 'var(--fg)',
  border: '3px solid var(--border-color)', outline: 'none',
  boxShadow: '4px 4px 0 var(--shadow-color)',
  transition: 'all 0.1s ease'
};
const LABEL = {
  display: 'block', fontFamily: "'Space Grotesk', sans-serif",
  fontWeight: 800, fontSize: 12, textTransform: 'uppercase',
  letterSpacing: '0.1em', color: 'var(--fg)', marginBottom: 8,
};

export default function EditJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  
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
  }, { initialData: null, deps: [id] });

  useEffect(() => {
    if (jobLoading) return;
    if (jobError) {
      setError('Could not load job details.');
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
  }, [jobData, jobError, jobLoading]);

  const setField = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    
    // Process comma-separated skills
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
      navigate('/employer'); // or navigate to manage jobs page
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update job.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--fg)', padding: 'clamp(1.5rem, 4%, 2.5rem)' }}>
        <div style={{ fontFamily: "'DM Mono', monospace", padding: '4rem 0', textAlign: 'center' }}>Loading Job...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--fg)', padding: 'clamp(1.5rem, 4%, 2.5rem)', overflowX: 'hidden' }}>
      <div className="dashboard-shell" style={{ marginBottom: '1rem' }}>
        <DashboardNav role="employer" />
      </div>
      <div className="dashboard-shell">

        <button 
          onClick={() => navigate(-1)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 700, textTransform: 'uppercase', background: 'none', border: 'none', color: 'var(--fg)', cursor: 'pointer', marginTop: '2rem', marginBottom: '1rem', padding: 0 }}
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div style={{
          background: 'var(--card-bg)', border: '4px solid var(--border-color)',
          boxShadow: '8px 8px 0 var(--shadow-color)', padding: 'clamp(2rem, 5vw, 4rem)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
            <div style={{ background: '#4ECDC4', border: '3px solid #0a0a0a', padding: 12, boxShadow: '4px 4px 0 #0a0a0a' }}>
              <Briefcase size={28} color="#0a0a0a" strokeWidth={2.5} />
            </div>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: 'var(--fg)', textTransform: 'uppercase', letterSpacing: '-0.03em', lineHeight: 1 }}>
              Edit Job
            </h1>
          </div>
          
          {error && (
            <div style={{ padding: '16px 20px', background: '#FF6B6B', color: '#0a0a0a', border: '3px solid #0a0a0a', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 24, marginTop: 24 }}>
              ⚠ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 32, marginTop: 32 }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={LABEL}>Job Title / Position *</label>
                <input style={INPUT} value={form.position} onChange={setField('position')} required />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={LABEL}>Job Description *</label>
                <textarea style={{ ...INPUT, minHeight: 150, resize: 'vertical' }} value={form.description} onChange={setField('description')} required />
              </div>

              <div>
                <label style={LABEL}>Work Site *</label>
                <select style={INPUT} value={form.workSite} onChange={setField('workSite')} required>
                  <option value="ON_SITE">On-Site</option>
                  <option value="REMOTE">Remote</option>
                  <option value="HYBRID">Hybrid</option>
                </select>
              </div>

              <div>
                <label style={LABEL}>Job Type *</label>
                <select style={INPUT} value={form.workDuration} onChange={setField('workDuration')} required>
                  <option value="FULL_TIME">Full-Time</option>
                  <option value="PART_TIME">Part-Time</option>
                  <option value="INTERNSHIP">Internship</option>
                  <option value="CONTRACT">Contract</option>
                </select>
              </div>

              <div>
                <label style={LABEL}>Years of Experience *</label>
                <input style={INPUT} type="number" min="0" value={form.yearsOfExperience} onChange={setField('yearsOfExperience')} required />
              </div>

              <div>
                <label style={LABEL}>Salary (Optional)</label>
                <input style={INPUT} type="number" min="0" value={form.salary} onChange={setField('salary')} placeholder="e.g. 75000" />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={LABEL}>Technical Skills <span style={{ textTransform: 'none', fontWeight: 500, color: 'var(--fg-muted)' }}>(Comma separated)</span></label>
                <input style={INPUT} value={form.technicalSkills} onChange={setField('technicalSkills')} placeholder="React, Node.js, MongoDB" />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={LABEL}>Soft Skills <span style={{ textTransform: 'none', fontWeight: 500, color: 'var(--fg-muted)' }}>(Comma separated)</span></label>
                <input style={INPUT} value={form.softSkills} onChange={setField('softSkills')} placeholder="Communication, Leadership" />
              </div>
            </div>

            <button
              type="submit" disabled={saving}
              style={{
                marginTop: '1rem',
                padding: '18px', background: '#FFE630', color: '#0a0a0a',
                border: '4px solid #0a0a0a', boxShadow: '6px 6px 0 #0a0a0a',
                fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 18,
                textTransform: 'uppercase', letterSpacing: '0.1em',
                cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1,
                transition: 'transform 0.1s ease, box-shadow 0.1s ease'
              }}
              onMouseEnter={e => { if(!saving) { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = '4px 4px 0 #0a0a0a'; } }}
              onMouseLeave={e => { if(!saving) { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '6px 6px 0 #0a0a0a'; } }}
            >
              {saving ? 'SAVING...' : 'SAVE CHANGES →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
