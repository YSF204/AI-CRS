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

export default function JobForm({ form, setField, handleSubmit, saving }) {
  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 32, marginTop: 40 }}>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={LABEL}>Position Designation *</label>
          <input 
            style={INPUT} 
            value={form.position} 
            onChange={setField('position')} 
            required 
            onFocus={e => e.target.style.transform = 'translate(-2px, -2px)'}
            onBlur={e => e.target.style.transform = 'none'}
          />
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <label style={LABEL}>Role Specification *</label>
          <textarea 
            style={{ ...INPUT, minHeight: 180, resize: 'vertical', lineHeight: 1.7 }} 
            value={form.description} 
            onChange={setField('description')} 
            required 
            onFocus={e => e.target.style.transform = 'translate(-2px, -2px)'}
            onBlur={e => e.target.style.transform = 'none'}
          />
        </div>

        <div>
          <label style={LABEL}>Workspace Configuration *</label>
          <select 
            style={{ ...INPUT, cursor: 'pointer' }} 
            value={form.workSite} 
            onChange={setField('workSite')} 
            required
            onFocus={e => e.target.style.transform = 'translate(-2px, -2px)'}
            onBlur={e => e.target.style.transform = 'none'}
          >
            <option value="ON_SITE">ON-SITE</option>
            <option value="REMOTE">REMOTE</option>
            <option value="HYBRID">HYBRID</option>
          </select>
        </div>

        <div>
          <label style={LABEL}>Temporal Commitment *</label>
          <select 
            style={{ ...INPUT, cursor: 'pointer' }} 
            value={form.workDuration} 
            onChange={setField('workDuration')} 
            required
            onFocus={e => e.target.style.transform = 'translate(-2px, -2px)'}
            onBlur={e => e.target.style.transform = 'none'}
          >
            <option value="FULL_TIME">FULL-TIME</option>
            <option value="PART_TIME">PART-TIME</option>
            <option value="INTERNSHIP">INTERNSHIP</option>
            <option value="CONTRACT">CONTRACT</option>
          </select>
        </div>

        <div>
          <label style={LABEL}>Experience Threshold (Y) *</label>
          <input 
            style={INPUT} 
            type="number" 
            min="0" 
            value={form.yearsOfExperience} 
            onChange={setField('yearsOfExperience')} 
            required 
            onFocus={e => e.target.style.transform = 'translate(-2px, -2px)'}
            onBlur={e => e.target.style.transform = 'none'}
          />
        </div>

        <div>
          <label style={LABEL}>Base Remuneration ($/YR)</label>
          <input 
            style={INPUT} 
            type="number" 
            min="0" 
            value={form.salary} 
            onChange={setField('salary')} 
            placeholder="e.g. 75000" 
            onFocus={e => e.target.style.transform = 'translate(-2px, -2px)'}
            onBlur={e => e.target.style.transform = 'none'}
          />
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <label style={LABEL}>Technical Competencies <span style={{ textTransform: 'none', fontWeight: 500, opacity: 0.6 }}>(CSV)</span></label>
          <input 
            style={INPUT} 
            value={form.technicalSkills} 
            onChange={setField('technicalSkills')} 
            placeholder="React, Node.js, MongoDB" 
            onFocus={e => e.target.style.transform = 'translate(-2px, -2px)'}
            onBlur={e => e.target.style.transform = 'none'}
          />
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <label style={LABEL}>Operational Traits <span style={{ textTransform: 'none', fontWeight: 500, opacity: 0.6 }}>(CSV)</span></label>
          <input 
            style={INPUT} 
            value={form.softSkills} 
            onChange={setField('softSkills')} 
            placeholder="Communication, Leadership" 
            onFocus={e => e.target.style.transform = 'translate(-2px, -2px)'}
            onBlur={e => e.target.style.transform = 'none'}
          />
        </div>
      </div>

      <button
        type="submit" 
        disabled={saving}
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
          cursor: saving ? 'not-allowed' : 'pointer',
        }}
      >
        {saving ? 'UPDATING...' : 'COMMIT CHANGES →'}
      </button>
    </form>
  );
}
