export default function GenderSelect({ value, onChange }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <span 
        style={{ 
          display: 'block', 
          fontFamily: 'var(--font-display)', 
          fontWeight: 800, 
          fontSize: 12, 
          textTransform: 'uppercase', 
          letterSpacing: '0.12em', 
          color: 'var(--nm-text-secondary)', 
          marginBottom: 8 
        }}
      >
        Gender
      </span>
      <div style={{ display: 'flex', gap: 8 }}>
        {['MALE', 'FEMALE'].map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => onChange(g)}
            style={{
              flex: 1, 
              padding: '12px 8px',
              fontFamily: 'var(--font-display)', 
              fontWeight: 800, 
              fontSize: 12,
              textTransform: 'uppercase', 
              letterSpacing: '0.05em',
              border: '4px solid var(--nm-ink)',
              background: value === g ? 'var(--nm-primary)' : 'var(--nm-bg)',
              color: value === g ? '#fff' : 'var(--nm-text-primary)', 
              cursor: 'pointer',
              boxShadow: value === g ? '4px 4px 0 var(--nm-ink)' : '2px 2px 0 var(--nm-ink)',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              borderRadius: '0px',
            }}
          >
            {g}
          </button>
        ))}
      </div>
    </div>
  );
}
