import React, { useState, useEffect, useRef } from 'react';
import { Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../../context/ThemeContext';
import PillNav from '../../../components/shared/PillNav';

export default function Navbar() {
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setVisible(y < 80 || y < lastScrollY.current);
      lastScrollY.current = y;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const logoNode = (
    <div style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
      {/* Ink-stamp style logo */}
      <span
        style={{
          fontFamily: "'Libre Bodoni', serif",
          fontSize: 'clamp(1rem, 1.5vw, 1.2rem)',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          lineHeight: 1,
          color: 'var(--fg)',
        }}
      >
        AI-CRS
      </span>
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: 'var(--accent)',
          display: 'inline-block',
        }}
      />
    </div>
  );

  const rightActionsNode = (
    <>
      <button
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        style={{
          width: '36px',
          height: '36px',
          border: '1.5px solid var(--border-color)',
          borderRadius: '8px',
          background: 'var(--card-bg)',
          color: 'var(--fg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        {theme === 'light' ? <Moon size={15} strokeWidth={2} /> : <Sun size={15} strokeWidth={2} />}
      </button>

      <Link
        to="/auth?mode=login"
        className="paper-btn"
        style={{
          padding: '0.45rem 1.1rem',
          fontSize: '0.82rem',
          borderRadius: '8px',
        }}
      >
        Sign In
      </Link>
    </>
  );

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 50,
        transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: visible ? 'translateY(0)' : 'translateY(-100%)',
        padding: '1rem 1rem 0 1rem',
        pointerEvents: 'none',
      }}
    >
      <div style={{ pointerEvents: 'auto', maxWidth: 920, margin: '0 auto' }}>
        <PillNav
          logo={logoNode}
          items={[
            { label: 'Features', href: '#features' },
            { label: 'About', href: '#about' },
            { label: 'Contact', href: '#contact' }
          ]}
          activeHref="#features"
          ease="power2.easeOut"
          theme={theme}
          initialLoadAnimation={true}
          rightActions={rightActionsNode}
        />
      </div>
    </nav>
  );
}
