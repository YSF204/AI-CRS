import React, { useState } from 'react';
import { ClipboardList } from 'lucide-react';
import DashboardNav from '../../components/shared/DashboardNav';
import StatsBar from '../../components/shared/StatsBar';
import AnimatedList from '../../components/UI/AnimatedList';
import ApplicationItem from '../../components/Employee/ApplicationItem';

const APPS = [
  { id: 1, role: 'Frontend Developer', company: 'TechCorp',  date: 'Mar 25, 2026', status: 'Under Review' },
  { id: 2, role: 'UX Designer',        company: 'Creativa',  date: 'Mar 20, 2026', status: 'Shortlisted'  },
  { id: 3, role: 'Backend Engineer',   company: 'DataSoft',  date: 'Mar 10, 2026', status: 'Rejected'     },
  { id: 4, role: 'Product Manager',    company: 'LaunchPad', date: 'Mar 5, 2026',  status: 'Under Review' },
];

const STATS = [
  { label: 'Total',       value: APPS.length,                                        color: 'var(--blue)'  },
  { label: 'Shortlisted', value: APPS.filter((a) => a.status === 'Shortlisted').length, color: 'var(--mint)'  },
  { label: 'Rejected',    value: APPS.filter((a) => a.status === 'Rejected').length,    color: 'var(--coral)' },
];

export default function Applications() {
  const [selected, setSelected] = useState(null);

  return (
    <div className="min-h-screen p-8 bg-(--bg) text-(--fg)">
      <div className="max-w-5xl mx-auto">
        <DashboardNav role="employee" />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-['Space_Grotesk'] uppercase tracking-tight flex items-center gap-3">
            <ClipboardList size={28} className="text-(--blue)" />
            My Applications
          </h1>
          <p className="font-mono text-sm text-(--fg-muted) mt-1">Track the status of your job applications</p>
        </div>

        <StatsBar stats={STATS} />

        <AnimatedList
          items={APPS}
          renderItem={(app, i, isSelected) => (
            <ApplicationItem app={app} isSelected={isSelected} />
          )}
          onItemSelect={setSelected}
          showGradients
          enableArrowNavigation
          displayScrollbar
        />

        {selected && (
          <p className="mt-4 font-mono text-xs text-(--fg-muted) text-center">
            Selected: <span className="font-bold text-(--fg)">{selected.role}</span> @ {selected.company}
          </p>
        )}
      </div>
    </div>
  );
}
