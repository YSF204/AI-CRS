import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, DollarSign, Wifi, Clock, Briefcase, Power, Edit } from 'lucide-react';
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
export default function JobCard({ job, onDelete, onUpdate }) {
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
      boxShadow: '4px 4px 0 var(--shadow-color)',
      padding: '1.1rem 1.3rem',
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 15, color: 'var(--fg)', lineHeight: 1.2 }}>
            {job.position}
          </div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: 'var(--fg-muted)', marginTop: 3 }}>
            {ago(job.createdAt)}
          </div>
        </div>
        <div style={{
          background: currentStatus === 'OPEN' ? '#4ECDC4' : '#999',
          border: '2px solid #0a0a0a', padding: '2px 8px',
          fontFamily: "'DM Mono', monospace", fontSize: 9, fontWeight: 700,
          textTransform: 'uppercase', color: '#0a0a0a', flexShrink: 0,
        }}>
          {currentStatus}
        </div>
      </div>

      {/* Meta row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 12px' }}>
        {job.salary != null && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontFamily: "'DM Mono', monospace", color: 'var(--fg-muted)' }}>
            <DollarSign size={11} />{fmt(job.salary)}
          </span>
        )}
        {job.workSite && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontFamily: "'DM Mono', monospace", color: 'var(--fg-muted)' }}>
            <Wifi size={11} />{job.workSite}
          </span>
        )}
        {job.workDuration && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontFamily: "'DM Mono', monospace", color: 'var(--fg-muted)' }}>
            <Clock size={11} />{job.workDuration}
          </span>
        )}
        {job.yearsOfExperience != null && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontFamily: "'DM Mono', monospace", color: 'var(--fg-muted)' }}>
            <Briefcase size={11} />{job.yearsOfExperience}yr exp
          </span>
        )}
      </div>

      {/* Skill pills */}
      {job.technicalSkills?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {job.technicalSkills.slice(0, 4).map((s, i) => (
            <span key={i} style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, padding: '2px 7px', border: '1.5px solid var(--border-color)', color: 'var(--fg-muted)', textTransform: 'uppercase' }}>
              {s}
            </span>
          ))}
          {job.technicalSkills.length > 4 && (
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, padding: '2px 7px', color: 'var(--fg-muted)' }}>
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
            padding: '5px 10px', fontFamily: "'DM Mono', monospace", fontSize: 10,
            fontWeight: 700, textTransform: 'uppercase',
            background: currentStatus === 'OPEN' ? '#FFE630' : '#4ECDC4', color: '#0a0a0a',
            border: '2px solid #0a0a0a', cursor: toggling ? 'not-allowed' : 'pointer',
          }}
        >
          <Power size={11} /> {toggling ? 'WAIT...' : currentStatus === 'OPEN' ? 'CLOSE' : 'OPEN'}
        </button>

        <Link
          to={`/employer/edit-job/${job._id}`}
          style={{
            display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none',
            padding: '5px 10px', fontFamily: "'DM Mono', monospace", fontSize: 10,
            fontWeight: 700, textTransform: 'uppercase',
            background: '#fff', color: '#0a0a0a',
            border: '2px solid #0a0a0a', cursor: 'pointer',
          }}
        >
          <Edit size={11} /> EDIT
        </Link>
        
        <button
          onClick={handleDelete}
          disabled={deleting}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '5px 10px', fontFamily: "'DM Mono', monospace", fontSize: 10,
            fontWeight: 700, textTransform: 'uppercase',
            background: deleting ? '#ccc' : '#FF6B6B', color: '#0a0a0a',
            border: '2px solid #0a0a0a', cursor: deleting ? 'not-allowed' : 'pointer',
          }}
        >
          <Trash2 size={11} /> {deleting ? 'DELETING...' : 'DELETE'}
        </button>
      </div>
    </div>
  );
}
