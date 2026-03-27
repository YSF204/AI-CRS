import React from 'react';
import { Briefcase, FileText, ChevronRight, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardNav from '../../components/shared/DashboardNav';

const QUICK_ACTIONS = [
  {
    icon:  FileText,
    label: 'MY CVS',
    sub:   'Edit your resumes',
    href:  '/employee/cvs',
    btnLabel: 'EDIT',
    btnColor: 'var(--mint)',
  },
  {
    icon:  Briefcase,
    label: 'APPLICATIONS',
    sub:   'Track your status',
    href:  '/employee/applications',
    btnLabel: 'TRACK',
    btnColor: 'var(--teal)',
  },
  {
    icon:  User,
    label: 'PROFILE',
    sub:   'Manage your info',
    href:  '/employee/profile',
    btnLabel: 'VIEW',
    btnColor: 'var(--blue)',
  },
];

export default function EmployeeDash() {
  return (
    <div className="min-h-screen p-8 bg-(--bg) text-(--fg)">
      <div className="max-w-6xl mx-auto">
        <DashboardNav role="employee" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ── Left: Welcome hero card ── */}
          <div className="brutal-card p-8 bg-(--card-bg) flex flex-col justify-center min-h-[280px]">
            <p className="font-mono text-xs uppercase tracking-widest text-(--fg-muted) mb-1">Dashboard</p>
            <h1 className="text-4xl mb-3 font-['Space_Grotesk'] font-bold uppercase tracking-tight leading-tight">
              WELCOME BACK
            </h1>
            <p className="font-mono text-(--fg-muted) mb-8">
              Browse and apply for available positions.
            </p>
            <Link
              to="/employee/jobs"
              className="brutal-btn px-8 py-3 font-bold self-start flex items-center gap-2"
              style={{ background: 'var(--yellow)', color: '#0a0a0a' }}
            >
              FIND JOBS
              <ChevronRight size={16} />
            </Link>
          </div>

          {/* ── Right: Quick-action rows (no card boxes) ── */}
          <div className="flex flex-col gap-4 justify-center">
            {QUICK_ACTIONS.map(({ icon: Icon, label, sub, href, btnLabel, btnColor }) => (
              <div
                key={href}
                className="flex items-center justify-between gap-4 px-5 py-4 brutal-card bg-(--card-bg)"
              >
                {/* Icon + text */}
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 flex items-center justify-center border-2 border-black shrink-0"
                    style={{ background: btnColor }}
                  >
                    <Icon size={18} color="#0a0a0a" />
                  </div>
                  <div>
                    <p className="font-bold font-['Space_Grotesk'] text-sm uppercase tracking-tight">
                      {label}
                    </p>
                    <p className="font-mono text-xs text-(--fg-muted)">{sub}</p>
                  </div>
                </div>

                {/* Button — right side */}
                <Link
                  to={href}
                  className="brutal-btn px-5 py-2 font-bold text-sm shrink-0"
                  style={{ background: btnColor, color: '#0a0a0a' }}
                >
                  {btnLabel}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
