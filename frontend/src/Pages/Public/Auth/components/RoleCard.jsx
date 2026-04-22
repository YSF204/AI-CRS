export default function RoleCard({ icon, label, desc, selected, color, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1,
        maxWidth: 200,
        padding: '32px 16px',
        border: '4px solid var(--nm-ink)',
        boxShadow: selected ? `8px 8px 0 var(--nm-ink)` : '4px 4px 0 var(--nm-ink)',
        background: selected ? color : 'var(--nm-bg)',
        color: selected ? '#fff' : 'var(--nm-text-primary)',
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: selected ? 'translate(-2px, -2px)' : 'none',
        borderRadius: '0px',
      }}
    >
      <div style={{ marginBottom: 12, color: selected ? '#fff' : color }}>{icon}</div>
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: 16,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 11,
          color: selected ? '#eee' : 'var(--nm-text-secondary)',
          marginTop: 6,
          fontWeight: 500,
        }}
      >
        {desc}
      </div>
    </button>
  );
}
