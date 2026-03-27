import CountUp from '../../../components/UI/CountUp';

/**
 * HiringPipelineCard
 * Dark card showing open vs closed job counts with animated bars.
 * Pure presentational — receives counts as props.
 */
export default function HiringPipelineCard({ totalJobs, openJobs, loading }) {
  const closedJobs = totalJobs - openJobs;

  const bars = [
    { label: 'Open',   count: openJobs,   color: '#FFE630' },
    { label: 'Closed', count: closedJobs, color: '#444' },
  ];

  return (
    <div style={{
      gridColumn: 'span 12',
      background: '#1c1c1c',
      border: '4px solid #0a0a0a',
      boxShadow: '8px 8px 0 #0a0a0a',
      padding: '2rem 2.5rem',
    }}>
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: '#888', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem' }}>
        Hiring Pipeline
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3rem', alignItems: 'center' }}>
        <div style={{ flex: '1 1 250px' }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 'clamp(3rem, 5vw, 4.5rem)', color: '#FFE630', letterSpacing: '-0.05em', lineHeight: 1 }}>
            {loading ? '…' : <CountUp from={0} to={openJobs} duration={1.5} />}
          </div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: '#ccc', fontWeight: 'bold', marginTop: 10 }}>
            ACTIVE OPEN POSITION{openJobs !== 1 ? 'S' : ''}
          </div>
        </div>

        <div style={{ flex: '2 1 400px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {bars.map(({ label, count, color }) => (
            <div key={label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: '#ccc', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: '#fff', fontWeight: 'bold' }}>
                  <CountUp from={0} to={count} duration={1.5} />
                </span>
              </div>
              <div style={{ height: 10, background: 'rgba(255,255,255,0.1)', border: '2px solid #0a0a0a', position: 'relative', overflow: 'hidden' }}>
                <div style={{
                  position: 'absolute', top: 0, left: 0, height: '100%', background: color, borderRight: count > 0 ? '2px solid #0a0a0a' : 'none',
                  width: totalJobs ? `${(count / totalJobs) * 100}%` : '0%',
                  transition: 'width 0.6s ease',
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
