import CountUp from '../../../components/UI/CountUp';

export default function StatWidget({ label, value, accent, icon: Icon }) {
  return (
    <div 
      className="nm-card"
      style={{
        background: 'var(--nm-surface)',
        borderWidth: '4px',
        boxShadow: '6px 6px 0 var(--nm-ink)',
        padding: '1.5rem',
        display: 'flex', 
        flexDirection: 'column', 
        gap: 12,
        borderRadius: '0px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ 
          fontFamily: 'var(--font-display)', 
          fontSize: 12, 
          fontWeight: 800,
          color: 'var(--nm-text-tertiary)', 
          textTransform: 'uppercase', 
          letterSpacing: '0.1em' 
        }}>
          {label}
        </span>
        <div style={{ 
          background: accent, 
          border: '3px solid var(--nm-ink)', 
          padding: 8, 
          display: 'inline-flex',
          boxShadow: '2px 2px 0 var(--nm-ink)'
        }}>
          <Icon size={18} color="#0a0a0a" strokeWidth={3} />
        </div>
      </div>
      <div style={{ 
        fontFamily: 'var(--font-display)', 
        fontWeight: 900, 
        fontSize: 36, 
        color: 'var(--nm-text-primary)', 
        lineHeight: 1,
        letterSpacing: '-0.02em'
      }}>
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
