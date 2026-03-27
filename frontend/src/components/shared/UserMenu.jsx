import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/**
 * UserMenu — avatar/burger button that opens a dropdown with
 * profile info, a link to /employee/profile, and logout.
 * Fully self-contained: reads auth itself, no props needed.
 */
export default function UserMenu({ profileHref = '/employee/profile' }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handle = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  const initials = (user?.fullName ?? user?.email ?? 'U')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate('/');
  };

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px 6px 8px',
          border: '3px solid #0a0a0a',
          boxShadow: '3px 3px 0 #0a0a0a',
          background: 'var(--yellow)',
          cursor: 'pointer',
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
        }}
      >
        {/* Initials circle */}
        <span
          style={{
            width: 26,
            height: 26,
            background: '#0a0a0a',
            color: 'var(--yellow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.7rem',
            fontWeight: 800,
            borderRadius: '50%',
            flexShrink: 0,
          }}
        >
          {initials}
        </span>
        <ChevronDown
          size={14}
          color="#0a0a0a"
          style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            minWidth: 220,
            background: 'var(--card-bg)',
            border: '3px solid #0a0a0a',
            boxShadow: '5px 5px 0 #0a0a0a',
            zIndex: 200,
          }}
        >
          {/* Profile info header */}
          <div
            style={{
              padding: '14px 16px',
              borderBottom: '2px solid #0a0a0a',
              background: 'var(--yellow)',
            }}
          >
            <p
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 800,
                fontSize: '0.9rem',
                color: '#0a0a0a',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                margin: 0,
              }}
            >
              {user?.fullName ?? 'My Account'}
            </p>
            <p
              style={{
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                color: '#0a0a0a99',
                margin: '2px 0 0',
                wordBreak: 'break-all',
              }}
            >
              {user?.email ?? ''}
            </p>
          </div>

          {/* My Profile link */}
          <Link
            to={profileHref}
            onClick={() => setOpen(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '12px 16px',
              textDecoration: 'none',
              color: 'var(--fg)',
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: '0.85rem',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              borderBottom: '2px solid var(--border-color)',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <User size={15} />
            My Profile
          </Link>

          {/* Log Out */}
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '12px 16px',
              width: '100%',
              border: 'none',
              background: 'transparent',
              color: 'var(--coral)',
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: '0.85rem',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <LogOut size={15} />
            Log Out
          </button>
        </div>
      )}
    </div>
  );
}
