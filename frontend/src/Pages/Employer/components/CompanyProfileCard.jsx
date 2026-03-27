import { Link } from 'react-router-dom';
import { Building2 } from 'lucide-react';

/**
 * CompanyProfileCard
 * Displays the employer's company profile data.
 * Pure presentational — receives profile data as props.
 */
export default function CompanyProfileCard({ company, loading, error }) {
  return (
    <div style={{
      gridColumn: 'span 4',
      background: 'var(--card-bg)',
      border: '3px solid var(--border-color)',
      boxShadow: '5px 5px 0 var(--shadow-color)',
      padding: '1.5rem',
      display: 'flex', flexDirection: 'column', gap: 16,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ background: '#FF6B6B', border: '2px solid #0a0a0a', padding: 12, display: 'inline-flex', flexShrink: 0 }}>
          <Building2 size={24} color="#0a0a0a" strokeWidth={2.5} />
        </div>
        <div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Company
          </div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 22, color: 'var(--fg)', letterSpacing: '-0.02em', marginTop: 2 }}>
            {loading ? 'Loading...' : (company?.name ?? 'No Profile')}
          </div>
        </div>
      </div>

      {/* Body */}
      {error ? (
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: '#FF6B6B' }}>
          Could not load profile.{' '}
          <Link to="/employer/profile" style={{ color: '#FFE630' }}>Set it up →</Link>
        </div>
      ) : company ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { label: 'License',  val: company.license },
            { label: 'Contact',  val: company.contactEmail },
            { label: 'Website',  val: company.website },
            { label: 'Branches', val: company.branches?.map((b) => b.city).join(', ') },
          ].map(({ label, val }) =>
            val ? (
              <div key={label}>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
                  {label}
                </div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 15, color: 'var(--fg)', wordBreak: 'break-word', lineHeight: 1.4 }}>
                  {val}
                </div>
              </div>
            ) : null
          )}
        </div>
      ) : !loading ? (
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: 'var(--fg-muted)' }}>
          No company profile found.
        </div>
      ) : null}
    </div>
  );
}
