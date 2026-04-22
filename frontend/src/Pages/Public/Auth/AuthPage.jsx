import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const { theme, toggleTheme } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const requestedMode = searchParams.get('mode');
    if (requestedMode === 'login' || requestedMode === 'signup') {
      setMode(requestedMode);
    }
  }, [searchParams]);

  const handleModeChange = (nextMode) => {
    setMode(nextMode);
    setSearchParams({ mode: nextMode }, { replace: true });
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(1.5rem, 5%, 4rem)',
        background: 'var(--nm-bg)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top bar */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 'clamp(0.75rem, 1.5%, 1.25rem) clamp(1.5rem, 5%, 4rem)',
          background: 'var(--nm-bg)',
          borderBottom: '4px solid var(--nm-ink)',
        }}
      >
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            textDecoration: 'none',
            color: 'var(--nm-text-primary)',
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 16,
            textTransform: 'uppercase',
          }}
        >
          <ArrowLeft size={20} strokeWidth={2.5} />
          <span
            style={{
              padding: '0.2rem 0.6rem',
              background: 'var(--nm-primary)',
              color: '#fff',
              border: '3px solid var(--nm-ink)',
              boxShadow: '3px 3px 0 var(--nm-ink)',
              letterSpacing: '-0.02em',
            }}
          >
            AI-CRS
          </span>
        </Link>
        <button
          onClick={toggleTheme}
          className="nm-btn"
          style={{
            width: 44,
            height: 44,
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--nm-surface)',
          }}
        >
          {theme === 'light' ? <Moon size={20} strokeWidth={2.5} /> : <Sun size={20} strokeWidth={2.5} />}
        </button>
      </div>

      {/* Auth card */}
      <div
        className="nm-card"
        style={{
          width: '100%',
          maxWidth: 540,
          background: 'var(--nm-surface)',
          borderWidth: '4px',
          boxShadow: '12px 12px 0 var(--nm-ink)',
          padding: 'clamp(2rem, 6%, 3.5rem)',
          marginTop: 40,
          position: 'relative',
          zIndex: 2,
        }}
      >
        {/* Tab toggle */}
        <div
          style={{
            display: 'flex',
            marginBottom: '2.5rem',
            border: '4px solid var(--nm-ink)',
            background: 'var(--nm-bg)',
          }}
        >
          {['login', 'signup'].map((m) => (
            <button
              key={m}
              onClick={() => handleModeChange(m)}
              style={{
                flex: 1,
                padding: '14px',
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: 14,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                border: 'none',
                background: mode === m ? 'var(--nm-primary)' : 'transparent',
                color: mode === m ? '#fff' : 'var(--nm-text-secondary)',
                cursor: 'pointer',
                borderRight: m === 'login' ? '4px solid var(--nm-ink)' : 'none',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Title */}
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            color: 'var(--nm-text-primary)',
            letterSpacing: '-0.04em',
            textTransform: 'uppercase',
            lineHeight: 1,
            marginBottom: '0.75rem',
          }}
        >
          {mode === 'login' ? 'Welcome Back' : 'Create Account'}
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            color: 'var(--nm-text-secondary)',
            marginBottom: '2rem',
            lineHeight: 1.6,
          }}
        >
          {mode === 'login'
            ? 'Access your intelligent career dashboard.'
            : "Join the platform building the future of recruitment."}
        </p>

        {/* Form content */}
        <div style={{ display: mode === 'login' ? 'block' : 'none' }}>
          <LoginForm setMode={setMode} />
        </div>
        <div style={{ display: mode === 'signup' ? 'block' : 'none' }}>
          <SignupForm setMode={setMode} />
        </div>
      </div>

      {/* Decorative elements - Neo Minimal style */}
      <div
        className="hidden lg:block"
        style={{
          position: 'fixed',
          top: '15%',
          left: '10%',
          width: '200px',
          height: '200px',
          border: '4px solid var(--nm-ink)',
          opacity: 0.05,
          zIndex: 1,
          transform: 'rotate(-15deg)',
        }}
      />
      <div
        className="hidden lg:block"
        style={{
          position: 'fixed',
          bottom: '10%',
          right: '12%',
          width: '150px',
          height: '150px',
          border: '4px solid var(--nm-ink)',
          background: 'var(--nm-primary)',
          opacity: 0.1,
          zIndex: 1,
          transform: 'rotate(10deg)',
        }}
      />
    </div>
  );
}
