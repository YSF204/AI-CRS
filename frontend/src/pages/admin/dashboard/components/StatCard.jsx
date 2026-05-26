import React from 'react';
import CountUp from '../../../../components/ui/CountUp';

export default function StatCard({ icon: Icon, label, value, tone, detail }) {
  return (
    <div
      className="nm-card"
      style={{
        background: tone.surface,
        color: tone.text,
        padding: 'var(--spacing-5)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--spacing-4)' }}>
        <div>
          <div style={{
            fontFamily: 'var(--font-body)',
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            opacity: 0.7,
            marginBottom: 'var(--spacing-3)'
          }}>
            {label}
          </div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-4xl)',
            fontWeight: 700,
            lineHeight: 1,
            marginBottom: 'var(--spacing-3)',
            letterSpacing: '-0.02em',
            textTransform: 'uppercase'
          }}>
            <CountUp to={Number(value || 0)} />
          </div>
          <div style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            opacity: 0.8
          }}>
            {detail}
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            height: '48px',
            width: '48px',
            alignItems: 'center',
            justifyContent: 'center',
            border: `4px solid ${tone.text}`,
            background: tone.badge,
            boxShadow: `4px 4px 0 ${tone.text}`,
            borderRadius: '0px',
            flexShrink: 0
          }}
        >
          <Icon size={22} strokeWidth={2.5} color="#1b1c15" />
        </div>
      </div>
    </div>
  );
}
