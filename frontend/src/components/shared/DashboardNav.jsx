import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import PillNav from './PillNav';
import UserMenu from './UserMenu';
import { useTheme } from '../../context/ThemeContext';

export default function DashboardNav({ role = 'employee' }) {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const rightActions = (
    <>
      {/* Theme toggle */}
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

      {/* User avatar dropdown (profile + logout) */}
      <UserMenu
        profileHref={
          role === 'employer' ? '/employer/profile'
          : role === 'admin'  ? '/admin/profile'
          : '/employee/profile'
        }
      />
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
        { label: 'Dashboard',   href: '/employer' },
        { label: 'Post Job',    href: '/employer/post-job' },
        { label: 'Find Talent', href: '/employer/search' },
      ],
    };
  } else if (role === 'admin') {
    config = {
      baseLink: '/admin',
      color: 'var(--yellow)',
      label: 'Admin',
      items: [
        { label: 'Dashboard',    href: '/admin' },
        { label: 'Manage Users', href: '/admin/users' },
        { label: 'Settings',     href: '/admin/settings' },
      ],
    };
  } else {
    // Employee (default)
    config = {
      baseLink: '/employee',
      color: 'var(--teal)',
      label: 'Employee',
      items: [
        { label: 'Dashboard',    href: '/employee' },
        { label: 'Find Jobs',    href: '/employee/jobs' },
        { label: 'Applications', href: '/employee/applications' },
        { label: 'My CVs',       href: '/employee/cvs' },
      ],
    };
  }

  const logo = (
    <Link
      to={config.baseLink}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        textDecoration: 'none',
        color: 'var(--fg)',
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 700,
        fontSize: 16,
      }}
    >
      <span
        className="text-black font-bold px-3 py-1 tracking-tighter"
        style={{ borderRadius: '4px', background: config.color }}
      >
        AI-CRS
      </span>
      <span
        className="hidden sm:inline-block tracking-widest text-xs uppercase"
        style={{ color: 'var(--fg-muted)' }}
      >
        {config.label}
      </span>
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
