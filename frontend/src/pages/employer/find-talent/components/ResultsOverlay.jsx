import React from 'react';
import { XCircle } from 'lucide-react';
import CandidateCard from './CandidateCard';
import { useTranslation } from '../../../../context/LanguageContext';

export default function ResultsOverlay({ results, onClose }) {
  const { t } = useTranslation();

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(12px)',
      zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
      overflowY: 'auto', padding: 'clamp(1rem, 5vw, 4rem)',
    }}>
      <div
        className="nm-card"
        style={{
          background: 'var(--nm-bg)', width: 'min(96vw, 1200px)',
          border: '4px solid var(--nm-ink)', boxShadow: '20px 20px 0 rgba(0,0,0,0.5)',
          padding: 'clamp(2rem, 5vw, 4rem)', position: 'relative', marginTop: '4rem', marginBottom: '4rem',
          borderRadius: '0px',
        }}
      >
        <button
          onClick={onClose}
          className="nm-btn"
          style={{
            position: 'absolute', top: -30, right: -30, width: 60, height: 60,
            background: 'var(--nm-error)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 0
          }}
        >
          <XCircle size={32} strokeWidth={2.5} />
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4rem', flexWrap: 'wrap', gap: 24 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--nm-primary)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 8 }}>
              {t('employer.aiMatchingEngine', {}, 'AI MATCHING ENGINE')}
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(2.5rem, 6vw, 4rem)', color: 'var(--nm-text-primary)', textTransform: 'uppercase', letterSpacing: '-0.04em', lineHeight: 1, margin: 0 }}>
              {t('employer.matchingCandidates', {}, 'MATCHING CANDIDATES')}
            </h2>
          </div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 14,
            background: 'var(--nm-warning)',
            color: '#0a0a0a',
            border: '4px solid var(--nm-ink)',
            padding: '10px 20px',
            fontWeight: 900,
            textTransform: 'uppercase',
            boxShadow: '6px 6px 0 var(--nm-ink)'
          }}>
            {t('employer.precisionRanked', {}, 'PRECISION RANKED')}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        {results.map((candidate, i) => (
          <CandidateCard key={candidate.cvId?._id || candidate.cvId || i} candidate={candidate} index={i} />
        ))}
      </div>
      </div>
    </div>
  );
}
