import React, { useState } from 'react';
import { Search, Sparkles, ArrowLeft, CheckCircle2, XCircle, AlertCircle, Clock, ChevronRight } from 'lucide-react';
import DashboardNav from '../../components/shared/DashboardNav';
import ActionButton from '../../components/shared/ActionButton';
import api from '../../services/api';

const INPUT = {
  width: '100%', 
  padding: '16px 20px', 
  boxSizing: 'border-box',
  fontFamily: 'var(--font-body)', 
  fontSize: 15,
  fontWeight: 600,
  background: 'var(--nm-bg)', 
  color: 'var(--nm-text-primary)',
  border: '4px solid var(--nm-ink)', 
  outline: 'none',
  boxShadow: '4px 4px 0 var(--nm-ink)',
  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
  borderRadius: '0px',
};

const LABEL = {
  display: 'block', 
  fontFamily: 'var(--font-display)',
  fontWeight: 800, 
  fontSize: 12, 
  textTransform: 'uppercase',
  letterSpacing: '0.15em', 
  color: 'var(--nm-text-tertiary)', 
  marginBottom: 10,
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
    <div 
      className="nm-card"
      style={{
        background: 'var(--nm-surface)', 
        borderWidth: '4px',
        boxShadow: '12px 12px 0 var(--nm-ink)', 
        padding: 'clamp(2rem, 6vw, 5rem)',
        borderRadius: '0px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
        <div style={{ 
          background: 'var(--nm-primary)', 
          padding: 12, 
          border: '4px solid var(--nm-ink)', 
          boxShadow: '4px 4px 0 var(--nm-ink)',
          display: 'inline-flex'
        }}>
          <Sparkles size={32} color="#fff" strokeWidth={2.5} />
        </div>
        <h1 style={{ 
          fontFamily: 'var(--font-display)', 
          fontWeight: 900, 
          fontSize: 'clamp(2.5rem, 6vw, 4rem)', 
          color: 'var(--nm-text-primary)', 
          textTransform: 'uppercase', 
          letterSpacing: '-0.04em', 
          lineHeight: 1, 
          margin: 0 
        }}>
          AI Matchmaker
        </h1>
      </div>
      <p style={{ 
        fontFamily: 'var(--font-body)', 
        fontSize: 16, 
        color: 'var(--nm-text-secondary)', 
        marginBottom: '4rem',
        maxWidth: '800px',
        lineHeight: 1.6
      }}>
        Harness advanced neural filtering to identify top-tier talent. Our engine analyzes competencies, soft skills, and experience history to deliver precision matching.
      </p>

      {error && (
        <div style={{ 
          padding: '20px 24px', 
          background: 'var(--nm-error)', 
          color: '#fff', 
          border: '4px solid var(--nm-ink)', 
          fontFamily: 'var(--font-display)', 
          fontWeight: 800, 
          fontSize: 14, 
          textTransform: 'uppercase', 
          letterSpacing: '0.1em', 
          marginBottom: 32, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 12,
          boxShadow: '4px 4px 0 var(--nm-ink)'
        }}>
          <AlertCircle size={24} strokeWidth={3} /> {error}
        </div>
      )}

      <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>
          <div>
            <label style={LABEL}>Position Designation *</label>
            <input 
              style={INPUT} 
              value={form.position} 
              onChange={set('position')} 
              placeholder="e.g. SYSTEMS ARCHITECT" 
              required 
              onFocus={e => e.target.style.transform = 'translate(-2px, -2px)'}
              onBlur={e => e.target.style.transform = 'none'}
            />
          </div>
          <div>
            <label style={LABEL}>Experience Threshold (Years)</label>
            <input 
              style={INPUT} 
              type="number" 
              min="0" 
              value={form.yearsOfExperience} 
              onChange={set('yearsOfExperience')} 
              placeholder="e.g. 5" 
              onFocus={e => e.target.style.transform = 'translate(-2px, -2px)'}
              onBlur={e => e.target.style.transform = 'none'}
            />
          </div>
        </div>

        <div>
          <label style={LABEL}>Contextual Role Requirements</label>
          <textarea 
            style={{ ...INPUT, minHeight: 140, resize: 'vertical' }} 
            value={form.description} 
            onChange={set('description')} 
            placeholder="Specify technical complexity, leadership expectations, and operational environment..." 
            onFocus={e => e.target.style.transform = 'translate(-2px, -2px)'}
            onBlur={e => e.target.style.transform = 'none'}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>
          <div>
            <label style={LABEL}>Technical Competencies <span style={{ textTransform: 'none', fontWeight: 500, opacity: 0.6 }}>(CSV)</span></label>
            <input 
              style={INPUT} 
              value={form.technicalSkills} 
              onChange={set('technicalSkills')} 
              placeholder="React, Docker, Kubernetes" 
              onFocus={e => e.target.style.transform = 'translate(-2px, -2px)'}
              onBlur={e => e.target.style.transform = 'none'}
            />
          </div>
          <div>
            <label style={LABEL}>Behavioral Traits <span style={{ textTransform: 'none', fontWeight: 500, opacity: 0.6 }}>(CSV)</span></label>
            <input 
              style={INPUT} 
              value={form.softSkills} 
              onChange={set('softSkills')} 
              placeholder="Strategic Thinking, Resilience" 
              onFocus={e => e.target.style.transform = 'translate(-2px, -2px)'}
              onBlur={e => e.target.style.transform = 'none'}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>
          <div>
            <label style={LABEL}>Linguistic Proficiency <span style={{ textTransform: 'none', fontWeight: 500, opacity: 0.6 }}>(CSV)</span></label>
            <input 
              style={INPUT} 
              value={form.language} 
              onChange={set('language')} 
              placeholder="English (Fluent), German" 
              onFocus={e => e.target.style.transform = 'translate(-2px, -2px)'}
              onBlur={e => e.target.style.transform = 'none'}
            />
          </div>
          <div>
            <label style={LABEL}>Strategic Constraints</label>
            <input 
              style={INPUT} 
              value={form.additionalNotes} 
              onChange={set('additionalNotes')} 
              placeholder="Specific timezone, clearance, or relocation..." 
              onFocus={e => e.target.style.transform = 'translate(-2px, -2px)'}
              onBlur={e => e.target.style.transform = 'none'}
            />
          </div>
        </div>

        <button
          type="submit"
          className="nm-btn"
          disabled={loading}
          style={{
            background: 'var(--nm-primary)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            padding: '20px',
            width: '100%',
            fontFamily: 'var(--font-display)',
            fontWeight: 900,
            fontSize: 18,
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            marginTop: 16,
          }}
        >
          {loading ? (
            <>
              <Search className="animate-spin" size={28} strokeWidth={3} />
              ANALYZING DATASETS...
            </>
          ) : (
            <>
              <Sparkles size={28} strokeWidth={2.5} />
              ACTIVATE AI SCAN →
            </>
          )}
        </button>
      </form>
    </div>
  );

  const renderResults = () => (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(12px)',
      zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
      overflowY: 'auto', padding: 'clamp(1rem, 5vw, 4rem)',
    }}>
      <div 
        className="nm-card"
        style={{
          background: 'var(--nm-bg)', width: 'min(96vw, 1200px)',
          border: '4px solid var(--nm-ink)', boxShadow: '20px 20px 0 rgba(0,0,0,0.5)',
          padding: 'clamp(2rem, 5vw, 4rem)', position: 'relative', marginTop: '4rem', marginBottom: '4rem',
          borderRadius: '0px',
        }}
      >
        <button 
          onClick={() => setResults(null)}
          className="nm-btn"
          style={{
            position: 'absolute', top: -30, right: -30, width: 60, height: 60,
            background: 'var(--nm-error)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 0
          }}
        >
          <XCircle size={32} strokeWidth={2.5} />
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4rem', flexWrap: 'wrap', gap: 24 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--nm-primary)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 8 }}>
              Neural Match Logic v2.4
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(2.5rem, 6vw, 4rem)', color: 'var(--nm-text-primary)', textTransform: 'uppercase', letterSpacing: '-0.04em', lineHeight: 1, margin: 0 }}>
              Primary Targets
            </h2>
          </div>
          <div style={{ 
            fontFamily: 'var(--font-display)', 
            fontSize: 14, 
            background: 'var(--nm-warning)', 
            color: '#0a0a0a', 
            border: '4px solid var(--nm-ink)', 
            padding: '10px 20px', 
            fontWeight: 900,
            textTransform: 'uppercase',
            boxShadow: '6px 6px 0 var(--nm-ink)'
          }}>
            PRECISION RANKED
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        {results.map((candidate, i) => (
          <div key={candidate.cvId?._id || candidate.cvId || i} 
            className="nm-card"
            style={{
              background: 'var(--nm-surface)', 
              borderWidth: '4px',
              boxShadow: '8px 8px 0 var(--nm-ink)', 
              padding: '2.5rem',
              position: 'relative',
              borderRadius: '0px'
            }}
          >
            {/* Rank Badge */}
            <div style={{ 
              position: 'absolute', 
              top: -20, 
              left: -20, 
              width: 50, 
              height: 50, 
              background: 'var(--nm-primary)', 
              border: '4px solid var(--nm-ink)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontFamily: 'var(--font-display)', 
              fontWeight: 900, 
              fontSize: 22, 
              color: '#fff', 
              boxShadow: '4px 4px 0 var(--nm-ink)' 
            }}>
              #{candidate.rank}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 24 }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 32, margin: '0 0 8px', color: 'var(--nm-text-primary)', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
                  {candidate.profile?.name || candidate.userId?.firstName + ' ' + candidate.userId?.lastName || 'SECURE ENTITY'}
                </h3>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 16, fontWeight: 600, color: 'var(--nm-text-tertiary)', marginBottom: 12 }}>
                  {candidate.profile?.jobTitle || candidate.CVId?.jobTitle || 'UNSPECIFIED ROLE'} • {candidate.profile?.email || candidate.userId?.email || 'DATA ENCRYPTED'}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ 
                  fontFamily: 'var(--font-display)', 
                  fontWeight: 900, 
                  fontSize: 48, 
                  color: candidate.matchScore > 80 ? 'var(--nm-success)' : (candidate.matchScore > 60 ? 'var(--nm-warning)' : 'var(--nm-error)'), 
                  lineHeight: 1 
                }}>
                  {candidate.matchScore}%
                </div>
                <div style={{ 
                  fontFamily: 'var(--font-display)', 
                  fontSize: 12, 
                  color: 'var(--nm-text-tertiary)', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.15em',
                  fontWeight: 800
                }}>
                  Compatibility
                </div>
              </div>
            </div>

            <div style={{ 
              background: 'var(--nm-bg)', 
              border: '4px solid var(--nm-ink)', 
              padding: '2rem', 
              marginTop: '2rem',
              boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.1)'
            }}>
              <div style={{ 
                fontFamily: 'var(--font-display)', 
                fontSize: 13, 
                color: 'var(--nm-primary)', 
                textTransform: 'uppercase', 
                letterSpacing: '0.15em', 
                marginBottom: 12, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 8,
                fontWeight: 900
              }}>
                <Sparkles size={18} strokeWidth={3} /> Neural Reasoning
              </div>
              <p style={{ 
                fontFamily: 'var(--font-body)', 
                fontSize: 18, 
                fontWeight: 500,
                color: 'var(--nm-text-primary)', 
                lineHeight: 1.7, 
                margin: 0 
              }}>
                {candidate.reasoning}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem', marginTop: '2.5rem' }}>
              <div>
                <div style={{ 
                  fontFamily: 'var(--font-display)', 
                  fontSize: 13, 
                  color: 'var(--nm-success)', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.15em', 
                  marginBottom: 16, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 10,
                  fontWeight: 900
                }}>
                  <CheckCircle2 size={20} strokeWidth={3} /> Strategic Strengths
                </div>
                <ul style={{ 
                  margin: 0, 
                  padding: 0, 
                  listStyle: 'none',
                  fontFamily: 'var(--font-body)', 
                  fontSize: 16, 
                  fontWeight: 600,
                  color: 'var(--nm-text-secondary)', 
                  lineHeight: 1.6 
                }}>
                  {candidate.strengths?.map((str, idx) => (
                    <li key={idx} style={{ 
                      marginBottom: 10, 
                      display: 'flex', 
                      gap: 12, 
                      alignItems: 'flex-start' 
                    }}>
                      <span style={{ color: 'var(--nm-success)', fontWeight: 900 }}>•</span>
                      {str}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div style={{ 
                  fontFamily: 'var(--font-display)', 
                  fontSize: 13, 
                  color: 'var(--nm-error)', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.15em', 
                  marginBottom: 16, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 10,
                  fontWeight: 900
                }}>
                  <XCircle size={20} strokeWidth={3} /> Critical Gaps
                </div>
                {candidate.skillsMissing?.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {candidate.skillsMissing.map(skill => (
                      <span key={skill} style={{ 
                        background: 'var(--nm-bg)', 
                        border: '3px solid var(--nm-error)', 
                        color: 'var(--nm-error)', 
                        padding: '6px 14px', 
                        fontSize: 14, 
                        fontFamily: 'var(--font-display)', 
                        fontWeight: 800,
                        textTransform: 'uppercase'
                      }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span style={{ 
                    fontFamily: 'var(--font-body)', 
                    fontSize: 16, 
                    color: 'var(--nm-text-tertiary)', 
                    fontStyle: 'italic',
                    fontWeight: 500
                  }}>Zero deficiency detected</span>
                )}
              </div>
            </div>

            <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'flex-end' }}>
               <button 
                onClick={() => alert('Detailed dossier access coming in next build phase.')}
                className="nm-btn"
                style={{
                  padding: '14px 28px', 
                  background: 'var(--nm-text-primary)', 
                  color: 'var(--nm-bg)',
                  fontFamily: 'var(--font-display)', 
                  fontWeight: 900, 
                  fontSize: 14,
                  textTransform: 'uppercase', 
                  letterSpacing: '0.15em',
                }}
               >
                 View Full Dossier
               </button>
            </div>
          </div>
        ))}
      </div>
      </div>
    </div>
  );

  const renderHistory = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {historyLoading ? (
        <div style={{ 
          fontFamily: 'var(--font-display)', 
          fontWeight: 800,
          color: 'var(--nm-text-tertiary)', 
          padding: '4rem', 
          textAlign: 'center',
          textTransform: 'uppercase',
          letterSpacing: '0.1em'
        }}>Syncing Intelligence Cache...</div>
      ) : history.length === 0 ? (
        <div style={{ 
          background: 'var(--nm-surface)', 
          border: '4px solid var(--nm-ink)', 
          padding: '5rem', 
          textAlign: 'center', 
          color: 'var(--nm-text-tertiary)', 
          boxShadow: '10px 10px 0 var(--nm-ink)'
        }}>
          <Clock size={48} strokeWidth={2.5} style={{ margin: '0 auto 24px', opacity: 0.5 }} />
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 18, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            No Search Logs Identified
          </div>
        </div>
      ) : (
        history.map((record) => (
          <div key={record._id} 
            onClick={() => setResults(record.candidate)}
            className="nm-card"
            style={{ 
              background: 'var(--nm-surface)', 
              borderWidth: '4px', 
              padding: '2rem 2.5rem', 
              borderRadius: '0px', 
              cursor: 'pointer',
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              gap: 24,
              boxShadow: '6px 6px 0 var(--nm-ink)'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-4px, -4px)'; e.currentTarget.style.boxShadow = '10px 10px 0 var(--nm-ink)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '6px 6px 0 var(--nm-ink)'; }}
          >
            <div>
              <h3 style={{ 
                fontFamily: 'var(--font-display)', 
                fontWeight: 900, 
                fontSize: 24, 
                color: 'var(--nm-text-primary)', 
                margin: '0 0 10px',
                textTransform: 'uppercase',
                letterSpacing: '-0.02em'
              }}>
                {record.searchRequirements.position}
              </h3>
              <div style={{ 
                fontFamily: 'var(--font-body)', 
                fontSize: 14, 
                fontWeight: 600,
                color: 'var(--nm-text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                {new Date(record.createdAt).toLocaleDateString()} • {record.candidate.length} Neural Matches
              </div>
            </div>
            <div style={{ 
              width: 52, 
              height: 52, 
              background: 'var(--nm-bg)', 
              border: '4px solid var(--nm-ink)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: 'var(--nm-text-primary)',
              boxShadow: '4px 4px 0 var(--nm-ink)'
            }}>
              <ChevronRight size={28} strokeWidth={3} />
            </div>
          </div>
        ))
      )}
    </div>
  );

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

        {/* Toggle Tabs */}
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

        {activeTab === 'search' ? renderForm() : renderHistory()}

      </div>
      {results && renderResults()}
    </div>
  );
}
