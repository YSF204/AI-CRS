import React, { useState } from 'react';
import { Search, Sparkles, ArrowLeft, CheckCircle2, XCircle, AlertCircle, Clock, ChevronRight } from 'lucide-react';
import DashboardNav from '../../components/shared/DashboardNav';
import api from '../../services/api';

const INPUT = {
  width: '100%', padding: '14px 18px', boxSizing: 'border-box',
  fontFamily: "'DM Mono', monospace", fontSize: 14,
  background: 'var(--bg)', color: 'var(--fg)',
  border: '3px solid var(--border-color)', outline: 'none',
  boxShadow: '4px 4px 0 var(--shadow-color)',
  transition: 'all 0.15s ease'
};

const LABEL = {
  display: 'block', fontFamily: "'Space Grotesk', sans-serif",
  fontWeight: 800, fontSize: 12, textTransform: 'uppercase',
  letterSpacing: '0.1em', color: 'var(--fg)', marginBottom: 8,
};

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

  const renderForm = () => (
    <div style={{
      background: 'var(--card-bg)', border: '4px solid var(--border-color)',
      boxShadow: '8px 8px 0 var(--shadow-color)', padding: 'clamp(2rem, 5vw, 4rem)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <Sparkles size={36} color="#A78BFA" />
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: 'var(--fg)', textTransform: 'uppercase', letterSpacing: '-0.03em', lineHeight: 1 }}>
          AI Matchmaker
        </h1>
      </div>
      <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: 'var(--fg-muted)', marginBottom: '3rem' }}>
        Define your ideal candidate. Our AI engine will analyze the entire talent pool and return ranked matches based on your criteria.
      </p>

      {error && (
        <div style={{ padding: '16px 20px', background: '#FF6B6B', color: '#0a0a0a', border: '3px solid #0a0a0a', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertCircle size={20} /> {error}
        </div>
      )}

      <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24 }}>
          <div>
            <label style={LABEL}>Position Title *</label>
            <input style={INPUT} value={form.position} onChange={set('position')} placeholder="e.g. Senior Frontend Engineer" required />
          </div>
          <div>
            <label style={LABEL}>Years Exp. Required</label>
            <input style={INPUT} type="number" min="0" value={form.yearsOfExperience} onChange={set('yearsOfExperience')} placeholder="e.g. 5" />
          </div>
        </div>

        <div>
          <label style={LABEL}>Role Description</label>
          <textarea style={{ ...INPUT, minHeight: 120, resize: 'vertical' }} value={form.description} onChange={set('description')} placeholder="Summarize the core responsibilities and team environment..." />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          <div>
            <label style={LABEL}>Technical Skills <span style={{ textTransform: 'none', fontWeight: 500, color: 'var(--fg-muted)' }}>(comma-separated)</span></label>
            <input style={INPUT} value={form.technicalSkills} onChange={set('technicalSkills')} placeholder="React, Node.js, AWS" />
          </div>
          <div>
            <label style={LABEL}>Soft Skills <span style={{ textTransform: 'none', fontWeight: 500, color: 'var(--fg-muted)' }}>(comma-separated)</span></label>
            <input style={INPUT} value={form.softSkills} onChange={set('softSkills')} placeholder="Leadership, Agile, Communication" />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          <div>
            <label style={LABEL}>Languages <span style={{ textTransform: 'none', fontWeight: 500, color: 'var(--fg-muted)' }}>(comma-separated)</span></label>
            <input style={INPUT} value={form.language} onChange={set('language')} placeholder="English, Spanish" />
          </div>
          <div>
            <label style={LABEL}>Additional Notes</label>
            <input style={INPUT} value={form.additionalNotes} onChange={set('additionalNotes')} placeholder="Must be willing to relocate to Mars..." />
          </div>
        </div>

        <button
          type="submit" disabled={loading}
          style={{
            marginTop: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12,
            padding: '18px', background: '#A78BFA', color: '#0a0a0a',
            border: '4px solid #0a0a0a', boxShadow: '6px 6px 0 #0a0a0a',
            fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 18,
            textTransform: 'uppercase', letterSpacing: '0.1em',
            cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1,
            transition: 'transform 0.1s ease, box-shadow 0.1s ease'
          }}
          onMouseEnter={e => { if(!loading) { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = '4px 4px 0 #0a0a0a'; } }}
          onMouseLeave={e => { if(!loading) { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '6px 6px 0 #0a0a0a'; } }}
        >
          {loading ? (
            <>
              <Search className="animate-spin" size={24} />
              PROCESSING AI MATCH...
            </>
          ) : (
            <>
              <Sparkles size={24} />
              RUN AI MATCH ENGINE →
            </>
          )}
        </button>
      </form>
    </div>
  );

  const renderResults = () => (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)',
      zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
      overflowY: 'auto', padding: 'clamp(2rem, 5vw, 4rem)',
    }}>
      <div style={{
        background: 'var(--bg)', width: 'min(96vw, 1500px)',
        border: '3px solid var(--border-color)', boxShadow: '8px 8px 0 rgba(0,0,0,0.5)',
        padding: 'clamp(1.5rem, 4%, 3rem)', position: 'relative', marginTop: '2rem', marginBottom: '4rem',
        borderRadius: 8,
      }}>
        <button 
          onClick={() => setResults(null)}
          style={{
            position: 'absolute', top: -20, right: -20, width: 44, height: 44,
            background: 'var(--bg)', border: '2px solid var(--border-color)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)', transition: 'all 0.2s ease', zIndex: 10, color: 'var(--fg)',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.color = '#FF6B6B'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.color = 'var(--fg)'; }}
        >
          <XCircle size={24} />
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', color: 'var(--fg)', textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 1, margin: 0 }}>
              Top {results.length} Matches
            </h2>
          </div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, background: '#FFE630', color: '#0a0a0a', border: '2px solid #0a0a0a', padding: '6px 14px', fontWeight: 'bold' }}>
            RANKED BY AI
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {results.map((candidate, i) => (
          <div key={candidate.cvId?._id || candidate.cvId || i} style={{
            background: '#1e293b', border: '2px solid #334155', borderRadius: 8,
            boxShadow: '4px 4px 0 rgba(0,0,0,0.3)', padding: '2rem',
            position: 'relative'
          }}>
            {/* Rank Badge */}
            <div style={{ position: 'absolute', top: -16, left: -16, width: 40, height: 40, background: '#818cf8', border: '2px solid #1e1e1e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 18, color: '#fff', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
              #{candidate.rank}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 24, margin: '0 0 4px', color: '#f8fafc' }}>
                  {candidate.profile?.name || candidate.userId?.firstName + ' ' + candidate.userId?.lastName || 'Unknown Talent'}
                </h3>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: '#94a3b8', marginBottom: 12 }}>
                  {candidate.profile?.jobTitle || candidate.CVId?.jobTitle || 'No Title'} • {candidate.profile?.email || candidate.userId?.email || 'Confidential'}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 32, color: candidate.matchScore > 80 ? '#34d399' : (candidate.matchScore > 60 ? '#fde047' : '#f87171'), lineHeight: 1 }}>
                  {candidate.matchScore}%
                </div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Match Score
                </div>
              </div>
            </div>

            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 6, padding: '1.5rem', marginTop: '1.5rem' }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: '#c084fc', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={16} /> AI Reasoning
              </div>
              <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 17, color: '#f8fafc', lineHeight: 1.7, margin: 0 }}>
                {candidate.reasoning}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
              <div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={16} /> Key Strengths
                </div>
                <ul style={{ margin: 0, paddingLeft: 18, fontFamily: "'DM Mono', monospace", fontSize: 15, color: '#e2e8f0', lineHeight: 1.6 }}>
                  {candidate.strengths?.map((str, idx) => (
                    <li key={idx} style={{ marginBottom: 6 }}>{str}</li>
                  ))}
                </ul>
              </div>

              <div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <XCircle size={16} /> Missing Skills
                </div>
                {candidate.skillsMissing?.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {candidate.skillsMissing.map(skill => (
                      <span key={skill} style={{ background: 'transparent', border: '1px solid #f87171', color: '#fca5a5', padding: '4px 10px', fontSize: 13, fontFamily: "'DM Mono', monospace", borderRadius: 99 }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 15, color: '#94a3b8', fontStyle: 'italic', paddingLeft: 4 }}>None identified</span>
                )}
              </div>
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
               <button 
                onClick={() => alert('Viewing specific profiles feature is coming in Phase 3!')}
                style={{
                  padding: '10px 20px', background: 'var(--fg)', color: 'var(--bg)',
                  border: '2px solid var(--border-color)', boxShadow: '3px 3px 0 var(--shadow-color)',
                  fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 13,
                  textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer',
                  transition: 'transform 0.1s ease, box-shadow 0.1s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = '1px 1px 0 var(--shadow-color)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '3px 3px 0 var(--shadow-color)'; }}
               >
                 View Full Profile
               </button>
            </div>
          </div>
        ))}
      </div>
      </div>
    </div>
  );

  const renderHistory = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {historyLoading ? (
        <div style={{ fontFamily: "'DM Mono', monospace", color: 'var(--fg-muted)', padding: '2rem', textAlign: 'center' }}>Loading search histories...</div>
      ) : history.length === 0 ? (
        <div style={{ background: 'var(--card-bg)', border: '2px solid var(--border-color)', padding: '3rem', textAlign: 'center', color: 'var(--fg-muted)', fontFamily: "'DM Mono', monospace" }}>
          <Clock size={32} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
          No past AI searches found.
        </div>
      ) : (
        history.map((record) => (
          <div key={record._id} 
            onClick={() => setResults(record.candidate)}
            style={{ 
              background: 'var(--card-bg)', border: '2px solid var(--border-color)', 
              padding: '1.5rem 2rem', borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s ease',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#A78BFA'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <div>
              <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 20, color: 'var(--fg)', margin: '0 0 8px' }}>
                {record.searchRequirements.position}
              </h3>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: 'var(--fg-muted)' }}>
                {new Date(record.createdAt).toLocaleDateString()} • {record.candidate.length} Matches Found
              </div>
            </div>
            <div style={{ width: 44, height: 44, background: 'var(--bg)', border: '2px solid var(--border-color)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg)' }}>
              <ChevronRight size={20} />
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--fg)', padding: 'clamp(1.5rem, 4%, 2.5rem)', overflowX: 'hidden' }}>
      <div className="dashboard-shell" style={{ marginBottom: '1rem' }}>
        <DashboardNav role="employer" />
      </div>
      <div className="dashboard-shell">
        
        {/* Toggle Tabs */}
        <div style={{ display: 'flex', gap: 12, marginBottom: '2rem', borderBottom: '3px solid var(--border-color)', paddingBottom: 16 }}>
           <button onClick={() => setActiveTab('search')} style={{ background: activeTab === 'search' ? '#A78BFA' : 'transparent', color: activeTab === 'search' ? '#0a0a0a' : 'var(--fg)', border: activeTab === 'search' ? '3px solid #0a0a0a' : '3px solid transparent', padding: '10px 24px', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 16, cursor: 'pointer', borderRadius: 4, transition: 'all 0.1s ease', display: 'flex', alignItems: 'center', gap: 8 }}>
             <Search size={18} /> New Search
           </button>
           <button onClick={fetchHistory} style={{ background: activeTab === 'history' ? '#A78BFA' : 'transparent', color: activeTab === 'history' ? '#0a0a0a' : 'var(--fg)', border: activeTab === 'history' ? '3px solid #0a0a0a' : '3px solid transparent', padding: '10px 24px', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 16, cursor: 'pointer', borderRadius: 4, transition: 'all 0.1s ease', display: 'flex', alignItems: 'center', gap: 8 }}>
             <Clock size={18} /> Search History
           </button>
        </div>

        {activeTab === 'search' ? renderForm() : renderHistory()}

      </div>
      {results && renderResults()}
    </div>
  );
}
