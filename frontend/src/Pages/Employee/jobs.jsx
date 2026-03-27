import React, { useState } from 'react';
import { Briefcase, Search } from 'lucide-react';
import DashboardNav from '../../components/shared/DashboardNav';
import StatsBar from '../../components/shared/StatsBar';
import AnimatedList from '../../components/UI/AnimatedList';
import JobItem from '../../components/Employee/JobItem';

const JOBS = [
  { id: 1, title: 'Frontend Developer', company: 'TechCorp',  location: 'Remote',     type: 'Full-time', posted: '2d ago' },
  { id: 2, title: 'UX Designer',        company: 'Creativa',  location: 'Cairo, EG',  type: 'Part-time', posted: '5d ago' },
  { id: 3, title: 'Backend Engineer',   company: 'DataSoft',  location: 'Hybrid',     type: 'Full-time', posted: '1w ago' },
  { id: 4, title: 'Product Manager',    company: 'LaunchPad', location: 'Alexandria', type: 'Full-time', posted: '2w ago' },
  { id: 5, title: 'DevOps Engineer',    company: 'CloudBase', location: 'Remote',     type: 'Contract',  posted: '3d ago' },
];

const STATS = [
  { label: 'Open',    value: JOBS.length, color: 'var(--teal)'   },
  { label: 'New',     value: 3,           color: 'var(--yellow)' },
  { label: 'Applied', value: 2,           color: 'var(--coral)'  },
];

export default function Jobs() {
  const [query,    setQuery]    = useState('');
  const [selected, setSelected] = useState(null);

  const filtered = JOBS.filter(
    (j) =>
      j.title.toLowerCase().includes(query.toLowerCase()) ||
      j.company.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="min-h-screen p-8 bg-(--bg) text-(--fg)">
      <div className="max-w-5xl mx-auto">
        <DashboardNav role="employee" />

        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-['Space_Grotesk'] uppercase tracking-tight flex items-center gap-3">
              <Briefcase size={28} className="text-(--teal)" />
              Find Jobs
            </h1>
            <p className="font-mono text-sm text-(--fg-muted) mt-1">{filtered.length} positions available</p>
          </div>

          <div className="flex items-center gap-2 brutal-card px-4 py-2.5 bg-(--card-bg) w-full sm:w-64">
            <Search size={15} className="text-(--fg-muted) shrink-0" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-transparent outline-none font-mono text-sm w-full placeholder:text-(--fg-muted)"
            />
          </div>
        </div>

        <StatsBar stats={STATS} />

        <AnimatedList
          items={filtered}
          renderItem={(job, i, isSelected) => (
            <JobItem job={job} isSelected={isSelected} />
          )}
          onItemSelect={setSelected}
          showGradients
          enableArrowNavigation
          displayScrollbar
        />

        {selected && (
          <p className="mt-4 font-mono text-xs text-(--fg-muted) text-center">
            Selected: <span className="font-bold text-(--fg)">{selected.title}</span> @ {selected.company}
          </p>
        )}
      </div>
    </div>
  );
}
