import { Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';
import JobCard from './JobCard';

/**
 * JobsGrid
 * Renders the full jobs section: heading, loading/empty states, and the grid of JobCards.
 * Receives jobs array and callbacks from the parent.
 */
export default function JobsGrid({ jobs, loading, onPostJob, onJobDeleted, onJobUpdated, viewAllLink, totalJobsCount }) {
  return (
    <div style={{ gridColumn: 'span 12' }}>
      {/* Section heading */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 16, color: 'var(--fg)', textTransform: 'uppercase', letterSpacing: '-0.01em' }}>
          Your Job Listings
        </h2>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: 'var(--fg-muted)' }}>
          {loading ? '...' : `${jobs.length} total`}
        </span>
      </div>

      {/* States */}
      {loading ? (
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: 'var(--fg-muted)', padding: '2rem 0' }}>
          Loading jobs...
        </div>
      ) : jobs.length === 0 ? (
        <div style={{ background: 'var(--card-bg)', border: '3px dashed var(--border-color)', padding: '3rem', textAlign: 'center' }}>
          <Briefcase size={36} style={{ color: 'var(--fg-muted)', margin: '0 auto 12px' }} />
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16, color: 'var(--fg)', marginBottom: 8 }}>
            No jobs posted yet
          </div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: 'var(--fg-muted)', marginBottom: 16 }}>
            Post your first job to start finding talent.
          </div>
          <button
            onClick={onPostJob}
            style={{ padding: '10px 20px', background: '#FFE630', color: '#0a0a0a', border: '3px solid #0a0a0a', boxShadow: '3px 3px 0 #0a0a0a', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 13, cursor: 'pointer', textTransform: 'uppercase' }}
          >
            Post a Job →
          </button>
        </div>
      ) : (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'clamp(0.75rem, 2%, 1.25rem)' }}>
            {jobs.map((job) => (
              <JobCard key={job._id} job={job} onDelete={onJobDeleted} onUpdate={onJobUpdated} />
            ))}
          </div>

          {viewAllLink && totalJobsCount > 6 && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
              <Link
                to="/employer/jobs"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '12px 24px', background: '#fff', color: '#0a0a0a',
                  border: '3px solid #0a0a0a', boxShadow: '4px 4px 0 #0a0a0a',
                  fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 13,
                  textTransform: 'uppercase', textDecoration: 'none',
                  transition: 'transform 0.1s ease, box-shadow 0.1s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = '2px 2px 0 #0a0a0a'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '4px 4px 0 #0a0a0a'; }}
              >
                View All {totalJobsCount} Listings →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
