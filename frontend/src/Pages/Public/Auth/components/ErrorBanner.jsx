/**
 * ErrorBanner
 * Consistent inline error message used in both LoginForm and SignupForm.
 */
export default function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div style={{
      padding: 10,
      marginBottom: 14,
      background: '#FF6B6B',
      color: '#fff',
      fontSize: 13,
      fontFamily: "'DM Mono', monospace",
    }}>
      {message}
    </div>
  );
}
