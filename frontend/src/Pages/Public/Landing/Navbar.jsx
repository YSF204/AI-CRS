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
    <div style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.25rem',
          fontWeight: 800,
          letterSpacing: '-0.02em',
          lineHeight: 1,
          color: 'var(--nm-text-primary)',
          textTransform: 'uppercase',
        }}
      >
        AI-CRS
      </span>
      <span
        style={{
          width: 8,
          height: 8,
          backgroundColor: 'var(--nm-primary)',
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
        className="nm-btn"
        style={{
          padding: '0.5rem',
          minHeight: '40px',
          minWidth: '40px',
          background: 'var(--nm-surface)',
          borderWidth: '4px'
        }}
      >
        {theme === 'light' ? <Moon size={18} strokeWidth={2.5} /> : <Sun size={18} strokeWidth={2.5} />}
      </button>

      <Link
        to="/auth?mode=login"
        className="nm-btn nm-btn-primary"
        style={{
          padding: '0.5rem 1.25rem',
          minHeight: '40px',
          borderWidth: '4px'
        }}
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
        zIndex: 100,
        transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: visible ? 'translateY(0)' : 'translateY(-100%)',
        padding: '1.5rem',
        pointerEvents: 'none',
      }}
    >
      <div style={{ pointerEvents: 'auto', maxWidth: 1100, margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            padding: '0.75rem 1.5rem',
            border: '4px solid var(--nm-ink)',
            background: 'var(--nm-bg)',
            boxShadow: '6px 6px 0 var(--nm-ink)',
            borderRadius: '0px',
          }}
        >
          {logoNode}

          <div
            style={{
              alignItems: 'center',
              gap: '0.5rem',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
            className="hidden md:flex"
          >
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                style={{
                  textDecoration: 'none',
                  color: 'var(--nm-text-primary)',
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  padding: '0.5rem 1rem',
                  transition: 'background 0.2s ease',
                }}
                className="hover:bg-[var(--nm-surface-high)]"
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
