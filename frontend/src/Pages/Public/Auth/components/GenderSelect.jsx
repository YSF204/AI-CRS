export default function GenderSelect({ value, onChange }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--fg)', marginBottom: 6 }}>
        Gender
      </label>
      <div style={{ display: 'flex', gap: 8 }}>
        {['MALE', 'FEMALE'].map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => onChange(g)}
            style={{
              flex: 1, padding: '8px',
              fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 11,
              textTransform: 'uppercase', letterSpacing: '0.06em',
              border: '3px solid #0a0a0a',
              background: value === g ? '#FFE630' : '#fff',
              color: '#0a0a0a', cursor: 'pointer',
              boxShadow: value === g ? '3px 3px 0 #0a0a0a' : '2px 2px 0 #0a0a0a',
              transition: 'all 0.15s ease',
            }}
          >
            {g}
          </button>
        ))}
      </div>
    </div>
  );
}
