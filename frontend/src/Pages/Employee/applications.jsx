import React, { useEffect, useMemo, useState } from 'react';
import { ClipboardList, Sparkles } from 'lucide-react';
import DashboardNav from '../../components/shared/DashboardNav';
import StatsBar from '../../components/shared/StatsBar';
import ApplicationItem from '../../components/Employee/ApplicationItem';
import api from '../../services/api';
import useFetch from '../../hooks/useFetch';

const normalizeMatchItems = (match, cvId) => {
  if (Array.isArray(match)) {
    return match.map((item, idx) => ({
      id: `${cvId}-${item.jobId || idx}`,
      role: item.position || item.jobTitle || 'Matched Role',
      company: item.company || 'Company',
      date: new Date().toLocaleDateString(),
      status: Number(item.score || item.matchScore || 0) >= 75 ? 'Shortlisted' : 'Under Review',
    }));
  }

  if (Array.isArray(match?.matches)) {
    return normalizeMatchItems(match.matches, cvId);
  }

  return [];
};

export default function Applications() {
  const [selected, setSelected] = useState(null);
  const [selectedCv, setSelectedCv] = useState('');
  const [apps, setApps] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const {
    data: cvs = [],
    loading,
    error: cvsError,
  } = useFetch(async () => {
    const res = await api.get('/cvs');
    return res.data?.data?.cvs || [];
  }, { initialData: [] });

  useEffect(() => {
    if (!selectedCv && cvs.length > 0) {
      setSelectedCv(cvs[0]._id || '');
    }
  }, [selectedCv, cvs]);

  const generateMatches = async () => {
    if (!selectedCv) return;
    setGenerating(true);
    setError('');
    try {
      const res = await api.post(`/cvs/${selectedCv}/recommend-jobs`);
      const match = res.data?.data?.match;
      setApps(normalizeMatchItems(match, selectedCv));
      setSelected(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to generate application matches.');
    } finally {
      setGenerating(false);
    }
  };

  const stats = useMemo(() => {
    return [
      { label: 'Total', value: apps.length, color: 'var(--blue)' },
      { label: 'Shortlisted', value: apps.filter((a) => a.status === 'Shortlisted').length, color: 'var(--mint)' },
      { label: 'Under Review', value: apps.filter((a) => a.status === 'Under Review').length, color: 'var(--yellow)' },
    ];
  }, [apps]);

  return (
    <div className="min-h-screen p-8 bg-(--bg) text-(--fg)">
      <div className="dashboard-shell">
        <DashboardNav role="employee" />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-['Space_Grotesk'] uppercase tracking-tight flex items-center gap-3">
            <ClipboardList size={28} className="text-(--blue)" />
            My Applications
          </h1>
          <p className="font-mono text-sm text-(--fg-muted) mt-1">
            Generate role matches from your CV using the backend recommendation route
          </p>
        </div>

        <div className="mb-6 grid gap-3 md:grid-cols-[1fr_auto]">
          <select
            value={selectedCv}
            onChange={(e) => setSelectedCv(e.target.value)}
            className="brutal-card px-4 py-3 bg-(--card-bg) font-mono text-sm"
            disabled={loading || cvs.length === 0}
          >
            {cvs.length === 0 ? (
              <option value="">No CVs available</option>
            ) : (
              cvs.map((cv) => (
                <option key={cv._id} value={cv._id}>
                  {cv.jobTitle}
                </option>
              ))
            )}
          </select>
          <button
            type="button"
            onClick={generateMatches}
            disabled={!selectedCv || generating}
            className="brutal-btn px-5 py-3 bg-(--teal) text-black"
          >
            <Sparkles size={16} />
            {generating ? 'Generating...' : 'Generate Matches'}
          </button>
        </div>

        <StatsBar stats={stats} />

        {(error || cvsError) && (
          <div className="mb-6 brutal-card p-4 bg-(--coral) text-black font-mono text-sm">
            {error || cvsError?.response?.data?.message || 'Unable to load your CVs.'}
          </div>
        )}

        {loading ? (
          <div className="brutal-card p-8 bg-(--card-bg) text-center font-mono text-(--fg-muted)">
            Loading CVs...
          </div>
        ) : apps.length === 0 ? (
          <div className="brutal-card p-8 bg-(--card-bg) text-center font-mono text-(--fg-muted)">
            Generate matches to populate your application list.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {apps.map((app) => (
              <div
                key={app.id}
                className="brutal-card bg-(--card-bg) cursor-pointer"
                onClick={() => setSelected(app)}
              >
                <ApplicationItem app={app} isSelected={selected?.id === app.id} />
              </div>
            ))}
          </div>
        )}

        {selected && (
          <p className="mt-4 font-mono text-xs text-(--fg-muted) text-center">
            Selected: <span className="font-bold text-(--fg)">{selected.role}</span> @ {selected.company}
          </p>
        )}
      </div>
    </div>
  );
}
