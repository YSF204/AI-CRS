import React from 'react';
import { useTranslation } from '../../../context/LanguageContext';

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
  const { t } = useTranslation();

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 32, marginTop: 40 }}>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <label htmlFor="jf-position" style={LABEL}>{t('employer.jobTitle', {}, 'Job Title')} *</label>
          <input
            id="jf-position"
            style={INPUT}
            value={form.position}
            onChange={setField('position')}
            required
            onFocus={e => e.target.style.transform = 'translate(-2px, -2px)'}
            onBlur={e => e.target.style.transform = 'none'}
          />
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <label htmlFor="jf-description" style={LABEL}>{t('employer.jobDescription', {}, 'Description')} *</label>
          <textarea
            id="jf-description"
            style={{ ...INPUT, minHeight: 180, resize: 'vertical', lineHeight: 1.7 }}
            value={form.description}
            onChange={setField('description')}
            required
            onFocus={e => e.target.style.transform = 'translate(-2px, -2px)'}
            onBlur={e => e.target.style.transform = 'none'}
          />
        </div>

        <div>
          <label htmlFor="jf-workSite" style={LABEL}>{t('employer.workMode', {}, 'Work Mode')} *</label>
          <select
            id="jf-workSite"
            style={{ ...INPUT, cursor: 'pointer' }}
            value={form.workSite}
            onChange={setField('workSite')}
            required
            onFocus={e => e.target.style.transform = 'translate(-2px, -2px)'}
            onBlur={e => e.target.style.transform = 'none'}
          >
            <option value="ON_SITE">{t('common.onsite', {}, 'ON-SITE')}</option>
            <option value="REMOTE">{t('common.remote', {}, 'REMOTE')}</option>
            <option value="HYBRID">{t('common.hybrid', {}, 'HYBRID')}</option>
          </select>
        </div>

        <div>
          <label htmlFor="jf-workDuration" style={LABEL}>{t('employer.jobType', {}, 'Job Type')} *</label>
          <select
            id="jf-workDuration"
            style={{ ...INPUT, cursor: 'pointer' }}
            value={form.workDuration}
            onChange={setField('workDuration')}
            required
            onFocus={e => e.target.style.transform = 'translate(-2px, -2px)'}
            onBlur={e => e.target.style.transform = 'none'}
          >
            <option value="FULL_TIME">{t('common.fullTime', {}, 'FULL-TIME')}</option>
            <option value="PART_TIME">{t('common.partTime', {}, 'PART-TIME')}</option>
            <option value="INTERNSHIP">{t('common.internship', {}, 'INTERNSHIP')}</option>
            <option value="CONTRACT">{t('common.contract', {}, 'CONTRACT')}</option>
          </select>
        </div>

        <div>
          <label htmlFor="jf-yearsOfExperience" style={LABEL}>{t('employer.yearsOfExperience', {}, 'Experience Required (Y)')} *</label>
          <input
            id="jf-yearsOfExperience"
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
          <label htmlFor="jf-salary" style={LABEL}>{t('employer.salary', {}, 'Salary')} ($/YR)</label>
          <input
            id="jf-salary"
            style={INPUT}
            type="number"
            min="0"
            value={form.salary}
            onChange={setField('salary')}
            placeholder={t('employer.salaryPlaceholder', {}, 'e.g. 75000')}
            onFocus={e => e.target.style.transform = 'translate(-2px, -2px)'}
            onBlur={e => e.target.style.transform = 'none'}
          />
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <label htmlFor="jf-technicalSkills" style={LABEL}>
            {t('employer.technicalSkills', {}, 'Technical Skills')}{' '}
            <span style={{ textTransform: 'none', fontWeight: 500, opacity: 0.6 }}>(CSV)</span>
          </label>
          <input
            id="jf-technicalSkills"
            style={INPUT}
            value={form.technicalSkills}
            onChange={setField('technicalSkills')}
            placeholder="React, Node.js, MongoDB"
            onFocus={e => e.target.style.transform = 'translate(-2px, -2px)'}
            onBlur={e => e.target.style.transform = 'none'}
          />
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <label htmlFor="jf-softSkills" style={LABEL}>
            {t('employer.softSkills', {}, 'Soft Skills')}{' '}
            <span style={{ textTransform: 'none', fontWeight: 500, opacity: 0.6 }}>(CSV)</span>
          </label>
          <input
            id="jf-softSkills"
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
        {saving ? t('employer.saving', {}, 'SAVING...') : t('employer.saveJob', {}, 'SAVE CHANGES')}
      </button>
    </form>
  );
}
