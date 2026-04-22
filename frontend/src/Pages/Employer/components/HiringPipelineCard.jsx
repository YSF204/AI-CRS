import CountUp from '../../../components/UI/CountUp';

export default function HiringPipelineCard({ totalJobs, openJobs, loading }) {
  const closedJobs = totalJobs - openJobs;

  const bars = [
    { label: 'Active Openings',   count: openJobs,   color: 'var(--nm-primary)' },
    { label: 'Closed/Filled', count: closedJobs, color: 'var(--nm-text-tertiary)' },
  ];

  return (
    <div 
      className="nm-card"
      style={{
        gridColumn: 'span 12',
        background: 'var(--nm-surface)',
        borderWidth: '4px',
        boxShadow: '10px 10px 0 var(--nm-ink)',
        padding: '2.5rem',
        borderRadius: '0px',
      }}
    >
      <div style={{ 
        fontFamily: 'var(--font-display)', 
        fontSize: 14, 
        color: 'var(--nm-text-tertiary)', 
        fontWeight: 800, 
        textTransform: 'uppercase', 
        letterSpacing: '0.15em', 
        marginBottom: '2rem' 
      }}>
        Hiring Pipeline Status
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4rem', alignItems: 'center' }}>
        <div style={{ flex: '1 1 250px' }}>
          <div style={{ 
            fontFamily: 'var(--font-display)', 
            fontWeight: 900, 
            fontSize: 'clamp(3.5rem, 6vw, 5rem)', 
            color: 'var(--nm-primary)', 
            letterSpacing: '-0.05em', 
            lineHeight: 1,
            textTransform: 'uppercase'
          }}>
            {loading ? '…' : <CountUp from={0} to={openJobs} duration={1.5} />}
          </div>
          <div style={{ 
            fontFamily: 'var(--font-display)', 
            fontSize: 14, 
            color: 'var(--nm-text-primary)', 
            fontWeight: 800, 
            marginTop: 12,
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Active Jobs Now
          </div>
        </div>

        <div style={{ flex: '2 1 400px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {bars.map(({ label, count, color }) => (
            <div key={label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ 
                  fontFamily: 'var(--font-display)', 
                  fontSize: 12, 
                  color: 'var(--nm-text-secondary)', 
                  fontWeight: 800, 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.05em' 
                }}>
                  {label}
                </span>
                <span style={{ 
                  fontFamily: 'var(--font-display)', 
                  fontSize: 14, 
                  color: 'var(--nm-text-primary)', 
                  fontWeight: 900 
                }}>
                  <CountUp from={0} to={count} duration={1.5} />
                </span>
              </div>
              <div style={{ 
                height: 16, 
                background: 'var(--nm-bg)', 
                border: '4px solid var(--nm-ink)', 
                position: 'relative', 
                overflow: 'hidden',
                borderRadius: '0px'
              }}>
                <div style={{
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  height: '100%', 
                  background: color, 
                  borderRight: count > 0 ? '4px solid var(--nm-ink)' : 'none',
                  width: totalJobs ? `${(count / totalJobs) * 100}%` : '0%',
                  transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
