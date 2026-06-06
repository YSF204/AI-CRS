import React from 'react';
import { Sparkles, CheckCircle2, XCircle } from 'lucide-react';
import { useTranslation } from '../../../../context/LanguageContext';

export default function CandidateCard({ candidate, index }) {
  const { t } = useTranslation();

  const displayName =
    candidate.profile?.name && candidate.profile.name !== 'Unknown'
      ? candidate.profile.name
      : candidate.profile?.email || t('employer.secureEntity', {}, 'SECURE ENTITY');

  const contact = candidate.profile?.contact || {};
  const contactItems = [
    candidate.profile?.email && { label: t('auth.email', {}, 'Email'), value: candidate.profile.email },
    contact.phone && { label: t('employer.phone', {}, 'Phone'), value: contact.phone },
    contact.github && { label: t('employer.github', {}, 'GitHub'), value: contact.github },
    contact.linkedin && { label: t('employer.linkedin', {}, 'LinkedIn'), value: contact.linkedin },
  ].filter(Boolean);

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
        #{index + 1}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 24 }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 32, margin: '0 0 8px', color: 'var(--nm-text-primary)', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
            {displayName}
          </h3>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 16, fontWeight: 600, color: 'var(--nm-text-tertiary)', marginBottom: 12 }}>
            {candidate.profile?.jobTitle || candidate.CVId?.jobTitle || t('employer.unspecifiedRole', {}, 'UNSPECIFIED ROLE')} • {candidate.profile?.email || t('employer.dataEncrypted', {}, 'DATA ENCRYPTED')}
          </div>
          {contactItems.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 12 }}>
              {contactItems.map((item) => (
                <div
                  key={`${item.label}-${item.value}`}
                  style={{
                    border: '2px solid var(--nm-ink)',
                    background: 'var(--nm-bg)',
                    padding: '8px 12px',
                    fontFamily: 'var(--font-body)',
                    fontSize: 13,
                    fontWeight: 700,
                    color: 'var(--nm-text-primary)',
                    textTransform: 'none',
                  }}
                >
                  <span style={{ color: 'var(--nm-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {item.label}:
                  </span>{' '}
                  {item.value}
                </div>
              ))}
            </div>
          )}
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
            {t('employer.compatibility', {}, 'Compatibility')}
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
          <Sparkles size={18} strokeWidth={3} /> {t('employer.neuralReasoning', {}, 'Neural Reasoning')}
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

      {candidate.profile?.summary && (
        <div style={{
          marginTop: '2rem',
          background: 'var(--nm-surface-high)',
          border: '4px solid var(--nm-ink)',
          padding: '1.5rem 2rem',
        }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 13,
            color: 'var(--nm-primary)',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            marginBottom: 10,
            fontWeight: 900
          }}>
            {t('employer.profileSnapshot', {}, 'Profile Snapshot')}
          </div>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 16,
            lineHeight: 1.7,
            color: 'var(--nm-text-primary)',
            margin: 0
          }}>
            {candidate.profile.summary}
          </p>
        </div>
      )}

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
            <CheckCircle2 size={20} strokeWidth={3} /> {t('employer.strengths', {}, 'Strategic Strengths')}
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
            <XCircle size={20} strokeWidth={3} /> {t('employer.criticalGaps', {}, 'Critical Gaps')}
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
            }}>{t('employer.zeroDeficiencyDetected', {}, 'Zero deficiency detected')}</span>
          )}
        </div>
      </div>
    </div>
  );
}
