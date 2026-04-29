import React from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';

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

export default function CompanyForm({ form, setField, updateBranch, addBranch, removeBranch, handleSubmit, saving, cooldownDaysLeft, isEditing, error }) {
  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={LABEL}>Legal Entity Name *</label>
          <input 
            style={INPUT} 
            value={form.name} 
            onChange={setField('name')} 
            placeholder="e.g. ACME GLOBAL OPERATIONS" 
            required 
            onFocus={e => e.target.style.transform = 'translate(-2px, -2px)'}
            onBlur={e => e.target.style.transform = 'none'}
          />
        </div>
        <div style={{ position: 'relative' }}>
          <label style={LABEL}>
            Operational License * 
            {isEditing && <span style={{ textTransform: 'none', fontWeight: 800, color: 'var(--nm-error)', marginLeft: 8 }}>(LOCKED)</span>}
          </label>
          <input 
            style={{ 
              ...INPUT, 
              background: isEditing ? 'var(--nm-bg)' : 'var(--nm-bg)', 
              color: isEditing ? 'var(--nm-text-tertiary)' : 'var(--nm-text-primary)', 
              cursor: isEditing ? 'not-allowed' : 'text',
              borderColor: isEditing ? 'var(--nm-ink)' : 'var(--nm-ink)',
              opacity: isEditing ? 0.7 : 1
            }} 
            value={form.license} 
            onChange={setField('license')} 
            placeholder="REGISTRATION_ID" 
            required 
            disabled={isEditing} 
          />
        </div>
        <div>
          <label style={LABEL}>Primary Intake Email *</label>
          <input 
            style={INPUT} 
            type="email" 
            value={form.contactEmail} 
            onChange={setField('contactEmail')} 
            placeholder="hr@acme.corp" 
            required 
            onFocus={e => e.target.style.transform = 'translate(-2px, -2px)'}
            onBlur={e => e.target.style.transform = 'none'}
          />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={LABEL}>Digital Domain URL <span style={{ textTransform: 'none', fontWeight: 500, color: 'var(--nm-text-tertiary)' }}>(OPTIONAL)</span></label>
          <input 
            style={INPUT} 
            type="url" 
            value={form.website} 
            onChange={setField('website')} 
            placeholder="https://acme.io" 
            onFocus={e => e.target.style.transform = 'translate(-2px, -2px)'}
            onBlur={e => e.target.style.transform = 'none'}
          />
        </div>
      </div>

      <div style={{ height: '4px', background: 'var(--nm-ink)', margin: '1rem 0' }} />

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 24, color: 'var(--nm-text-primary)', textTransform: 'uppercase', margin: 0 }}>Operational Nodes *</h3>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 11, color: 'var(--nm-text-tertiary)', marginTop: 8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>MINIMUM 1 ACTIVE NODE REQUIRED</div>
          </div>
          <button
            type="button" onClick={addBranch}
            className="nm-btn"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 10, 
              padding: '12px 24px', 
              background: 'var(--nm-success)', 
              color: '#fff', 
              fontFamily: 'var(--font-display)', 
              fontWeight: 900, 
              fontSize: 13, 
              textTransform: 'uppercase' 
            }}
          >
            <PlusCircle size={16} strokeWidth={3} /> Add Node
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {form.branches.map((branch, i) => (
            <div key={i} style={{ 
              display: 'flex', 
              gap: 20, 
              alignItems: 'flex-start', 
              background: 'var(--nm-bg)', 
              padding: '24px', 
              border: '4px solid var(--nm-ink)',
              boxShadow: '6px 6px 0 var(--nm-ink)'
            }}>
              <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20 }}>
                <div>
                  <label style={{ ...LABEL, fontSize: 10, marginBottom: 6 }}>NODE DESIGNATION</label>
                  <input style={{ ...INPUT, padding: '12px 16px', boxShadow: 'none', borderSize: '3px' }} value={branch.name} onChange={(e) => updateBranch(i, 'name', e.target.value)} placeholder="e.g. SECTOR_HQ" required />
                </div>
                <div>
                  <label style={{ ...LABEL, fontSize: 10, marginBottom: 6 }}>SECTOR / CITY</label>
                  <input style={{ ...INPUT, padding: '12px 16px', boxShadow: 'none', borderSize: '3px' }} value={branch.city} onChange={(e) => updateBranch(i, 'city', e.target.value)} placeholder="e.g. LONDON" required />
                </div>
                <div>
                  <label style={{ ...LABEL, fontSize: 10, marginBottom: 6 }}>GEOSPATIAL ADDRESS</label>
                  <input style={{ ...INPUT, padding: '12px 16px', boxShadow: 'none', borderSize: '3px' }} value={branch.street} onChange={(e) => updateBranch(i, 'street', e.target.value)} placeholder="123 VECTOR ST" required />
                </div>
              </div>
              {form.branches.length > 1 && (
                <button
                  type="button" onClick={() => removeBranch(i)}
                  className="nm-btn"
                  style={{ marginTop: 24, padding: '12px', background: 'var(--nm-error)', color: '#fff' }}
                  title="TERMINATE NODE"
                >
                  <Trash2 size={18} strokeWidth={3} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <button
        type="submit" 
        disabled={saving || cooldownDaysLeft > 0}
        className="nm-btn"
        style={{
          marginTop: '1.5rem',
          padding: '22px', 
          background: (saving || cooldownDaysLeft > 0) ? 'var(--nm-text-tertiary)' : 'var(--nm-primary)', 
          color: '#fff',
          fontFamily: 'var(--font-display)', 
          fontWeight: 900, 
          fontSize: 18,
          textTransform: 'uppercase', 
          letterSpacing: '0.15em',
          cursor: (saving || cooldownDaysLeft > 0) ? 'not-allowed' : 'pointer', 
          opacity: (saving || cooldownDaysLeft > 0) ? 0.7 : 1,
        }}
      >
        {saving ? 'COMMITTING...' : cooldownDaysLeft > 0 ? `IDENTITY LOCKED [${cooldownDaysLeft} DAYS]` : isEditing ? 'COMMIT UPDATES →' : 'INITIALIZE UNIT →'}
      </button>
    </form>
  );
}
