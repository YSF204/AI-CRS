import React, { useMemo, useState } from 'react';
import { Briefcase, Search } from 'lucide-react';
import { useDebounce } from '@uidotdev/usehooks';
import DashboardNav from '../../components/shared/DashboardNav';
import StatsBar from '../../components/shared/StatsBar';
import JobItem from '../../components/Employee/JobItem';
import api from '../../services/api';
import useFetch from '../../hooks/useFetch';

const toRoleType = (value) => {
  if (value === 'FULL_TIME') return 'Full-time';
  if (value === 'PART_TIME') return 'Part-time';
  if (value === 'CONTRACT') return 'Contract';
  if (value === 'INTERNSHIP') return 'Internship';
  return value || 'Open';
};

export default function Jobs() {
  const [query,    setQuery]    = useState('');
  const debouncedQuery = useDebounce(query, 250);
  const { data: jobs = [], loading, error } = useFetch(async () => {
    const res = await api.get('/jobs');
    return (res.data?.data?.jobs || []).map((job) => ({
      id: job._id,
      title: job.position,
      company: job.employerId?.company?.name || 'Company',
      location: job.workSite?.replace('_', ' ') || 'N/A',
      type: toRoleType(job.workDuration),
      posted: new Date(job.createdAt).toLocaleDateString(),
      raw: job,
    }));
  }, { initialData: [] });

  const filtered = jobs.filter(
    (j) =>
      j.title.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
      j.company.toLowerCase().includes(debouncedQuery.toLowerCase()),
  );

  const stats = useMemo(() => {
    const recentCutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recent = jobs.filter((job) => {
      const timestamp = new Date(job.raw?.createdAt || 0).getTime();
      return Number.isFinite(timestamp) && timestamp >= recentCutoff;
    }).length;
    return [
      { label: 'Open', value: jobs.length, color: 'var(--teal)' },
      { label: 'New (7d)', value: recent, color: 'var(--yellow)' },
      { label: 'Visible', value: filtered.length, color: 'var(--coral)' },
    ];
  }, [jobs, filtered.length]);

  return (
    <div className="min-h-screen p-8 bg-(--bg) text-(--fg)">
      <div className="dashboard-shell">
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

        <StatsBar stats={stats} />

        {error && (
          <div className="mb-6 brutal-card p-4 bg-(--coral) text-black font-mono text-sm">
            {error.response?.data?.message || 'Unable to load jobs.'}
          </div>
        )}

        {loading ? (
          <div className="brutal-card p-8 bg-(--card-bg) text-center font-mono text-(--fg-muted)">
            Loading jobs...
          </div>
        ) : filtered.length === 0 ? (
          <div className="brutal-card p-8 bg-(--card-bg) text-center font-mono text-(--fg-muted)">
            No jobs matched your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filtered.map((job) => (
              <div
                key={job.id}
                className="brutal-card bg-(--card-bg)"
              >
                <JobItem
                  job={job}
                  isSelected={false}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
