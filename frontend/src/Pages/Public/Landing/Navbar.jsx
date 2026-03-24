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
    <div style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
      <span
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 'clamp(1rem, 1.5vw, 1.3rem)',
          padding: '0.15em 0.4em',
          letterSpacing: '-0.03em',
          lineHeight: 1.2,
          fontWeight: 700,
          backgroundColor: '#FFE630',
          color: '#0a0a0a',
          border: '2px solid #0a0a0a',
          boxShadow: '2px 2px 0 #0a0a0a'
        }}
      >
        AI-CRS
      </span>
    </div>
  );

  const rightActionsNode = (
    <>
      <button
        onClick={toggleTheme}
        style={{
          width: '32px',
          height: '32px',
          border: '2px solid #0a0a0a',
          boxShadow: '2px 2px 0 #0a0a0a',
          background: theme === 'dark' ? '#FFE630' : '#fff',
          color: '#0a0a0a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
      </button>

      <Link
        to="/auth"
        style={{
          textDecoration: 'none',
          padding: '0.4rem 1rem',
          fontSize: '0.8rem',
          fontWeight: 700,
          fontFamily: "'Space Grotesk', sans-serif",
          backgroundColor: '#FFE630',
          color: '#0a0a0a',
          border: '2px solid #0a0a0a',
          boxShadow: '2px 2px 0 #0a0a0a',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}
      >
        Get Started
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
        transition: 'transform 0.3s ease',
        transform: visible ? 'translateY(0)' : 'translateY(-100%)',
        padding: '1.5rem 1rem 0 1rem', // Spaced from top to float
        pointerEvents: 'none',
      }}
    >
      <div style={{ pointerEvents: 'auto' }}>
        <PillNav
          logo={logoNode}
          items={[
            { label: 'Features', href: '#features' },
            { label: 'About', href: '#about' },
            { label: 'Contact', href: '#contact' }
          ]}
          activeHref="#features"
          ease="power2.easeOut"
          baseColor={theme === 'dark' ? '#1a1a1a' : '#ffffff'}
          pillColor="#FFE630"
          hoveredPillTextColor="#0a0a0a"
          pillTextColor={theme === 'dark' ? '#ffffff' : '#0a0a0a'}
          theme={theme}
          initialLoadAnimation={true}
          rightActions={rightActionsNode}
        />
      </div>
    </nav>
  );
}
