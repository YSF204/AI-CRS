import React from 'react';
import { Clock, ChevronRight } from 'lucide-react';
import { useTranslation } from '../../../../context/LanguageContext';

export default function SearchHistory({ history, historyLoading, onSelectRecord }) {
  const { t } = useTranslation();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {historyLoading ? (
        <div style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          color: 'var(--nm-text-tertiary)',
          padding: '4rem',
          textAlign: 'center',
          textTransform: 'uppercase',
          letterSpacing: '0.1em'
        }}>{t('employer.loadingHistory', {}, 'LOADING SEARCH HISTORY...')}</div>
      ) : history.length === 0 ? (
        <div style={{
          background: 'var(--nm-surface)',
          border: '4px solid var(--nm-ink)',
          padding: '5rem',
          textAlign: 'center',
          color: 'var(--nm-text-tertiary)',
          boxShadow: '10px 10px 0 var(--nm-ink)'
        }}>
          <Clock size={48} strokeWidth={2.5} style={{ margin: '0 auto 24px', opacity: 0.5 }} />
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 18, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {t('employer.noSearches', {}, 'No Search History Found')}
          </div>
        </div>
      ) : (
        history.map((record) => (
          <div key={record._id}
            onClick={() => onSelectRecord(record.candidate)}
            className="nm-card"
            style={{
              background: 'var(--nm-surface)',
              borderWidth: '4px',
              padding: '2rem 2.5rem',
              borderRadius: '0px',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 24,
              boxShadow: '6px 6px 0 var(--nm-ink)'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-4px, -4px)'; e.currentTarget.style.boxShadow = '10px 10px 0 var(--nm-ink)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '6px 6px 0 var(--nm-ink)'; }}
          >
            <div>
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 900,
                fontSize: 24,
                color: 'var(--nm-text-primary)',
                margin: '0 0 10px',
                textTransform: 'uppercase',
                letterSpacing: '-0.02em'
              }}>
                {record.searchRequirements.position}
              </h3>
              <div style={{
                fontFamily: 'var(--font-body)',
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--nm-text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                {new Date(record.createdAt).toLocaleDateString()} • {t('employer.matchesFoundCount', { count: record.candidate.length }, `${record.candidate.length} Matches Found`)}
              </div>
            </div>
            <div style={{
              width: 52,
              height: 52,
              background: 'var(--nm-bg)',
              border: '4px solid var(--nm-ink)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--nm-text-primary)',
              boxShadow: '4px 4px 0 var(--nm-ink)'
            }}>
              <ChevronRight size={28} strokeWidth={3} />
            </div>
          </div>
        ))
      )}
    </div>
  );
}
