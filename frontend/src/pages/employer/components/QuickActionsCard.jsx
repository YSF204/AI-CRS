import { Link } from 'react-router-dom';
import { PlusCircle, Users, Briefcase, ChevronRight } from 'lucide-react';

const hoverIn = (e) => {
  e.currentTarget.style.transform = 'translate(3px,3px)';
  e.currentTarget.style.boxShadow = '2px 2px 0 #0a0a0a';
};
const hoverOut = (e) => {
  e.currentTarget.style.transform = '';
  e.currentTarget.style.boxShadow = '5px 5px 0 #0a0a0a';
};

/**
 * QuickActionsCard
 * Spans 8 columns, arranged horizontally for the wider dashboard layout.
 */
export default function QuickActionsCard({ onPostJob }) {
  const actions = [
    { label: 'Post a New Job',   icon: PlusCircle, color: '#FFE630', onClick: onPostJob },
    { label: 'Find Candidates',  icon: Users,      color: '#4ECDC4', href: '/employer/search' },
    { label: 'Manage Listings',  icon: Briefcase,  color: '#A78BFA', href: '/employer/jobs' },
  ];

  return (
    <div style={{
      gridColumn: 'span 8',
      background: 'var(--card-bg)',
      border: '4px solid var(--border-color)',
      boxShadow: '6px 6px 0 var(--shadow-color)',
      padding: '1.5rem 2rem',
      display: 'flex', flexDirection: 'column', gap: 16,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Quick Actions
          </div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 22, color: 'var(--fg)', letterSpacing: '-0.03em', lineHeight: 1.1, marginTop: 4 }}>
            What's on your agenda?
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 8 }}>
        {actions.map(({ label, icon: Icon, color, onClick, href }) => {
          const inner = (
            <div
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 20px', background: color, border: '3px solid #0a0a0a',
                boxShadow: '5px 5px 0 #0a0a0a', cursor: 'pointer',
                transition: 'transform 0.1s ease, box-shadow 0.1s ease',
                height: '100%',
              }}
              onMouseEnter={hoverIn}
              onMouseLeave={hoverOut}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Icon size={20} color="#0a0a0a" strokeWidth={2.5} />
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 14, color: '#0a0a0a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {label}
                </span>
              </div>
              <ChevronRight size={18} color="#0a0a0a" strokeWidth={3} />
            </div>
          );

          return href
            ? <Link key={label} to={href} style={{ textDecoration: 'none', display: 'block' }}>{inner}</Link>
            : <div key={label} onClick={onClick} style={{ height: '100%' }}>{inner}</div>;
        })}
      </div>
    </div>
  );
}
