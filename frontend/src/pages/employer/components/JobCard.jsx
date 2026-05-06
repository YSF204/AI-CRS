import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, DollarSign, Wifi, Clock, Briefcase, Power, Edit, Users, Sparkles, X, FileText, ArrowLeft } from 'lucide-react';
import api from '../../../services/api';
import ApplicantDetail from '../../../components/applications/ApplicantDetail';
import ApplicationViewer from '../../../components/applications/ApplicationViewer';

const fmt = (n) => (n == null ? '—' : n.toLocaleString());
const ago = (d) => {
  const days = Math.floor((Date.now() - new Date(d)) / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
};

export default function JobCard({ job, onDelete, onUpdate, onViewCandidates }) {
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(job.status);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [shortlisting, setShortlisting] = useState(false);
  const [shortlistResults, setShortlistResults] = useState(null);
  const [shortlistError, setShortlistError] = useState(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [applicationDetail, setApplicationDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState(null);

  const closeShortlistModal = useCallback(() => {
    setShortlistResults(null);
    setShortlistError(null);
    setSelectedCandidateId(null);
    setApplicationDetail(null);
    setLoadingDetail(false);
    setDetailError(null);
  }, []);

  useEffect(() => {
    if (!(shortlistResults || shortlistError)) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') closeShortlistModal();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [shortlistResults, shortlistError, closeShortlistModal]);

  const handleSelectCandidate = async (candidate) => {
    if (selectedCandidateId === candidate.applicationId && applicationDetail) return;
    setSelectedCandidateId(candidate.applicationId);
    setApplicationDetail(null);
    setDetailError(null);
    setLoadingDetail(true);
    try {
      const res = await api.get(`/applications/${candidate.applicationId}`);
      setApplicationDetail(res.data?.data?.application || null);
    } catch (err) {
      setDetailError(err.response?.data?.message || 'Failed to load application');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleDeselectCandidate = () => {
    setSelectedCandidateId(null);
    setApplicationDetail(null);
    setDetailError(null);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/jobs/${job._id}`);
      onDelete(job._id);
    } catch {
      setDeleting(false);
      setShowConfirmDelete(false);
    }
  };

  const handleToggleStatus = async () => {
    const newStatus = currentStatus === 'OPEN' ? 'CLOSED' : 'OPEN';
    setToggling(true);
    try {
      await api.patch(`/jobs/${job._id}`, { status: newStatus });
      setCurrentStatus(newStatus);
      if (onUpdate) onUpdate(job._id, newStatus);
    } catch (err) {
      console.error(err);
      alert('Failed to update system status.');
    } finally {
      setToggling(false);
    }
  };

  const handleAiShortlist = async () => {
    setShortlisting(true);
    setShortlistError(null);
    setShortlistResults(null);
    setSelectedCandidateId(null);
    setApplicationDetail(null);
    try {
      const res = await api.post('/candidates/ai-shortlist', { jobId: job._id });
      setShortlistResults(res.data?.data || null);
    } catch (err) {
      setShortlistError(err.response?.data?.message || 'AI shortlist failed');
    } finally {
      setShortlisting(false);
    }
  };

  const selectedCandidate = shortlistResults?.candidates?.find(
    (c) => c.applicationId === selectedCandidateId
  );

  return (
    <>
      <div
        className="nm-card"
        style={{
          background: 'var(--nm-surface)',
          borderWidth: '4px',
          boxShadow: '8px 8px 0 var(--nm-ink)',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          borderRadius: '0px',
          transition: 'transform 0.2s ease',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 900,
              fontSize: 'clamp(16px, 3vw, 22px)',
              color: 'var(--nm-text-primary)',
              lineHeight: 1.1,
              textTransform: 'uppercase',
              letterSpacing: '-0.02em',
              wordBreak: 'break-word'
            }}>
              {job.position}
            </div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: 12,
              fontWeight: 800,
              color: 'var(--nm-text-tertiary)',
              marginTop: 8,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              LOGGED: {ago(job.createdAt)}
            </div>
          </div>
          <div style={{
            background: currentStatus === 'OPEN' ? 'var(--nm-success)' : 'var(--nm-text-tertiary)',
            border: '4px solid var(--nm-ink)',
            padding: '6px 14px',
            fontFamily: 'var(--font-display)',
            fontSize: 12,
            fontWeight: 900,
            textTransform: 'uppercase',
            color: '#fff',
            flexShrink: 0,
            boxShadow: '3px 3px 0 var(--nm-ink)'
          }}>
            {currentStatus}
          </div>
        </div>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px 20px',
          background: 'var(--nm-bg)',
          padding: '12px 16px',
          border: '3px solid var(--nm-ink)',
        }}>
          {job.salary != null && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontFamily: 'var(--font-display)', color: 'var(--nm-text-primary)', fontWeight: 800 }}>
              <DollarSign size={16} strokeWidth={3} /> {fmt(job.salary)}
            </span>
          )}
          {job.workSite && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontFamily: 'var(--font-display)', color: 'var(--nm-text-primary)', fontWeight: 800 }}>
              <Wifi size={16} strokeWidth={3} /> {job.workSite.toUpperCase()}
            </span>
          )}
          {job.workDuration && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontFamily: 'var(--font-display)', color: 'var(--nm-text-primary)', fontWeight: 800 }}>
              <Clock size={16} strokeWidth={3} /> {job.workDuration.toUpperCase()}
            </span>
          )}
          {job.yearsOfExperience != null && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontFamily: 'var(--font-display)', color: 'var(--nm-text-primary)', fontWeight: 800 }}>
              <Briefcase size={16} strokeWidth={3} /> {job.yearsOfExperience}Y EXP
            </span>
          )}
        </div>

        {job.technicalSkills?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {job.technicalSkills.slice(0, 3).map((s, i) => (
              <span key={i} style={{
                fontFamily: 'var(--font-display)',
                fontSize: 11,
                fontWeight: 900,
                padding: '5px 10px',
                border: '2px solid var(--nm-ink)',
                color: 'var(--nm-text-secondary)',
                background: 'var(--nm-bg)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                {s}
              </span>
            ))}
            {job.technicalSkills.length > 3 && (
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: 11,
                fontWeight: 900,
                color: 'var(--nm-text-tertiary)',
                padding: '5px 0'
              }}>
                +{job.technicalSkills.length - 3} MORE
              </span>
            )}
          </div>
        )}

        <div style={{
          display: 'flex',
          gap: 10,
          flexWrap: 'wrap',
          marginTop: '1.5rem',
          paddingTop: '1.5rem',
          borderTop: '3px solid var(--nm-ink)'
        }}>
          <button
            onClick={handleToggleStatus}
            disabled={toggling}
            className="nm-btn"
            style={{
              flex: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '12px', fontFamily: 'var(--font-display)', fontSize: 12,
              fontWeight: 900, textTransform: 'uppercase',
              background: currentStatus === 'OPEN' ? 'var(--nm-warning)' : 'var(--nm-primary)',
              color: '#0a0a0a',
            }}
          >
            <Power size={16} strokeWidth={3} /> {toggling ? 'WAIT' : currentStatus === 'OPEN' ? 'DEACTIVATE' : 'ACTIVATE'}
          </button>

          <Link
            to={`/employer/edit-job/${job._id}`}
            className="nm-btn"
            style={{
              flex: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, textDecoration: 'none',
              padding: '12px', fontFamily: 'var(--font-display)', fontSize: 12,
              fontWeight: 900, textTransform: 'uppercase',
              background: 'var(--nm-surface)', color: 'var(--nm-text-primary)',
            }}
          >
            <Edit size={16} strokeWidth={3} /> EDIT
          </Link>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={() => onViewCandidates && onViewCandidates(job._id)}
            className="nm-btn"
            style={{
              flex: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              padding: '14px', fontFamily: 'var(--font-display)', fontSize: 13,
              fontWeight: 900, textTransform: 'uppercase',
              background: 'var(--nm-primary)', color: '#fff',
            }}
          >
            <Users size={18} strokeWidth={3} /> View Applicants
          </button>

          <button
            onClick={handleAiShortlist}
            disabled={shortlisting}
            className="nm-btn"
            style={{
              flex: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              padding: '14px', fontFamily: 'var(--font-display)', fontSize: 13,
              fontWeight: 900, textTransform: 'uppercase',
              background: 'var(--nm-success)', color: '#0a0a0a',
            }}
          >
            <Sparkles size={18} strokeWidth={3} /> {shortlisting ? 'Analyzing...' : 'AI Shortlist'}
          </button>
        </div>

        <button
          onClick={() => setShowConfirmDelete(true)}
          disabled={deleting}
          className="nm-btn"
          style={{
            width: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            padding: '14px', fontFamily: 'var(--font-display)', fontSize: 13,
            fontWeight: 900, textTransform: 'uppercase',
            background: 'var(--nm-error)', color: '#fff',
          }}
        >
          <Trash2 size={18} strokeWidth={3} /> {deleting ? 'Deleting...' : 'Delete LISTING'}
        </button>
      </div>

      {showConfirmDelete && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center" }}>
          <div className="nm-card" style={{ background: "var(--nm-surface)", padding: "32px", maxWidth: "400px", width: "90%", border: "4px solid var(--nm-ink)", boxShadow: "8px 8px 0 var(--nm-ink)", borderRadius: "0px" }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "20px", textTransform: "uppercase", marginBottom: "12px", color: "var(--nm-text-primary)" }}>Confirm Termination</h3>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", marginBottom: "24px", color: "var(--nm-text-secondary)" }}>Are you sure you want to permanently terminate the listing "{job.position}"? This action cannot be undone.</p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="nm-btn"
                style={{ padding: "10px 16px", background: "var(--nm-surface-high)", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "12px", textTransform: "uppercase" }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="nm-btn"
                style={{ padding: "10px 16px", background: "var(--nm-error)", color: "#fff", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "12px", textTransform: "uppercase" }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {(shortlistResults || shortlistError) && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
          <style>{`
            @media (max-width: 860px) {
              .shortlist-modal-body { flex-direction: column !important; }
              .shortlist-left { max-height: 260px !important; width: 100% !important; min-width: 0 !important; border-right: none !important; border-bottom: 3px solid var(--nm-ink) !important; }
              .shortlist-right { min-height: 400px !important; }
            }
          `}</style>
          <div className="nm-card" style={{
            background: "var(--nm-bg)",
            maxWidth: selectedCandidateId ? "1200px" : "720px",
            width: "100%",
            maxHeight: "90vh",
            height: "90vh",
            display: "flex",
            flexDirection: "column",
            border: "4px solid var(--nm-ink)",
            boxShadow: "12px 12px 0 var(--nm-ink)",
            borderRadius: "0px",
            overflow: "hidden",
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "20px 24px",
              borderBottom: "3px solid var(--nm-ink)",
              flexShrink: 0,
            }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "20px", textTransform: "uppercase", margin: 0, color: "var(--nm-text-primary)" }}>
                AI Shortlist Results
              </h2>
              <button
                onClick={closeShortlistModal}
                className="nm-btn"
                style={{ background: "var(--nm-error)", color: "#fff", padding: "8px 12px" }}
              >
                <X size={18} strokeWidth={3} />
              </button>
            </div>

            {shortlistError && (
              <div style={{ background: "var(--nm-error)", color: "#fff", padding: "16px 24px", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "13px", textTransform: "uppercase" }}>
                {shortlistError}
              </div>
            )}

            {shortlistResults && (
              <div className="shortlist-modal-body" style={{ display: "flex", flex: 1, minHeight: 0 }}>
                <div className="shortlist-left" style={{
                  width: selectedCandidateId ? "340px" : "100%",
                  minWidth: selectedCandidateId ? "280px" : 0,
                  borderRight: selectedCandidateId ? "3px solid var(--nm-ink)" : "none",
                  overflowY: "auto",
                  padding: "16px 20px",
                  flexShrink: 0,
                }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 11, fontWeight: 800, color: "var(--nm-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>
                    {shortlistResults.total} candidate{shortlistResults.total !== 1 ? 's' : ''} ranked
                  </div>

                  {shortlistResults.candidates?.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "2rem", fontFamily: "var(--font-display)", fontWeight: 900, color: "var(--nm-text-tertiary)", textTransform: "uppercase" }}>
                      No candidates found
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {shortlistResults.candidates.map((c, i) => {
                        const isSelected = selectedCandidateId === c.applicationId;
                        return (
                          <div
                            key={c.applicationId || c.cvId || i}
                            onClick={() => handleSelectCandidate(c)}
                            style={{
                              background: isSelected ? "var(--nm-primary)" : "var(--nm-surface)",
                              border: isSelected ? "3px solid var(--nm-ink)" : "3px solid var(--nm-ink)",
                              padding: "12px 14px",
                              cursor: "pointer",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: 10,
                              transition: "transform 0.15s ease, background 0.15s ease",
                              boxShadow: isSelected ? "4px 4px 0 var(--nm-ink)" : "none",
                            }}
                            onMouseEnter={(e) => {
                              if (!isSelected) {
                                e.currentTarget.style.transform = "translate(-2px, -2px)";
                                e.currentTarget.style.boxShadow = "3px 3px 0 var(--nm-ink)";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelected) {
                                e.currentTarget.style.transform = "none";
                                e.currentTarget.style.boxShadow = "none";
                              }
                            }}
                          >
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{
                                fontFamily: "var(--font-display)",
                                fontWeight: 900,
                                fontSize: 13,
                                color: isSelected ? "#fff" : "var(--nm-text-primary)",
                                textTransform: "uppercase",
                                letterSpacing: "-0.01em",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}>
                                #{c.rank} {c.profile?.name || "Unknown"}
                              </div>
                              <div style={{
                                fontFamily: "var(--font-body)",
                                fontSize: 11,
                                color: isSelected ? "rgba(255,255,255,0.7)" : "var(--nm-text-tertiary)",
                                marginTop: 2,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}>
                                {c.profile?.jobTitle || "—"}
                              </div>
                            </div>
                            <div style={{
                              fontFamily: "var(--font-display)",
                              fontWeight: 900,
                              fontSize: 18,
                              color: isSelected ? "#fff" : c.matchScore >= 80 ? "var(--nm-success)" : c.matchScore >= 60 ? "var(--nm-warning)" : "var(--nm-text-tertiary)",
                              flexShrink: 0,
                            }}>
                              {c.matchScore}%
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {selectedCandidateId && (
                  <div className="shortlist-right" style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    minHeight: 0,
                    overflow: "hidden",
                  }}>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "12px 20px",
                      borderBottom: "3px solid var(--nm-ink)",
                      flexShrink: 0,
                    }}>
                      <button
                        onClick={handleDeselectCandidate}
                        className="nm-btn"
                        style={{
                          background: "var(--nm-surface)",
                          color: "var(--nm-text-primary)",
                          padding: "6px 10px",
                          fontFamily: "var(--font-display)",
                          fontWeight: 900,
                          fontSize: 11,
                          textTransform: "uppercase",
                          border: "2px solid var(--nm-ink)",
                        }}
                      >
                        <ArrowLeft size={14} strokeWidth={3} style={{ marginRight: 4, verticalAlign: 'middle' }} /> Back
                      </button>
                      <span style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 900,
                        fontSize: 13,
                        color: "var(--nm-text-primary)",
                        textTransform: "uppercase",
                        letterSpacing: "-0.01em",
                      }}>
                        {selectedCandidate?.profile?.name || "Candidate"}
                      </span>
                      {selectedCandidate && (
                        <span style={{
                          fontFamily: "var(--font-display)",
                          fontWeight: 900,
                          fontSize: 16,
                          marginLeft: "auto",
                          color: selectedCandidate.matchScore >= 80 ? "var(--nm-success)" : "var(--nm-warning)",
                        }}>
                          {selectedCandidate.matchScore}%
                        </span>
                      )}
                    </div>

                    <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
                      {loadingDetail && (
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          height: "100%",
                          fontFamily: "var(--font-display)",
                          fontWeight: 900,
                          fontSize: 14,
                          color: "var(--nm-text-tertiary)",
                          textTransform: "uppercase",
                        }}>
                          Loading...
                        </div>
                      )}

                      {detailError && (
                        <div style={{
                          background: "var(--nm-error)",
                          color: "#fff",
                          padding: "16px",
                          margin: "16px 20px",
                          fontFamily: "var(--font-display)",
                          fontWeight: 800,
                          fontSize: "12px",
                          textTransform: "uppercase",
                        }}>
                          {detailError}
                        </div>
                      )}

                      {applicationDetail && !loadingDetail && (
                        <>
                          <div style={{ padding: "16px 20px", borderBottom: "3px solid var(--nm-ink)" }}>
                            <ApplicantDetail
                              app={applicationDetail}
                              onClose={undefined}
                              showBackButton={false}
                              showMatchScore={false}
                            />
                          </div>
                          <div style={{ padding: "16px 20px" }}>
                            <div style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: "12px",
                              paddingBottom: "8px",
                              borderBottom: "2px solid var(--nm-ink)",
                            }}>
                              <div style={{
                                fontFamily: "var(--font-display)",
                                fontSize: 11,
                                fontWeight: 900,
                                color: "var(--nm-text-tertiary)",
                                textTransform: "uppercase",
                                letterSpacing: "0.1em",
                              }}>
                                <FileText size={12} strokeWidth={3} style={{ marginRight: 4, verticalAlign: "middle" }} />
                                CV Preview
                              </div>
                            </div>
                            <ApplicationViewer application={applicationDetail} showAnalysis={false} />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
