import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, DollarSign, Wifi, Clock, Briefcase, Power, Edit, Users } from 'lucide-react';
import api from '../../../services/api';

const fmt = (n) => (n == null ? '—' : n.toLocaleString());
const ago = (d) => {
  const days = Math.floor((Date.now() - new Date(d)) / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
};

/**
 * JobCard
 * Displays one job posting. Handles its own delete action and reports
 * the deleted ID back to the parent via onDelete(id).
 */
export default function JobCard({ job, onDelete, onUpdate, onViewCandidates }) {
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(job.status);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

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
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ 
            fontFamily: 'var(--font-display)', 
            fontWeight: 900, 
            fontSize: 22, 
            color: 'var(--nm-text-primary)', 
            lineHeight: 1.1,
            textTransform: 'uppercase',
            letterSpacing: '-0.02em'
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

      {/* Meta row */}
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

      {/* Skill pills */}
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

      {/* Actions */}
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

        <button
          onClick={() => onViewCandidates && onViewCandidates(job._id)}
          className="nm-btn"
          style={{
            width: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            padding: '14px', fontFamily: 'var(--font-display)', fontSize: 13,
            fontWeight: 900, textTransform: 'uppercase',
            background: 'var(--nm-primary)', color: '#fff',
            marginTop: 4
          }}
        >
          <Users size={18} strokeWidth={3} /> Intelligence Scan
        </button>
        
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
          <Trash2 size={18} strokeWidth={3} /> {deleting ? 'PURGING...' : 'PURGE LISTING'}
        </button>
      </div>
    </div>
    
    {/* Confirmation Modal */}
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
              Purge
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
