<<<<<<< HEAD
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, Briefcase, FileText, User, Search } from 'lucide-react';
import PillNav from './PillNav';
import UserMenu from './UserMenu';
import { useTheme } from '../../context/ThemeContext';

/**
 * DashboardNav — Role-aware dashboard wrapper with quick actions.
 * Consumes the new PillNav API with Paper design system tokens.
 *
 * @param {string} role - 'employee' | 'employer' | 'admin'
 */
export default function DashboardNav({ role = 'employee' }) {
=======
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Sun, Moon } from "lucide-react";
import PillNav from "./PillNav";
import UserMenu from "./UserMenu";
import { useTheme } from "../../context/ThemeContext";

export default function DashboardNav({ role = "employee" }) {
>>>>>>> 1e56cd7 (fixing Employee page bugs)
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  // Theme toggle button with Paper design system
  const themeToggleButton = (
    <button
      onClick={toggleTheme}
      className="nav-action-button"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? <Moon size={16} strokeWidth={2} /> : <Sun size={16} strokeWidth={2} />}
    </button>
  );

  // User menu dropdown
  const userMenuNode = (
    <UserMenu
      profileHref={
        role === 'employer' ? '/employer/profile'
          : role === 'admin' ? '/admin/profile'
            : '/employee/profile'
      }
    />
  );

  const rightActions = (
    <>
<<<<<<< HEAD
      {themeToggleButton}
      {userMenuNode}
    </>
  );

  // Role-based navigation configuration
  const roleConfig = {
    employer: {
      baseLink: '/employer',
      color: 'var(--color-danger)',
      label: 'Employer',
=======
      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="flex items-center justify-center w-[36px] h-[36px] border-[3px] border-black shadow-[3px_3px_0_black]"
        style={{
          background: theme === "dark" ? "#FFE630" : "var(--bg)",
          color: theme === "dark" ? "#0a0a0a" : "var(--fg)",
          transition: "transform 0.1s ease",
        }}
      >
        {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
      </button>

      {/* User avatar dropdown (profile + logout) */}
      <UserMenu
        profileHref={
          role === "employer"
            ? "/employer/profile"
            : role === "admin"
              ? "/admin/profile"
              : "/employee/profile"
        }
      />
    </>
  );

  let config = {};

  if (role === "employer") {
    config = {
      baseLink: "/employer",
      color: "var(--coral)",
      label: "Employer",
>>>>>>> 1e56cd7 (fixing Employee page bugs)
      items: [
        { label: "Dashboard", href: "/employer" },
        { label: "Post Job", href: "/employer/post-job" },
        { label: "Manage Jobs", href: "/employer/jobs" },
        { label: "Find Talent", href: "/employer/search" },
      ],
<<<<<<< HEAD
    },
    admin: {
      baseLink: '/admin',
      color: 'var(--color-warning)',
      label: 'Admin',
=======
    };
  } else if (role === "admin") {
    config = {
      baseLink: "/admin",
      color: "var(--yellow)",
      label: "Admin",
>>>>>>> 1e56cd7 (fixing Employee page bugs)
      items: [
        { label: "Dashboard", href: "/admin" },
        { label: "Manage Users", href: "/admin/users" },
        { label: "Settings", href: "/admin/settings" },
      ],
<<<<<<< HEAD
    },
    employee: {
      baseLink: '/employee',
      color: 'var(--color-primary)',
      label: 'Employee',
=======
    };
  } else {
    // Employee (default)
    config = {
      baseLink: "/employee",
      color: "var(--teal)",
      label: "Employee",
>>>>>>> 1e56cd7 (fixing Employee page bugs)
      items: [
        { label: "Dashboard", href: "/employee" },
        { label: "Find Jobs", href: "/employee/jobs" },
        { label: "Applications", href: "/employee/applications" },
        { label: "ATS Score", href: "/employee/ats-score" },
        { label: "My CVs", href: "/employee/cvs" },
        { label: "CV Templates", href: "/employee/cv-templates" },
      ],
      // Quick actions for employee dashboard
      quickActions: [
        { icon: Search, label: 'Find Jobs', href: '/employee/jobs', colorType: 'warning' },
        { icon: FileText, label: 'My CVs', href: '/employee/cvs', colorType: 'success' },
        { icon: Briefcase, label: 'Applications', href: '/employee/applications', colorType: 'primary' },
      ],
    },
  };

  const config = roleConfig[role] || roleConfig.employee;

  // Logo component with Paper design system
  const logoNode = (
    <Link
      to={config.baseLink}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
<<<<<<< HEAD
        textDecoration: 'none',
        color: 'var(--color-text-primary)',
        fontFamily: "'Montserrat', sans-serif",
=======
        textDecoration: "none",
        color: "var(--fg)",
        fontFamily: "'Space Grotesk', sans-serif",
>>>>>>> 1e56cd7 (fixing Employee page bugs)
        fontWeight: 700,
        fontSize: 16,
      }}
    >
      <span
<<<<<<< HEAD
        className="text-[var(--color-text-primary)] font-bold px-3 py-1 tracking-tighter"
        style={{ borderRadius: '4px', background: config.color }}
=======
        className="text-black font-bold px-3 py-1 tracking-tighter"
        style={{ borderRadius: "4px", background: config.color }}
>>>>>>> 1e56cd7 (fixing Employee page bugs)
      >
        AI-CRS
      </span>
      <span
        className="hidden sm:inline-block tracking-widest text-xs uppercase"
<<<<<<< HEAD
        style={{ color: 'var(--color-text-secondary)' }}
=======
        style={{ color: "var(--fg-muted)" }}
>>>>>>> 1e56cd7 (fixing Employee page bugs)
      >
        {config.label}
      </span>
    </Link>
  );

  return (
    <div className="dashboard-nav-wrapper sticky top-0 z-50 mb-12 backdrop-blur-lg bg-opacity-90">
      <PillNav
        logo={logoNode}
        items={config.items}
        activeHref={location.pathname}
        rightActions={rightActions}
        theme={theme}
        initialLoadAnimation={false}
      />

      {/* Quick Actions Bar - Employee Only with fixed height to prevent layout shift */}
      {role === 'employee' && config.quickActions && (
        <div
          className="quick-actions-bar"
          style={{
            maxWidth: '1500px',
            margin: '0 auto',
            padding: '0.75rem 1rem',
            minHeight: '48px',
          }}
        >
          <div className="flex items-center gap-3 overflow-x-auto">
            <span className="text-xs font-mono uppercase tracking-widest text-[var(--color-text-secondary)] whitespace-nowrap">
              Quick Actions
            </span>
            {config.quickActions.map((action, index) => {
              const Icon = action.icon;
              const isActive = location.pathname === action.href;
              const activeClass = isActive && action.colorType ? ` active-${action.colorType}` : '';
              return (
                <Link
                  key={index}
                  to={action.href}
                  className={`quick-action-link${activeClass}`}
                >
                  <Icon size={16} />
                  <span className="hidden sm:inline">{action.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
