export default function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div style={{
      padding: '12px 16px',
      marginBottom: 20,
      background: 'var(--nm-error)',
      color: '#fff',
      fontSize: 13,
      fontFamily: 'var(--font-body)',
      fontWeight: 600,
      border: '3px solid var(--nm-ink)',
      boxShadow: '4px 4px 0 var(--nm-ink)',
    }}>
      {message}
    </div>
  );
}
