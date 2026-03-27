import React, { useState } from 'react';
import { FileText, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import DashboardNav from '../../components/shared/DashboardNav';
import StatsBar from '../../components/shared/StatsBar';
import CVCard from '../../components/Employee/CVCard';

const INITIAL_CVS = [
  { id: 1, name: 'Software Engineer CV', updated: 'Mar 26, 2026', skills: ['React', 'Node.js', 'SQL'],            color: 'var(--teal)'   },
  { id: 2, name: 'UX Designer CV',       updated: 'Mar 15, 2026', skills: ['Figma', 'CSS', 'User Research'],      color: 'var(--coral)'  },
  { id: 3, name: 'Full-Stack CV',        updated: 'Mar 10, 2026', skills: ['TypeScript', 'PostgreSQL', 'Docker'],  color: 'var(--yellow)' },
];

export default function CVs() {
  const [cvs, setCvs] = useState(INITIAL_CVS);

  const handleDelete = (id) => setCvs((prev) => prev.filter((c) => c.id !== id));

  const stats = [
    { label: 'Total',  value: cvs.length,                           color: 'var(--coral)'  },
    { label: 'Active', value: 2,                                     color: 'var(--teal)'   },
    { label: 'Skills', value: cvs.flatMap((c) => c.skills).length,   color: 'var(--yellow)' },
  ];

  return (
    <div className="min-h-screen p-8 bg-(--bg) text-(--fg)">
      <div className="max-w-6xl mx-auto">
        <DashboardNav role="employee" />

        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-['Space_Grotesk'] uppercase tracking-tight flex items-center gap-3">
              <FileText size={28} className="text-(--coral)" />
              My CVs
            </h1>
            <p className="font-mono text-sm text-(--fg-muted) mt-1">
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
          {cvs.map((cv, i) => (
            <CVCard key={cv.id} cv={cv} index={i} onDelete={handleDelete} />
          ))}

          {/* Ghost "add new" card */}
          <motion.div
            key="add-new-cv"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: cvs.length * 0.07, ease: [0.22, 1, 0.36, 1] }}
            className="brutal-card bg-(--card-bg) flex flex-col items-center justify-center gap-3 min-h-[200px] border-dashed opacity-50 hover:opacity-80 cursor-pointer transition-opacity"
          >
            <div className="p-3 border-2 border-dashed border-black">
              <Plus size={24} className="text-(--fg-muted)" />
            </div>
            <p className="font-mono text-sm text-(--fg-muted) text-center">Add a new CV</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
