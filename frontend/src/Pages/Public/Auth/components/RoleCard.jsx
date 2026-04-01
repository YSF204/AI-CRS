export default function RoleCard({ icon, label, desc, selected, color, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1, maxWidth: 200, padding: '24px 16px',
        border: '3px solid #0a0a0a',
        boxShadow: selected ? `6px 6px 0 ${color}` : '4px 4px 0 #0a0a0a',
        background: selected ? color : '#fff',
        color: '#0a0a0a', cursor: 'pointer',
        transition: 'all 0.2s ease',
        transform: selected ? 'translate(-2px, -2px)' : 'none',
      }}
    >
      <div style={{ marginBottom: 8 }}>{icon}</div>
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 15, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: '#555', marginTop: 4 }}>{desc}</div>
    </button>
  );
}
