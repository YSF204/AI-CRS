import CountUp from '../../../components/UI/CountUp';
/**
 * StatWidget
 * Displays a single KPI: a label, a numeric value, an accent colour, and an icon.
 * Pure presentational — no data fetching.
 */
export default function StatWidget({ label, value, accent, icon: Icon }) {
  return (
    <div style={{
      background: 'var(--card-bg)',
      border: '3px solid var(--border-color)',
      boxShadow: '5px 5px 0 var(--shadow-color)',
      padding: '1.4rem 1.6rem',
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {label}
        </span>
        <div style={{ background: accent, border: '2px solid #0a0a0a', padding: 6, display: 'inline-flex' }}>
          <Icon size={14} color="#0a0a0a" />
        </div>
      </div>
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 32, color: 'var(--fg)', lineHeight: 1 }}>
          {typeof value === 'number' || (!isNaN(value) && value !== '…') ? (
            <CountUp 
              from={0} 
              to={Number(value)} 
              duration={1.5} 
              separator="," 
            />
          ) : (
            value
          )}
        </div>
    </div>
  );
}
