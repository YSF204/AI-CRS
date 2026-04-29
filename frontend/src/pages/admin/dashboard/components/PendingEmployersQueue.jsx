import React from 'react';
import { Clock, ShieldCheck } from 'lucide-react';

export default function PendingEmployersQueue({ pendingEmployers, palette, navigate }) {
  return (
    <div className="nm-card" style={{
      background: 'var(--nm-surface)',
      padding: 'var(--spacing-6)',
      gridColumn: '1 / -1'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 'var(--spacing-5)',
        gap: 'var(--spacing-4)'
      }}>
        <div>
          <div style={{
            fontFamily: 'var(--font-body)',
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            color: 'var(--nm-text-secondary)',
            marginBottom: 'var(--spacing-2)'
          }}>
            Approval Queue
          </div>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-2xl)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
            margin: 0,
            color: 'var(--nm-text-primary)'
          }}>
            Pending Employers
          </h2>
        </div>
        <div
          style={{
            display: 'flex',
            height: '48px',
            width: '48px',
            alignItems: 'center',
            justifyContent: 'center',
            border: `4px solid ${palette.text}`,
            background: palette.blue300,
            boxShadow: `4px 4px 0 ${palette.text}`,
            borderRadius: '0px',
            flexShrink: 0
          }}
        >
          <Clock size={20} strokeWidth={2.5} color="#1b1c15" />
        </div>
      </div>

      {!pendingEmployers || pendingEmployers.pendingEmployers.length === 0 ? (
        <div style={{
          padding: 'var(--spacing-8)',
          textAlign: 'center',
          color: 'var(--nm-text-secondary)'
        }}>
          <Clock size={48} style={{ marginBottom: 'var(--spacing-4)', opacity: 0.5 }} />
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            margin: 0
          }}>
            No pending employer approvals
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gap: 'var(--spacing-4)',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))'
        }}>
          {pendingEmployers.pendingEmployers.map(({ user, employer }) => (
            <div
              key={user._id}
              className="nm-card"
              style={{
                padding: 'var(--spacing-4)',
                background: 'var(--nm-surface-low)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--spacing-3)'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-3)',
                marginBottom: 'var(--spacing-2)'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '4px solid var(--nm-ink)',
                  background: palette.blue100,
                  borderRadius: '0px',
                  flexShrink: 0
                }}>
                  <ShieldCheck size={20} strokeWidth={2.5} color={palette.text} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'var(--text-base)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '-0.02em',
                    color: 'var(--nm-text-primary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {user.firstName} {user.lastName}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--nm-text-secondary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {employer?.company?.name || 'Company name pending'}
                  </div>
                </div>
              </div>
              <div style={{
                display: 'flex',
                gap: 'var(--spacing-2)',
                marginTop: 'auto'
              }}>
                <button
                  onClick={() => navigate(`/admin/users/${user._id}`)}
                  className="nm-btn"
                  style={{
                    flex: 1,
                    padding: 'var(--spacing-2) var(--spacing-3)',
                    fontSize: 'var(--text-xs)'
                  }}
                >
                  Review
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {pendingEmployers && pendingEmployers.total > 5 && (
        <div style={{
          marginTop: 'var(--spacing-4)',
          paddingTop: 'var(--spacing-4)',
          borderTop: '4px solid var(--nm-ink)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            color: 'var(--nm-text-secondary)'
          }}>
            {pendingEmployers.total} total pending
          </span>
          <button
            onClick={() => navigate('/admin/users')}
            className="nm-btn"
            style={{
              padding: 'var(--spacing-2) var(--spacing-4)',
              fontSize: 'var(--text-sm)'
            }}
          >
            View All
          </button>
        </div>
      )}
    </div>
  );
}
