import React from 'react';
import { Search, Sparkles, AlertCircle } from 'lucide-react';

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

export default function SearchForm({ form, set, loading, error, onSubmit }) {
  return (
    <div
      className="nm-card"
      style={{
        background: 'var(--nm-surface)',
        borderWidth: '4px',
        boxShadow: '12px 12px 0 var(--nm-ink)',
        padding: 'clamp(2rem, 6vw, 5rem)',
        borderRadius: '0px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
        <div style={{
          background: 'var(--nm-primary)',
          padding: 12,
          border: '4px solid var(--nm-ink)',
          boxShadow: '4px 4px 0 var(--nm-ink)',
          display: 'inline-flex'
        }}>
          <Sparkles size={32} color="#fff" strokeWidth={2.5} />
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
          AI Matchmaker
        </h1>
      </div>
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: 16,
        color: 'var(--nm-text-secondary)',
        marginBottom: '4rem',
        maxWidth: '800px',
        lineHeight: 1.6
      }}>
        Harness advanced neural filtering to identify top-tier talent. Our engine analyzes competencies, soft skills, and experience history to deliver precision matching.
      </p>

      {error && (
        <div style={{
          padding: '20px 24px',
          background: 'var(--nm-error)',
          color: '#fff',
          border: '4px solid var(--nm-ink)',
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: 14,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginBottom: 32,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          boxShadow: '4px 4px 0 var(--nm-ink)'
        }}>
          <AlertCircle size={24} strokeWidth={3} /> {error}
        </div>
      )}

      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>
          <div>
            <label htmlFor="search-title" style={LABEL}>Job Title *</label>
            <input
              id="search-title"
              style={INPUT}
              value={form.position}
              onChange={set('position')}
              placeholder="e.g. SYSTEMS ARCHITECT"
              required
              onFocus={e => e.target.style.transform = 'translate(-2px, -2px)'}
              onBlur={e => e.target.style.transform = 'none'}
            />
          </div>
          <div>
            <label htmlFor="search-exp" style={LABEL}>Minimum Experience (Years)</label>
            <input
              id="search-exp"
              style={INPUT}
              type="number"
              min="0"
              value={form.yearsOfExperience}
              onChange={set('yearsOfExperience')}
              placeholder="e.g. 5"
              onFocus={e => e.target.style.transform = 'translate(-2px, -2px)'}
              onBlur={e => e.target.style.transform = 'none'}
            />
          </div>
        </div>

        <div>
          <label htmlFor="search-desc" style={LABEL}>Job Description</label>
          <textarea
            id="search-desc"
            style={{ ...INPUT, minHeight: 140, resize: 'vertical' }}
            value={form.description}
            onChange={set('description')}
            placeholder="Describe the role, responsibilities, and key requirements..."
            onFocus={e => e.target.style.transform = 'translate(-2px, -2px)'}
            onBlur={e => e.target.style.transform = 'none'}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>
          <div>
            <label htmlFor="search-tech" style={LABEL}>Technical Skills <span style={{ textTransform: 'none', fontWeight: 500, opacity: 0.6 }}>(comma separated)</span></label>
            <input
              id="search-tech"
              style={INPUT}
              value={form.technicalSkills}
              onChange={set('technicalSkills')}
              placeholder="React, Docker, Kubernetes"
              onFocus={e => e.target.style.transform = 'translate(-2px, -2px)'}
              onBlur={e => e.target.style.transform = 'none'}
            />
          </div>
          <div>
            <label htmlFor="search-soft" style={LABEL}>Soft Skills <span style={{ textTransform: 'none', fontWeight: 500, opacity: 0.6 }}>(comma separated)</span></label>
            <input
              id="search-soft"
              style={INPUT}
              value={form.softSkills}
              onChange={set('softSkills')}
              placeholder="Strategic Thinking, Resilience"
              onFocus={e => e.target.style.transform = 'translate(-2px, -2px)'}
              onBlur={e => e.target.style.transform = 'none'}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>
          <div>
            <label htmlFor="search-lang" style={LABEL}>Languages <span style={{ textTransform: 'none', fontWeight: 500, opacity: 0.6 }}>(comma separated)</span></label>
            <input
              id="search-lang"
              style={INPUT}
              value={form.language}
              onChange={set('language')}
              placeholder="English (Fluent), German"
              onFocus={e => e.target.style.transform = 'translate(-2px, -2px)'}
              onBlur={e => e.target.style.transform = 'none'}
            />
          </div>
          <div>
            <label htmlFor="search-notes" style={LABEL}>Additional Requirements</label>
            <input
              id="search-notes"
              style={INPUT}
              value={form.additionalNotes}
              onChange={set('additionalNotes')}
              placeholder="Specific timezone, clearance, or relocation..."
              onFocus={e => e.target.style.transform = 'translate(-2px, -2px)'}
              onBlur={e => e.target.style.transform = 'none'}
            />
          </div>
        </div>

        <button
          type="submit"
          className="nm-btn"
          disabled={loading}
          style={{
            background: 'var(--nm-primary)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            padding: '20px',
            width: '100%',
            fontFamily: 'var(--font-display)',
            fontWeight: 900,
            fontSize: 18,
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            marginTop: 16,
          }}
        >
          {loading ? (
            <>
              <Search className="animate-spin" size={28} strokeWidth={3} />
              SEARCHING...
            </>
          ) : (
            <>
              <Sparkles size={28} strokeWidth={2.5} />
              SEARCH CANDIDATES →
            </>
          )}
        </button>
      </form>
    </div>
  );
}
