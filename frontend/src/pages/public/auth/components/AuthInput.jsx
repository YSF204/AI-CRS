import { Eye, EyeOff } from 'lucide-react';

export default function AuthInput({ label, error, type, showToggle, showPw, onToggle, ...props }) {
  return (
    <div style={{ marginBottom: 20, position: showToggle ? 'relative' : undefined }}>
      {label && (
        <label
          style={{
            display: 'block',
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 12,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: 'var(--nm-text-secondary)',
            marginBottom: 8,
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
          padding: '12px 16px',
          paddingRight: showToggle ? 44 : 16,
          fontFamily: 'var(--font-body)',
          fontSize: 14,
          background: 'var(--nm-bg)',
          color: 'var(--nm-text-primary)',
          borderWidth: '4px',
          borderStyle: 'solid',
          borderColor: error ? 'var(--nm-error)' : 'var(--nm-ink)',
          boxShadow: '4px 4px 0 var(--nm-ink)',
          outline: 'none',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          boxSizing: 'border-box',
          borderRadius: '0px',
        }}
        onFocus={(e) => {
          e.target.style.boxShadow = '6px 6px 0 var(--nm-primary)';
          e.target.style.borderColor = 'var(--nm-primary)';
          if (props.onFocus) props.onFocus(e);
        }}
        onBlur={(e) => {
          e.target.style.boxShadow = '4px 4px 0 var(--nm-ink)';
          e.target.style.borderColor = error ? 'var(--nm-error)' : 'var(--nm-ink)';
          if (props.onBlur) props.onBlur(e);
        }}
      />
      {showToggle && (
        <button
          type="button"
          onClick={onToggle}
          style={{
            position: 'absolute',
            right: 14,
            top: label ? 38 : 10,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--nm-text-tertiary)',
          }}
        >
          {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      )}
      {error && (
        <div 
          style={{ 
            fontSize: 12, 
            color: 'var(--nm-error)', 
            marginTop: 6, 
            fontFamily: 'var(--font-body)',
            fontWeight: 600,
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}
