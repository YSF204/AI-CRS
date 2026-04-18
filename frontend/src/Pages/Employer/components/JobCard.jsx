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

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${job.position}"?`)) return;
    setDeleting(true);
    try {
      await api.delete(`/jobs/${job._id}`);
      onDelete(job._id);
    } catch {
      setDeleting(false);
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
      alert('Failed to update job status.');
    } finally {
      setToggling(false);
    }
  };

  return (
    <div style={{
      background: 'var(--card-bg)',
      border: '3px solid var(--border-color)',
      boxShadow: '6px 6px 0 var(--shadow-color)',
      padding: '1.45rem 1.6rem',
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 19, color: 'var(--fg)', lineHeight: 1.2 }}>
            {job.position}
          </div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: 'var(--fg-muted)', marginTop: 5 }}>
            {ago(job.createdAt)}
          </div>
        </div>
        <div style={{
          background: currentStatus === 'OPEN' ? '#4ECDC4' : '#999',
          border: '2px solid #0a0a0a', padding: '5px 10px',
          fontFamily: "'DM Mono', monospace", fontSize: 11, fontWeight: 800,
          textTransform: 'uppercase', color: '#0a0a0a', flexShrink: 0,
        }}>
          {currentStatus}
        </div>
      </div>

      {/* Meta row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 14px' }}>
        {job.salary != null && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, fontFamily: "'DM Mono', monospace", color: 'var(--fg)', fontWeight: 700 }}>
            <DollarSign size={13} />{fmt(job.salary)}
          </span>
        )}
        {job.workSite && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, fontFamily: "'DM Mono', monospace", color: 'var(--fg)', fontWeight: 700 }}>
            <Wifi size={13} />{job.workSite}
          </span>
        )}
        {job.workDuration && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, fontFamily: "'DM Mono', monospace", color: 'var(--fg)', fontWeight: 700 }}>
            <Clock size={13} />{job.workDuration}
          </span>
        )}
        {job.yearsOfExperience != null && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, fontFamily: "'DM Mono', monospace", color: 'var(--fg)', fontWeight: 700 }}>
            <Briefcase size={13} />{job.yearsOfExperience}yr exp
          </span>
        )}
      </div>

      {/* Skill pills */}
      {job.technicalSkills?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {job.technicalSkills.slice(0, 4).map((s, i) => (
            <span key={i} style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, padding: '4px 9px', border: '1.5px solid var(--border-color)', color: 'var(--fg)', fontWeight: 700, background: 'var(--bg)', textTransform: 'uppercase' }}>
              {s}
            </span>
          ))}
          {job.technicalSkills.length > 4 && (
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, padding: '4px 9px', color: 'var(--fg)', fontWeight: 700 }}>
              +{job.technicalSkills.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 'auto' }}>
        <button
          onClick={handleToggleStatus}
          disabled={toggling}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '8px 13px', fontFamily: "'DM Mono', monospace", fontSize: 11,
            fontWeight: 700, textTransform: 'uppercase',
            background: currentStatus === 'OPEN' ? '#FFE630' : '#4ECDC4', color: '#0a0a0a',
            border: '2px solid #0a0a0a', cursor: toggling ? 'not-allowed' : 'pointer',
          }}
        >
          <Power size={13} /> {toggling ? 'WAIT...' : currentStatus === 'OPEN' ? 'CLOSE' : 'OPEN'}
        </button>

        <Link
          to={`/employer/edit-job/${job._id}`}
          style={{
            display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none',
            padding: '8px 13px', fontFamily: "'DM Mono', monospace", fontSize: 11,
            fontWeight: 700, textTransform: 'uppercase',
            background: '#fff', color: '#0a0a0a',
            border: '2px solid #0a0a0a', cursor: 'pointer',
          }}
        >
          <Edit size={13} /> EDIT
        </Link>
        <button
          onClick={() => onViewCandidates && onViewCandidates(job._id)}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '8px 13px', fontFamily: "'DM Mono', monospace", fontSize: 11,
            fontWeight: 700, textTransform: 'uppercase',
            background: '#E0E7FF', color: '#0a0a0a',
            border: '2px solid #0a0a0a', cursor: 'pointer',
          }}
        >
          <Users size={13} /> View Candidates
        </button>
        
        <button
          onClick={handleDelete}
          disabled={deleting}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '8px 13px', fontFamily: "'DM Mono', monospace", fontSize: 11,
            fontWeight: 700, textTransform: 'uppercase',
            background: deleting ? '#ccc' : '#FF6B6B', color: '#0a0a0a',
            border: '2px solid #0a0a0a', cursor: deleting ? 'not-allowed' : 'pointer',
          }}
        >
          <Trash2 size={13} /> {deleting ? 'DELETING...' : 'DELETE'}
        </button>
      </div>
    </div>
  );
}
