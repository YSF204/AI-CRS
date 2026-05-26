import React from 'react';
import { ArrowLeft, Mail, Phone, Briefcase, Calendar, Check, X, Star, Loader } from 'lucide-react';

function DetailRow({ icon, label, value }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '6px 0',
      borderBottom: '1px solid var(--nm-ink)',
    }}>
      <span style={{ color: 'var(--nm-primary)', flexShrink: 0 }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--nm-text-tertiary)' }}>
          {label}
        </div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 700, color: 'var(--nm-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {value || '—'}
        </div>
      </div>
    </div>
  );
}

export default function ApplicantDetail({ 
  app, 
  onClose, 
  showBackButton = true, 
  showMatchScore = true,
  onStatusChange,
  onTogglePotential,
  isToggling = false
}) {
  const applicant = app.applicantInfo || {};
  const statusColor = app.status === 'accepted' ? 'var(--nm-success)' : app.status === 'rejected' ? 'var(--nm-error)' : 'var(--nm-warning)';

  return (
    <div>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 900,
        fontSize: 20,
        color: 'var(--nm-text-primary)',
        textTransform: 'uppercase',
        letterSpacing: '-0.02em',
        marginBottom: 4,
      }}>
        {applicant.fullName || 'Unidentified'}
      </div>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: 13,
        fontWeight: 800,
        color: 'var(--nm-text-tertiary)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginBottom: 20,
      }}>
        {applicant.email || '—'}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <DetailRow icon={<Mail size={14} strokeWidth={3} />} label="Email" value={applicant.email} />
        <DetailRow icon={<Phone size={14} strokeWidth={3} />} label="Phone" value={applicant.phone} />
        <DetailRow icon={<Briefcase size={14} strokeWidth={3} />} label="Experience" value={applicant.yearsOfExperience != null ? `${applicant.yearsOfExperience} years` : '—'} />
        <DetailRow icon={<Calendar size={14} strokeWidth={3} />} label="Applied" value={new Date(app.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} />

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 0',
          borderTop: '2px solid var(--nm-ink)',
          marginTop: 4,
        }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--nm-text-tertiary)' }}>
            Status
          </span>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: 12,
            fontWeight: 900,
            textTransform: 'uppercase',
            background: statusColor,
            color: '#fff',
            padding: '4px 12px',
            border: '2px solid var(--nm-ink)',
          }}>
            {app.status}
          </span>
        </div>

        {showMatchScore && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 0',
            borderTop: '2px solid var(--nm-ink)',
          }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--nm-text-tertiary)' }}>
              Match Score
            </span>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 900,
              fontSize: 22,
              color: (app.matchPercentage || 0) > 80 ? 'var(--nm-success)' : 'var(--nm-warning)',
            }}>
              {app.matchPercentage ?? '—'}%
            </span>
          </div>
        )}

        {(applicant.technicalSkills || []).length > 0 && (
          <div style={{ marginTop: 8 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--nm-text-tertiary)', marginBottom: 8 }}>
              Skills
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {applicant.technicalSkills.map((s, i) => (
                <span key={i} style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 10,
                  fontWeight: 900,
                  padding: '3px 8px',
                  border: '2px solid var(--nm-ink)',
                  background: 'var(--nm-primary)',
                  color: '#fff',
                  textTransform: 'uppercase',
                }}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24, paddingTop: 24, borderTop: '4px solid var(--nm-ink)' }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => onStatusChange?.('accepted')}
              className="nm-btn"
              style={{
                flex: 1,
                padding: '12px',
                background: 'var(--nm-success)',
                color: '#fff',
                fontFamily: 'var(--font-display)',
                fontWeight: 900,
                fontSize: 12,
                textTransform: 'uppercase',
                border: '3px solid var(--nm-ink)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                opacity: app.status === 'accepted' ? 0.5 : 1,
                cursor: app.status === 'accepted' ? 'default' : 'pointer'
              }}
              disabled={app.status === 'accepted'}
            >
              <Check size={16} strokeWidth={3} /> Accept
            </button>
            <button
              onClick={() => onStatusChange?.('rejected')}
              className="nm-btn"
              style={{
                flex: 1,
                padding: '12px',
                background: 'var(--nm-error)',
                color: '#fff',
                fontFamily: 'var(--font-display)',
                fontWeight: 900,
                fontSize: 12,
                textTransform: 'uppercase',
                border: '3px solid var(--nm-ink)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                opacity: app.status === 'rejected' ? 0.5 : 1,
                cursor: app.status === 'rejected' ? 'default' : 'pointer'
              }}
              disabled={app.status === 'rejected'}
            >
              <X size={16} strokeWidth={3} /> Reject
            </button>
          </div>
          
          <button
            onClick={() => onTogglePotential?.()}
            className="nm-btn"
            disabled={isToggling}
            style={{
              width: '100%',
              padding: '12px',
              background: app.isPotential ? 'var(--nm-warning)' : 'var(--nm-surface)',
              color: app.isPotential ? '#000' : 'var(--nm-text-primary)',
              fontFamily: 'var(--font-display)',
              fontWeight: 900,
              fontSize: 12,
              textTransform: 'uppercase',
              border: '3px solid var(--nm-ink)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              opacity: isToggling ? 0.7 : 1,
              cursor: isToggling ? 'wait' : 'pointer'
            }}
          >
            {isToggling ? (
              <Loader size={16} className="animate-spin" />
            ) : (
              <Star size={16} strokeWidth={3} fill={app.isPotential ? 'currentColor' : 'none'} />
            )}
            {app.isPotential ? 'In Potential List' : 'Add to Potential List'}
          </button>
        </div>
      </div>

      {showBackButton && onClose && (
        <button
          onClick={onClose}
          className="nm-btn"
          style={{
            width: '100%',
            marginTop: '1.5rem',
            padding: '12px',
            background: 'var(--nm-surface)',
            color: 'var(--nm-text-primary)',
            fontFamily: 'var(--font-display)',
            fontWeight: 900,
            fontSize: 12,
            textTransform: 'uppercase',
            border: '3px solid var(--nm-ink)',
          }}
        >
          <ArrowLeft size={14} strokeWidth={3} style={{ marginRight: 6, verticalAlign: 'middle' }} /> Back to List
        </button>
      )}
    </div>
  );
}
