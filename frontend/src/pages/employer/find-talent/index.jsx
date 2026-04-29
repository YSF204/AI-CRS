import React, { useState } from 'react';
import { Search, Clock } from 'lucide-react';
import DashboardNav from '../../../components/shared/DashboardNav';
import api from '../../../services/api';
import SearchForm from './components/SearchForm';
import ResultsOverlay from './components/ResultsOverlay';
import SearchHistory from './components/SearchHistory';

const EMPTY_FORM = {
  position: '',
  description: '',
  technicalSkills: '',
  softSkills: '',
  language: '',
  yearsOfExperience: '',
  additionalNotes: '',
};

export default function FindTalent() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);

  const [activeTab, setActiveTab] = useState('search');
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchHistory = async () => {
    setActiveTab('history');
    if (history.length > 0) return;
    setHistoryLoading(true);
    try {
      const res = await api.get('/candidates/history');
      setHistory(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setResults(null);

    try {
      const payload = {
        position: form.position,
        description: form.description,
        yearsOfExperience: form.yearsOfExperience ? Number(form.yearsOfExperience) : undefined,
        additionalNotes: form.additionalNotes,
        technicalSkills: form.technicalSkills ? form.technicalSkills.split(',').map(s => s.trim()).filter(Boolean) : [],
        softSkills: form.softSkills ? form.softSkills.split(',').map(s => s.trim()).filter(Boolean) : [],
        language: form.language ? form.language.split(',').map(s => s.trim()).filter(Boolean) : [],
      };

      const res = await api.post('/candidates/find', payload);
      setResults(res.data.data.candidates);
    } catch (err) {
      if (err.response?.status === 404) {
        setError(err.response?.data?.message || 'No candidates were found in the system to match against.');
      } else {
        setError(err.response?.data?.message || 'Failed to analyze candidates. The AI engine may be overloaded.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--nm-bg)',
      color: 'var(--nm-text-primary)',
      overflowX: 'hidden',
      fontFamily: 'var(--font-body)'
    }}>
      <div className="dashboard-nav-area">
        <DashboardNav role="employer" />
      </div>

      <div className="dashboard-shell" style={{ padding: 'var(--spacing-8)' }}>

        <div style={{
          display: 'flex',
          gap: 16,
          marginBottom: '3rem',
          borderBottom: '4px solid var(--nm-ink)',
          paddingBottom: 20
        }}>
           <button
             onClick={() => setActiveTab('search')}
             style={{
               background: activeTab === 'search' ? 'var(--nm-primary)' : 'transparent',
               color: activeTab === 'search' ? '#fff' : 'var(--nm-text-tertiary)',
               border: '4px solid var(--nm-ink)',
               padding: '12px 32px',
               fontFamily: 'var(--font-display)',
               fontWeight: 900,
               fontSize: 16,
               cursor: 'pointer',
               borderRadius: '0px',
               transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
               display: 'flex',
               alignItems: 'center',
               gap: 12,
               textTransform: 'uppercase',
               letterSpacing: '0.1em',
               boxShadow: activeTab === 'search' ? '4px 4px 0 var(--nm-ink)' : 'none',
               transform: activeTab === 'search' ? 'translate(-2px, -2px)' : 'none'
             }}
           >
             <Search size={20} strokeWidth={3} /> Primary Sync
           </button>
           <button
             onClick={fetchHistory}
             style={{
               background: activeTab === 'history' ? 'var(--nm-primary)' : 'transparent',
               color: activeTab === 'history' ? '#fff' : 'var(--nm-text-tertiary)',
               border: '4px solid var(--nm-ink)',
               padding: '12px 32px',
               fontFamily: 'var(--font-display)',
               fontWeight: 900,
               fontSize: 16,
               cursor: 'pointer',
               borderRadius: '0px',
               transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
               display: 'flex',
               alignItems: 'center',
               gap: 12,
               textTransform: 'uppercase',
               letterSpacing: '0.1em',
               boxShadow: activeTab === 'history' ? '4px 4px 0 var(--nm-ink)' : 'none',
               transform: activeTab === 'history' ? 'translate(-2px, -2px)' : 'none'
             }}
           >
             <Clock size={20} strokeWidth={3} /> Archive Logs
           </button>
        </div>

        {activeTab === 'search' ? (
          <SearchForm form={form} set={set} loading={loading} error={error} onSubmit={handleSearch} />
        ) : (
          <SearchHistory history={history} historyLoading={historyLoading} onSelectRecord={setResults} />
        )}

      </div>
      {results && <ResultsOverlay results={results} onClose={() => setResults(null)} />}
    </div>
  );
}
