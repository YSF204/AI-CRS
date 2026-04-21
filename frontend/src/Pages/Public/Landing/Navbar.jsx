import React, { useState, useEffect, useRef } from 'react';
import { Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../../context/ThemeContext';

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
      <span
        style={{
          fontFamily: "'Montserrat', sans-serif",
          fontSize: '1.25rem',
          fontWeight: 800,
          letterSpacing: '-0.02em',
          lineHeight: 1,
          color: 'var(--text-primary)',
        }}
      >
        AI-CRS
      </span>
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: 'var(--color-primary)',
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
        className="nav-action-button"
      >
        {theme === 'light' ? <Moon size={16} strokeWidth={2} /> : <Sun size={16} strokeWidth={2} />}
      </button>

      <Link
        to="/auth?mode=login"
        className="nav-user-button focus-ring"
        style={{ background: 'var(--color-primary)', color: 'white', borderColor: 'var(--color-primary)' }}
      >
        Sign In
      </Link>
    </>
  );

  const navItems = [
    { label: 'Features', href: '#features' },
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#contact' },
  ];

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
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            padding: '0.85rem 1rem',
            border: '4px solid var(--border-color)',
            background: 'var(--nav-bg)',
            boxShadow: '4px 4px 0 var(--nm-ink)',
            backdropFilter: 'blur(10px)',
          }}
        >
          {logoNode}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="focus-ring"
                style={{
                  textDecoration: 'none',
                  color: 'var(--nav-text-default)',
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  padding: '0.7rem 0.9rem',
                  border: '2px solid transparent',
                }}
              >
                {item.label}
              </a>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {rightActionsNode}
          </div>
        </div>
      </div>
    </nav>
  );
}
