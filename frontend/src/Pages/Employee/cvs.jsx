import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus } from 'lucide-react';
import DashboardNav from '../../components/shared/DashboardNav';
import StatsBar from '../../components/shared/StatsBar';
import CVCard from '../../components/Employee/CVCard';
import api from '../../services/api';
import useFetch from '../../hooks/useFetch';

const COLORS = ['var(--teal)', 'var(--coral)', 'var(--yellow)', 'var(--mint)', 'var(--blue)'];

export default function CVs() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const {
    data: cvs = [],
    loading,
    error: fetchError,
    refetch,
  } = useFetch(async () => {
    const res = await api.get('/cvs');
    return res.data?.data?.cvs || [];
  }, { initialData: [] });

  const setCvsError = (err, fallback) =>
    setError(err?.response?.data?.message || fallback);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/cvs/${id}`);
      await refetch();
    } catch (err) {
      setCvsError(err, 'Unable to delete CV.');
    }
  };

  const goToTemplates = () => navigate('/employee/cv-templates');

  const stats = useMemo(() => {
    const safeCvs = Array.isArray(cvs) ? cvs : [];
    const skillsCount = safeCvs.reduce((total, cv) => total + (Array.isArray(cv.technicalSkills) ? cv.technicalSkills.length : 0), 0);

    return [
      { label: 'Total', value: safeCvs.length, color: 'var(--coral)' },
      { label: 'With Summary', value: safeCvs.filter((cv) => cv.summary).length, color: 'var(--teal)' },
      { label: 'Skills', value: skillsCount, color: 'var(--yellow)' },
    ];
  }, [cvs]);

  return (
    <div className="min-h-screen p-8 bg-[var(--bg)] text-[var(--fg)]">
      <div className="dashboard-shell">
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

          <button
            className="brutal-btn px-5 py-3 font-bold flex items-center gap-2 self-start"
            style={{ background: 'var(--yellow)', color: '#0a0a0a' }}
            onClick={goToTemplates}
            id="new-cv-btn"
          >
            <Plus size={16} />
            NEW CV
          </button>
        </div>

        <StatsBar stats={stats} />

        {(error || fetchError) && (
          <div className="mb-6 brutal-card p-4 bg-(--coral) text-black font-mono text-sm">
            {error || fetchError?.response?.data?.message || 'Unable to load CVs.'}
          </div>
        )}

        {loading ? (
          <div className="brutal-card p-8 bg-(--card-bg) text-center font-mono text-(--fg-muted)">
            Loading CVs...
          </div>
        ) : null}

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cvs.map((cv, index) => (
            <CVCard
              key={cv._id}
              cv={{
                id: cv._id,
                name: cv.jobTitle,
                updated: new Date(cv.updatedAt || cv.createdAt).toLocaleDateString(),
                skills: cv.technicalSkills || [],
                color: COLORS[index % COLORS.length],
                templateId: cv.templateId || 1,
              }}
              onDelete={handleDelete}
            />
          ))}

          {/* Ghost "add new" card */}
          <div
            key="add-new-cv"
            className="brutal-card bg-[var(--card-bg)] flex flex-col items-center justify-center gap-3 min-h-[200px] border-dashed opacity-50 hover:opacity-80 cursor-pointer transition-opacity"
            onClick={goToTemplates}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && goToTemplates()}
            aria-label="Browse templates and add a new CV"
          >
            <div className="p-3 border-2 border-dashed border-black">
              <Plus size={24} className="text-[var(--fg-muted)]" />
            </div>
            <p className="font-mono text-sm text-[var(--fg-muted)] text-center">Browse Templates</p>
          </div>
        </div>
      </div>
    </div>
  );
}
