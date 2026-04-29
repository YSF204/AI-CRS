import React from 'react';

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

export default function PostJobForm({ form, set, handleSubmit, loading }) {
  return (
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
  );
}
