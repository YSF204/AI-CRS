import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Sun, Moon } from 'lucide-react';
import PillNav from './PillNav';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export default function DashboardNav({ role = 'employee' }) {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const rightActions = (
    <>
      <button 
        onClick={toggleTheme} 
        className="flex items-center justify-center w-[36px] h-[36px] border-[3px] border-black shadow-[3px_3px_0_black]" 
        style={{ 
          background: theme === 'dark' ? '#FFE630' : 'var(--bg)', 
          color: theme === 'dark' ? '#0a0a0a' : 'var(--fg)',
          transition: 'transform 0.1s ease',
        }}
      >
        {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
      </button>
      <button 
        onClick={handleLogout} 
        className="flex items-center gap-2 px-4 py-2 border-[3px] border-black shadow-[3px_3px_0_black] bg-[#FF6B6B] text-black font-bold hover:translate-x-[2px] hover:translate-y-[2px] transition-transform text-sm font-['Space_Grotesk'] uppercase tracking-wider"
      >
        <LogOut size={16} />
        <span className="hidden sm:inline">Logout</span>
      </button>
    </>
  );

  let config = {};

  if (role === 'employer') {
    config = {
      baseLink: '/employer',
      color: 'var(--coral)',
      label: 'Employer',
      items: [
        { label: 'Dashboard', href: '/employer' },
        { label: 'Post Job', href: '/employer/post-job' },
        { label: 'Manage Jobs', href: '/employer/jobs' },
        { label: 'Find Talent', href: '/employer/search' },
        { label: 'Profile', href: '/employer/profile' },
      ]
    };
  } else if (role === 'admin') {
    config = {
      baseLink: '/admin',
      color: 'var(--yellow)',
      label: 'Admin',
      items: [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Manage Users', href: '/admin/users' },
        { label: 'Settings', href: '/admin/settings' },
      ]
    };
  } else {
    // Default to employee
    config = {
      baseLink: '/employee',
      color: 'var(--teal)',
      label: 'Employee',
      items: [
        { label: 'Dashboard', href: '/employee' },
        { label: 'Find Jobs', href: '/employee/jobs' },
        { label: 'Applications', href: '/employee/applications' },
        { label: 'My CVs', href: '/employee/cvs' },
      ]
    };
  }

  const logo = (
    <Link to={config.baseLink} style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: 'var(--fg)', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16 }}>
      <span className="text-black font-bold px-3 py-1 tracking-tighter" style={{ borderRadius: '4px', background: config.color }}>AI-CRS</span>
      <span className="hidden sm:inline-block tracking-widest text-xs uppercase" style={{ color: 'var(--fg-muted)' }}>{config.label}</span>
    </Link>
  );

  return (
    <div className="mb-12">
      <PillNav
        logo={logo}
        items={config.items}
        activeHref={location.pathname}
        rightActions={rightActions}
        theme={theme}
        baseColor="var(--nav-bg)"
        pillColor={config.color}
        pillTextColor="var(--fg)"
        hoveredPillTextColor="#0a0a0a"
      />
    </div>
  );
}
