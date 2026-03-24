import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const { theme, toggleTheme } = useTheme();

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(1rem, 4%, 3rem)',
        background: 'var(--bg)',
        position: 'relative',
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
          padding: 'clamp(0.6rem, 1.5%, 1rem) clamp(1.25rem, 3%, 2.5rem)',
          background: 'var(--nav-bg)',
          borderBottom: '3px solid var(--border-color)',
        }}
      >
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            textDecoration: 'none',
            color: 'var(--fg)',
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          <ArrowLeft size={18} />
          <span
            className="bg-brutal-yellow text-black font-bold"
            style={{
              padding: '0.1em 0.35em',
              fontSize: 'clamp(0.9rem, 1.5vw, 1.2rem)',
              letterSpacing: '-0.03em',
            }}
          >
            AI-CRS
          </span>
        </Link>
        <button
          onClick={toggleTheme}
          style={{
            width: 36,
            height: 36,
            border: '3px solid var(--border-color)',
            boxShadow: '3px 3px 0 var(--shadow-color)',
            background: theme === 'dark' ? '#FFE630' : 'var(--bg)',
            color: theme === 'dark' ? '#0a0a0a' : 'var(--fg)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>
      </div>

      {/* Auth card */}
      <div
        style={{
          width: '100%',
          maxWidth: 520,
          background: 'var(--card-bg)',
          border: '3px solid var(--border-color)',
          boxShadow: '8px 8px 0 var(--shadow-color)',
          padding: 'clamp(1.5rem, 4%, 2.5rem)',
          marginTop: 60,
        }}
      >
        {/* Tab toggle */}
        <div
          style={{
            display: 'flex',
            marginBottom: 'clamp(1.25rem, 3%, 2rem)',
            border: '3px solid #0a0a0a',
          }}
        >
          {['login', 'signup'].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                flex: 1,
                padding: '10px',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: 14,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                border: 'none',
                background: mode === m ? '#FFE630' : '#fff',
                color: '#0a0a0a',
                cursor: 'pointer',
                borderRight: m === 'login' ? '3px solid #0a0a0a' : 'none',
                transition: 'background 0.2s ease',
              }}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Title */}
        <h1
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)',
            color: 'var(--fg)',
            marginBottom: 4,
          }}
        >
          {mode === 'login' ? 'Welcome Back' : 'Create Account'}
        </h1>
        <p
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 12,
            color: 'var(--fg-muted)',
            marginBottom: 'clamp(1rem, 2.5%, 1.5rem)',
          }}
        >
          {mode === 'login'
            ? 'Login to your AI-CRS account'
            : "Let's get you set up in a few steps"}
        </p>

        {/* Form content — both always mounted, shown/hidden via CSS to prevent Google SDK re-init */}
        <div style={{ display: mode === 'login' ? 'block' : 'none' }}>
          <LoginForm setMode={setMode} />
        </div>
        <div style={{ display: mode === 'signup' ? 'block' : 'none' }}>
          <SignupForm setMode={setMode} />
        </div>
      </div>

      {/* Decorative elements */}
      <div
        className="hidden lg:block"
        style={{
          position: 'fixed',
          bottom: '10%',
          left: '5%',
          width: 60,
          height: 60,
          background: '#FFE630',
          border: '3px solid #0a0a0a',
          transform: 'rotate(12deg)',
          opacity: 0.5,
        }}
      />
      <div
        className="hidden lg:block"
        style={{
          position: 'fixed',
          top: '20%',
          right: '8%',
          width: 40,
          height: 80,
          background: '#4ECDC4',
          border: '3px solid #0a0a0a',
          transform: 'rotate(-8deg)',
          opacity: 0.4,
        }}
      />
    </div>
  );
}

