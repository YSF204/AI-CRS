import React, { useMemo, useState } from 'react';
import { FileText, Plus } from 'lucide-react';
import DashboardNav from '../../components/shared/DashboardNav';
import StatsBar from '../../components/shared/StatsBar';
import CVCard from '../../components/Employee/CVCard';

const INITIAL_CVS = [
  { id: 1, name: 'Software Engineer CV', updated: 'Mar 26, 2026', skills: ['React', 'Node.js', 'SQL'], color: 'var(--teal)' },
  { id: 2, name: 'UX Designer CV', updated: 'Mar 15, 2026', skills: ['Figma', 'CSS', 'User Research'], color: 'var(--coral)' },
  { id: 3, name: 'Full-Stack CV', updated: 'Mar 10, 2026', skills: ['TypeScript', 'PostgreSQL', 'Docker'], color: 'var(--yellow)' },
];

export default function CVs() {
  const [cvs, setCvs] = useState(() => INITIAL_CVS.map((cv) => ({ ...cv, skills: cv.skills || [] })));

  const handleDelete = (id) => setCvs((prev) => prev.filter((c) => c.id !== id));

  const stats = useMemo(() => {
    const safeCvs = Array.isArray(cvs) ? cvs : [];
    const skillsCount = safeCvs.reduce((total, cv) => total + (Array.isArray(cv.skills) ? cv.skills.length : 0), 0);

    return [
      { label: 'Total', value: safeCvs.length, color: 'var(--coral)' },
      { label: 'Active', value: Math.min(2, safeCvs.length), color: 'var(--teal)' },
      { label: 'Skills', value: skillsCount, color: 'var(--yellow)' },
    ];
  }, [cvs]);

  return (
    <div className="min-h-screen p-8 bg-[var(--bg)] text-[var(--fg)]">
      <div className="max-w-6xl mx-auto">
        <DashboardNav role="employee" />

        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-['Space_Grotesk'] uppercase tracking-tight flex items-center gap-3">
              <FileText size={28} className="text-[var(--coral)]" />
              My CVs
            </h1>
            <p className="font-mono text-sm text-[var(--fg-muted)] mt-1">
              {cvs.length} resume{cvs.length !== 1 ? 's' : ''} on file
            </p>
          </div>

          <button className="brutal-btn px-5 py-3 font-bold flex items-center gap-2 self-start" style={{ background: 'var(--yellow)', color: '#0a0a0a' }}>
            <Plus size={16} />
            NEW CV
          </button>
        </div>

        <StatsBar stats={stats} />

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cvs.map((cv) => (
            <CVCard key={cv.id} cv={cv} onDelete={handleDelete} />
          ))}

          {/* Ghost "add new" card */}
          <div
            key="add-new-cv"
            className="brutal-card bg-[var(--card-bg)] flex flex-col items-center justify-center gap-3 min-h-[200px] border-dashed opacity-50 hover:opacity-80 cursor-pointer transition-opacity"
          >
            <div className="p-3 border-2 border-dashed border-black">
              <Plus size={24} className="text-[var(--fg-muted)]" />
            </div>
            <p className="font-mono text-sm text-[var(--fg-muted)] text-center">Add a new CV</p>
          </div>
        </div>
      </div>
    </div>
  );
}
