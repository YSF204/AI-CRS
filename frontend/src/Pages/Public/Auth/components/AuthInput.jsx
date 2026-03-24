import { Eye, EyeOff } from 'lucide-react';

export default function AuthInput({ label, error, type, showToggle, showPw, onToggle, ...props }) {
  const isPassword = type === 'password' || (showToggle && type === undefined);

  return (
    <div style={{ marginBottom: 14, position: showToggle ? 'relative' : undefined }}>
      {label && (
        <label
          style={{
            display: 'block',
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: 12,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--fg)',
            marginBottom: 6,
          }}
        >
          {label}
        </label>
      )}
      <input
        {...props}
        type={showToggle ? (showPw ? 'text' : 'password') : type}
        style={{
          width: '100%',
          padding: '10px 14px',
          paddingRight: showToggle ? 40 : 14,
          fontFamily: "'DM Mono', monospace",
          fontSize: 13,
          background: 'var(--bg)',
          color: 'var(--fg)',
          borderWidth: '3px',
          borderStyle: 'solid',
          borderColor: error ? '#FF6B6B' : 'var(--border-color)',
          boxShadow: '3px 3px 0 var(--shadow-color)',
          outline: 'none',
          transition: 'box-shadow 0.15s ease',
          boxSizing: 'border-box',
        }}
        onFocus={(e) => {
          e.target.style.boxShadow = '5px 5px 0 #FFE630';
          e.target.style.borderColor = '#FFE630';
          if (props.onFocus) props.onFocus(e);
        }}
        onBlur={(e) => {
          e.target.style.boxShadow = '3px 3px 0 var(--shadow-color)';
          e.target.style.borderColor = error ? '#FF6B6B' : 'var(--border-color)';
          if (props.onBlur) props.onBlur(e);
        }}
      />
      {showToggle && (
        <button
          type="button"
          onClick={onToggle}
          style={{
            position: 'absolute',
            right: 12,
            top: label ? 34 : 10,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--fg-muted)',
          }}
        >
          {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      )}
      {error && (
        <div style={{ fontSize: 11, color: '#FF6B6B', marginTop: 4, fontFamily: "'DM Mono', monospace" }}>
          {error}
        </div>
      )}
    </div>
  );
}
