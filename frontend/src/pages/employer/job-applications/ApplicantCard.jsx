import React from 'react';
import { Star } from 'lucide-react';

export default function ApplicantCard({ app, onClick, compact, showMatchScore = true }) {
  if (compact) {
    return (
      <div
        style={{
          background: 'var(--nm-surface)',
          border: '3px solid var(--nm-ink)',
          padding: '12px 16px',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          transition: 'transform 0.15s ease, background 0.15s ease',
        }}
        onClick={onClick}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px, -2px)'; e.currentTarget.style.boxShadow = '4px 4px 0 var(--nm-ink)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 900,
            fontSize: 14,
            color: 'var(--nm-text-primary)',
            textTransform: 'uppercase',
            letterSpacing: '-0.01em',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {app.applicantInfo?.fullName || 'Unidentified'}
            {app.isPotential && <Star size={12} fill="var(--nm-warning)" color="var(--nm-warning)" style={{ marginLeft: 6, display: 'inline' }} />}
          </div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 10,
            fontWeight: 800,
            color: 'var(--nm-text-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginTop: 2,
          }}>
            {app.applicantInfo?.email || '—'}
          </div>
        </div>
        {showMatchScore && (
          <div style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 900,
            fontSize: 18,
            flexShrink: 0,
            color: (app.matchPercentage || 0) > 80 ? 'var(--nm-success)' : 'var(--nm-warning)',
          }}>
            {app.matchPercentage ?? '—'}%
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="nm-card"
      style={{
        background: 'var(--nm-surface)',
        borderWidth: '4px',
        boxShadow: '6px 6px 0 var(--nm-ink)',
        padding: '2rem',
        cursor: 'pointer',
        borderRadius: '0px',
        transition: 'transform 0.2s ease'
      }}
      onClick={onClick}
      onMouseEnter={e => e.currentTarget.style.transform = 'translate(-4px, -4px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'none'}
    >
      <div style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 900,
        fontSize: 24,
        color: 'var(--nm-text-primary)',
        textTransform: 'uppercase',
        letterSpacing: '-0.02em',
        marginBottom: 8
      }}>
        {app.applicantInfo?.fullName || "ENTITY UNIDENTIFIED"}
        {app.isPotential && <Star size={20} fill="var(--nm-warning)" color="var(--nm-warning)" style={{ marginLeft: 8, display: 'inline', verticalAlign: 'middle' }} />}
      </div>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: 12,
        fontWeight: 800,
        color: 'var(--nm-text-tertiary)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
      }}>
        {app.applicantInfo?.email || "DATA MASKED"}
      </div>

      {showMatchScore && (
        <div style={{
          marginTop: 24,
          background: 'var(--nm-bg)',
          border: '3px solid var(--nm-ink)',
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 13, color: 'var(--nm-text-primary)' }}>
            MATCH SCORE
          </div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 900,
            fontSize: 24,
            color: app.matchPercentage > 80 ? 'var(--nm-success)' : 'var(--nm-warning)'
          }}>
            {app.matchPercentage ?? "—"}%
          </div>
        </div>
      )}

      <div style={{
        marginTop: 16,
        fontFamily: 'var(--font-display)',
        fontSize: 11,
        fontWeight: 800,
        color: 'var(--nm-text-tertiary)',
        textTransform: 'uppercase',
        letterSpacing: '0.1em'
      }}>
        INTAKE: {new Date(app.createdAt).toLocaleDateString()}
      </div>
    </div>
  );
}
