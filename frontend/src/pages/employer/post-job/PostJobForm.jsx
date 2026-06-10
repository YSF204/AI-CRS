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

export default function PostJobForm({ form, set, handleSubmit, loading }) {
  const { t } = useTranslation();

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>
        <div>
          <label htmlFor="pjf-position" style={LABEL}>{t('employer.jobTitle', {}, 'Job Title')} *</label>
          <input
            id="pjf-position"
            style={INPUT}
            value={form.position}
            onChange={set('position')}
            placeholder={t('employer.jobTitlePlaceholder', {}, 'e.g. Software engineer')}
            required
            onFocus={e => e.target.style.transform = 'translate(-2px, -2px)'}
            onBlur={e => e.target.style.transform = 'none'}
          />
        </div>
        <div>
          <label htmlFor="pjf-salary" style={LABEL}>{t('employer.salary', {}, 'Salary (₪/month)')} *</label>
          <input
            id="pjf-salary"
            style={INPUT}
            type="number"
            value={form.salary}
            onChange={set('salary')}
            placeholder={t('employer.salaryPlaceholder', {}, 'e.g. 3500')}
            required
            onFocus={e => e.target.style.transform = 'translate(-2px, -2px)'}
            onBlur={e => e.target.style.transform = 'none'}
          />
        </div>
      </div>

      <div>
        <label htmlFor="pjf-description" style={LABEL}>{t('employer.jobDescription', {}, 'Description')} *</label>
        <textarea
          id="pjf-description"
          style={{ ...INPUT, minHeight: 180, resize: 'vertical', lineHeight: 1.7 }}
          value={form.description}
          onChange={set('description')}
          placeholder={t('employer.jobDescriptionPlaceholder', {}, 'Describe the role, responsibilities, and key requirements...')}
          required
          onFocus={e => e.target.style.transform = 'translate(-2px, -2px)'}
          onBlur={e => e.target.style.transform = 'none'}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32 }}>
        <div>
          <label htmlFor="pjf-workSite" style={LABEL}>{t('employer.workMode', {}, 'Work Mode')} *</label>
          <select
            id="pjf-workSite"
            style={{ ...INPUT, cursor: 'pointer' }}
            value={form.workSite}
            onChange={set('workSite')}
            onFocus={e => e.target.style.transform = 'translate(-2px, -2px)'}
            onBlur={e => e.target.style.transform = 'none'}
          >
            <option value="REMOTE">{t('common.remote', {}, 'REMOTE')}</option>
            <option value="ON_SITE">{t('common.onsite', {}, 'ON-SITE')}</option>
            <option value="HYBRID">{t('common.hybrid', {}, 'HYBRID')}</option>
          </select>
        </div>
        <div>
          <label htmlFor="pjf-workDuration" style={LABEL}>{t('employer.jobType', {}, 'Job Type')} *</label>
          <select
            id="pjf-workDuration"
            style={{ ...INPUT, cursor: 'pointer' }}
            value={form.workDuration}
            onChange={set('workDuration')}
            onFocus={e => e.target.style.transform = 'translate(-2px, -2px)'}
            onBlur={e => e.target.style.transform = 'none'}
          >
            <option value="FULL_TIME">{t('common.fullTime', {}, 'FULL-TIME')}</option>
            <option value="PART_TIME">{t('common.partTime', {}, 'PART-TIME')}</option>
            <option value="CONTRACT">{t('common.contract', {}, 'CONTRACT')}</option>
            <option value="INTERNSHIP">{t('common.internship', {}, 'INTERNSHIP')}</option>
          </select>
        </div>
        <div>
          <label htmlFor="pjf-yearsOfExperience" style={LABEL}>{t('employer.yearsOfExperience', {}, 'Experience Required (Y)')} *</label>
          <input
            id="pjf-yearsOfExperience"
            style={INPUT}
            type="number"
            min="0"
            value={form.yearsOfExperience}
            onChange={set('yearsOfExperience')}
            placeholder={t('employer.experiencePlaceholder', {}, 'e.g. 3')}
            required
            onFocus={e => e.target.style.transform = 'translate(-2px, -2px)'}
            onBlur={e => e.target.style.transform = 'none'}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>
        <div>
          <label htmlFor="pjf-technicalSkills" style={LABEL}>
            {t('employer.technicalSkills', {}, 'Technical Skills')}{' '}
            <span style={{ textTransform: 'none', fontWeight: 500, opacity: 0.6 }}>(CSV)</span>
          </label>
          <input
            id="pjf-technicalSkills"
            style={INPUT}
            value={form.technicalSkills}
            onChange={set('technicalSkills')}
            placeholder={t('employer.technicalSkillsPlaceholder', {}, 'e.g. Python, React, SQL')}
            onFocus={e => e.target.style.transform = 'translate(-2px, -2px)'}
            onBlur={e => e.target.style.transform = 'none'}
          />
        </div>
        <div>
          <label htmlFor="pjf-softSkills" style={LABEL}>
            {t('employer.softSkills', {}, 'Soft Skills')}{' '}
            <span style={{ textTransform: 'none', fontWeight: 500, opacity: 0.6 }}>(CSV)</span>
          </label>
          <input
            id="pjf-softSkills"
            style={INPUT}
            value={form.softSkills}
            onChange={set('softSkills')}
            placeholder={t('employer.softSkillsPlaceholder', {}, 'e.g. Teamwork, Communication')}
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
        {loading ? t('employer.posting', {}, 'POSTING...') : t('employer.postJobSubmit', {}, 'POST JOB')}
      </button>
    </form>
  );
}
