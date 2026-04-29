import React from 'react';
import { Sparkles, CheckCircle2, XCircle } from 'lucide-react';

export default function CandidateCard({ candidate, index }) {
  return (
    <div
      className="nm-card"
      style={{
        background: 'var(--nm-surface)',
        borderWidth: '4px',
        boxShadow: '8px 8px 0 var(--nm-ink)',
        padding: '2.5rem',
        position: 'relative',
        borderRadius: '0px'
      }}
    >
      <div style={{
        position: 'absolute',
        top: -20,
        left: -20,
        width: 50,
        height: 50,
        background: 'var(--nm-primary)',
        border: '4px solid var(--nm-ink)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-display)',
        fontWeight: 900,
        fontSize: 22,
        color: '#fff',
        boxShadow: '4px 4px 0 var(--nm-ink)'
      }}>
        #{candidate.rank}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 24 }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 32, margin: '0 0 8px', color: 'var(--nm-text-primary)', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
            {candidate.profile?.name || candidate.userId?.firstName + ' ' + candidate.userId?.lastName || 'SECURE ENTITY'}
          </h3>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 16, fontWeight: 600, color: 'var(--nm-text-tertiary)', marginBottom: 12 }}>
            {candidate.profile?.jobTitle || candidate.CVId?.jobTitle || 'UNSPECIFIED ROLE'} • {candidate.profile?.email || candidate.userId?.email || 'DATA ENCRYPTED'}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 900,
            fontSize: 48,
            color: candidate.matchScore > 80 ? 'var(--nm-success)' : (candidate.matchScore > 60 ? 'var(--nm-warning)' : 'var(--nm-error)'),
            lineHeight: 1
          }}>
            {candidate.matchScore}%
          </div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 12,
            color: 'var(--nm-text-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            fontWeight: 800
          }}>
            Compatibility
          </div>
        </div>
      </div>

      <div style={{
        background: 'var(--nm-bg)',
        border: '4px solid var(--nm-ink)',
        padding: '2rem',
        marginTop: '2rem',
        boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 13,
          color: 'var(--nm-primary)',
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          marginBottom: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontWeight: 900
        }}>
          <Sparkles size={18} strokeWidth={3} /> Neural Reasoning
        </div>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 18,
          fontWeight: 500,
          color: 'var(--nm-text-primary)',
          lineHeight: 1.7,
          margin: 0
        }}>
          {candidate.reasoning}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem', marginTop: '2.5rem' }}>
        <div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 13,
            color: 'var(--nm-success)',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontWeight: 900
          }}>
            <CheckCircle2 size={20} strokeWidth={3} /> Strategic Strengths
          </div>
          <ul style={{
            margin: 0,
            padding: 0,
            listStyle: 'none',
            fontFamily: 'var(--font-body)',
            fontSize: 16,
            fontWeight: 600,
            color: 'var(--nm-text-secondary)',
            lineHeight: 1.6
          }}>
            {candidate.strengths?.map((str, idx) => (
              <li key={idx} style={{
                marginBottom: 10,
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start'
              }}>
                <span style={{ color: 'var(--nm-success)', fontWeight: 900 }}>•</span>
                {str}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 13,
            color: 'var(--nm-error)',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontWeight: 900
          }}>
            <XCircle size={20} strokeWidth={3} /> Critical Gaps
          </div>
          {candidate.skillsMissing?.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {candidate.skillsMissing.map(skill => (
                <span key={skill} style={{
                  background: 'var(--nm-bg)',
                  border: '3px solid var(--nm-error)',
                  color: 'var(--nm-error)',
                  padding: '6px 14px',
                  fontSize: 14,
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  textTransform: 'uppercase'
                }}>
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: 16,
              color: 'var(--nm-text-tertiary)',
              fontStyle: 'italic',
              fontWeight: 500
            }}>Zero deficiency detected</span>
          )}
        </div>
      </div>

      <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'flex-end' }}>
         <button
          onClick={() => alert('Detailed dossier access coming in next build phase.')}
          className="nm-btn"
          style={{
            padding: '14px 28px',
            background: 'var(--nm-text-primary)',
            color: 'var(--nm-bg)',
            fontFamily: 'var(--font-display)',
            fontWeight: 900,
            fontSize: 14,
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
          }}
         >
           View Full Dossier
         </button>
      </div>
    </div>
  );
}
