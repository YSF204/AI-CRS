import { Link } from 'react-router-dom';
import { Building2 } from 'lucide-react';

export default function CompanyProfileCard({ company, loading, error }) {
  return (
    <div 
      className="nm-card"
      style={{
        background: 'var(--nm-surface)',
        borderWidth: '4px',
        boxShadow: '8px 8px 0 var(--nm-ink)',
        padding: '2rem',
        display: 'flex', 
        flexDirection: 'column', 
        gap: 24,
        borderRadius: '0px',
        height: '100%',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ 
          background: 'var(--nm-error)', 
          border: '4px solid var(--nm-ink)', 
          padding: 14, 
          display: 'inline-flex', 
          flexShrink: 0,
          boxShadow: '4px 4px 0 var(--nm-ink)'
        }}>
          <Building2 size={28} color="#fff" strokeWidth={3} />
        </div>
        <div>
          <div style={{ 
            fontFamily: 'var(--font-display)', 
            fontSize: 12, 
            fontWeight: 800,
            color: 'var(--nm-text-tertiary)', 
            textTransform: 'uppercase', 
            letterSpacing: '0.12em' 
          }}>
            Company Profile
          </div>
          <div style={{ 
            fontFamily: 'var(--font-display)', 
            fontWeight: 900, 
            fontSize: 24, 
            color: 'var(--nm-text-primary)', 
            letterSpacing: '-0.02em', 
            marginTop: 4,
            textTransform: 'uppercase'
          }}>
            {loading ? 'Loading...' : (company?.name ?? 'No Profile')}
          </div>
        </div>
      </div>

      {/* Body */}
      {error ? (
        <div style={{ 
          fontFamily: 'var(--font-body)', 
          fontSize: 14, 
          color: 'var(--nm-error)',
          fontWeight: 600,
          padding: '1rem',
          border: '3px solid var(--nm-ink)',
          background: 'var(--nm-bg)'
        }}>
          Profile not set up.{' '}
          <Link to="/employer/profile" style={{ color: 'var(--nm-primary)', textDecoration: 'underline' }}>Create Profile →</Link>
        </div>
      ) : company ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {[
            { label: 'License',  val: company.license },
            { label: 'Contact',  val: company.contactEmail },
            { label: 'Website',  val: company.website },
            { label: 'Branches', val: company.branches?.map((b) => b.city).join(', ') },
          ].map(({ label, val }) =>
            val ? (
              <div key={label}>
                <div style={{ 
                  fontFamily: 'var(--font-display)', 
                  fontSize: 11, 
                  fontWeight: 800,
                  color: 'var(--nm-text-tertiary)', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.1em', 
                  marginBottom: 6 
                }}>
                  {label}
                </div>
                <div style={{ 
                  fontFamily: 'var(--font-body)', 
                  fontSize: 15, 
                  fontWeight: 600,
                  color: 'var(--nm-text-primary)', 
                  wordBreak: 'break-word', 
                  lineHeight: 1.4 
                }}>
                  {val}
                </div>
              </div>
            ) : null
          )}
        </div>
      ) : !loading ? (
        <div style={{ 
          fontFamily: 'var(--font-body)', 
          fontSize: 14, 
          color: 'var(--nm-text-tertiary)',
          fontStyle: 'italic'
        }}>
          No company profile detected.
        </div>
      ) : null}
    </div>
  );
}
