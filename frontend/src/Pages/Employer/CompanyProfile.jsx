import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, PlusCircle, Trash2 } from 'lucide-react';
import DashboardNav from '../../components/shared/DashboardNav';
import api from '../../services/api';

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

export default function CompanyProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false); // true if profile already exists
  const [cooldownDaysLeft, setCooldownDaysLeft] = useState(0);

  const [form, setForm] = useState({
    name: '',
    license: '',
    website: '',
    contactEmail: '',
    branches: [{ name: '', city: '', street: '' }]
  });

  // Fetch existing profile on mount
  useEffect(() => {
    api.get('/employers')
      .then((res) => {
        const comp = res.data.data.employer.company;
        setForm({
          name: comp.name || '',
          license: comp.license || '',
          website: comp.website || '',
          contactEmail: comp.contactEmail || '',
          branches: comp.branches?.length ? comp.branches : [{ name: '', city: '', street: '' }]
        });
        setIsEditing(true);

        // Check cooldown matching backend logic
        const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
        const employerData = res.data.data.employer;
        const timeSinceLastUpdate = Date.now() - new Date(employerData.updatedAt).getTime();

        if (timeSinceLastUpdate < SEVEN_DAYS) {
          setCooldownDaysLeft(Math.ceil((SEVEN_DAYS - timeSinceLastUpdate) / (1000 * 60 * 60 * 24)));
        }
      })
      .catch(() => {
        // 404 means no profile yet, which is fine
        setIsEditing(false);
      })
      .finally(() => setLoading(false));
  }, []);

  const setField = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  // Branch handlers
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
      setError(err.response?.data?.message || 'Failed to save company profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--fg)', padding: 'clamp(1.5rem, 4%, 2.5rem)' }}>
        <div style={{ fontFamily: "'DM Mono', monospace", padding: '4rem 0', textAlign: 'center' }}>Loading profile...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--fg)', padding: 'clamp(1.5rem, 4%, 2.5rem)', overflowX: 'hidden' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', marginBottom: '1rem' }}>
        <DashboardNav role="employer" />
      </div>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>

        <div style={{
          background: 'var(--card-bg)', border: '4px solid var(--border-color)',
          boxShadow: '8px 8px 0 var(--shadow-color)', padding: 'clamp(2rem, 5vw, 4rem)',
          marginTop: '2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
            <div style={{ background: '#FFE630', border: '3px solid #0a0a0a', padding: 12, boxShadow: '4px 4px 0 #0a0a0a' }}>
              <Building2 size={28} color="#0a0a0a" strokeWidth={2.5} />
            </div>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: 'var(--fg)', textTransform: 'uppercase', letterSpacing: '-0.03em', lineHeight: 1 }}>
              {isEditing ? 'Company Profile' : 'Setup Company'}
            </h1>
          </div>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: 'var(--fg-muted)', marginBottom: '3rem' }}>
            {isEditing ? 'Update your company details and branch locations.' : 'You must complete this profile before posting any jobs.'}
          </p>

          {error && (
            <div style={{ padding: '16px 20px', background: '#FF6B6B', color: '#0a0a0a', border: '3px solid #0a0a0a', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 24 }}>
              ⚠ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            
            {/* Core Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={LABEL}>Company Name *</label>
                <input style={INPUT} value={form.name} onChange={setField('name')} placeholder="e.g. Acme Corp" required />
              </div>
              <div style={{ position: 'relative' }}>
                <label style={LABEL}>
                  Commercial License * 
                  {isEditing && <span style={{ textTransform: 'none', fontWeight: 500, color: '#FF6B6B', marginLeft: 8 }}>(Cannot be changed)</span>}
                </label>
                <input 
                  style={{ 
                    ...INPUT, 
                    background: isEditing ? 'rgba(0,0,0,0.05)' : 'var(--bg)', 
                    color: isEditing ? 'var(--fg-muted)' : 'var(--fg)', 
                    cursor: isEditing ? 'not-allowed' : 'text' 
                  }} 
                  value={form.license} 
                  onChange={setField('license')} 
                  placeholder="License number" 
                  required 
                  disabled={isEditing} 
                />
              </div>
              <div>
                <label style={LABEL}>Contact Email *</label>
                <input style={INPUT} type="email" value={form.contactEmail} onChange={setField('contactEmail')} placeholder="hr@acme.com" required />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={LABEL}>Website <span style={{ textTransform: 'none', fontWeight: 500, color: 'var(--fg-muted)' }}>(Optional)</span></label>
                <input style={INPUT} type="url" value={form.website} onChange={setField('website')} placeholder="https://acme.com" />
              </div>
            </div>

            <hr style={{ borderTop: '3px dashed var(--border-color)', margin: '1rem 0' }} />

            {/* Branches */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
                <div>
                  <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 20, color: 'var(--fg)', textTransform: 'uppercase' }}>Branch Locations *</h3>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: 'var(--fg-muted)', marginTop: 4 }}>At least one branch is required.</div>
                </div>
                <button
                  type="button" onClick={addBranch}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: '#4ECDC4', color: '#0a0a0a', border: '2px solid #0a0a0a', boxShadow: '3px 3px 0 #0a0a0a', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 12, textTransform: 'uppercase', cursor: 'pointer' }}
                >
                  <PlusCircle size={14} strokeWidth={3} /> Add Branch
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {form.branches.map((branch, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: 'var(--bg)', padding: '1rem', border: '3px solid var(--border-color)' }}>
                    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16 }}>
                      <div>
                        <label style={{ ...LABEL, fontSize: 10 }}>Branch Name</label>
                        <input style={{ ...INPUT, padding: '10px 14px', boxShadow: 'none' }} value={branch.name} onChange={(e) => updateBranch(i, 'name', e.target.value)} placeholder="e.g. HQ" required />
                      </div>
                      <div>
                        <label style={{ ...LABEL, fontSize: 10 }}>City</label>
                        <input style={{ ...INPUT, padding: '10px 14px', boxShadow: 'none' }} value={branch.city} onChange={(e) => updateBranch(i, 'city', e.target.value)} placeholder="e.g. New York" required />
                      </div>
                      <div>
                        <label style={{ ...LABEL, fontSize: 10 }}>Street Address</label>
                        <input style={{ ...INPUT, padding: '10px 14px', boxShadow: 'none' }} value={branch.street} onChange={(e) => updateBranch(i, 'street', e.target.value)} placeholder="123 Corporate Blvd" required />
                      </div>
                    </div>
                    {form.branches.length > 1 && (
                      <button
                        type="button" onClick={() => removeBranch(i)}
                        style={{ marginTop: 24, padding: '10px', background: '#FF6B6B', color: '#0a0a0a', border: '2px solid #0a0a0a', cursor: 'pointer' }}
                        title="Remove Branch"
                      >
                        <Trash2 size={16} strokeWidth={2.5} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit" disabled={saving || cooldownDaysLeft > 0}
              style={{
                marginTop: '1rem',
                padding: '18px', background: (saving || cooldownDaysLeft > 0) ? '#aaa' : '#FFE630', color: '#0a0a0a',
                border: '4px solid #0a0a0a', boxShadow: '6px 6px 0 #0a0a0a',
                fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 18,
                textTransform: 'uppercase', letterSpacing: '0.1em',
                cursor: (saving || cooldownDaysLeft > 0) ? 'not-allowed' : 'pointer', opacity: (saving || cooldownDaysLeft > 0) ? 0.6 : 1,
                transition: 'transform 0.1s ease, box-shadow 0.1s ease'
              }}
              onMouseEnter={e => { if(!saving && cooldownDaysLeft === 0) { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = '4px 4px 0 #0a0a0a'; } }}
              onMouseLeave={e => { if(!saving && cooldownDaysLeft === 0) { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '6px 6px 0 #0a0a0a'; } }}
            >
              {saving ? 'SAVING...' : cooldownDaysLeft > 0 ? `UPDATE AVAILABLE IN ${cooldownDaysLeft} DAYS` : isEditing ? 'UPDATE PROFILE →' : 'SAVE & CONTINUE →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
