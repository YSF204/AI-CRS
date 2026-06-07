import { Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';
import JobCard from './JobCard';
import { SkCard, SkBox, SkText } from '../../../components/ui/Skeleton';
import { useTranslation } from '../../../context/LanguageContext';


export default function JobsGrid({ jobs, loading, onPostJob, onJobDeleted, onJobUpdated, onViewCandidates, viewAllLink, totalJobsCount }) {
  const { t } = useTranslation();

  return (
    <div style={{ gridColumn: 'span 12' }}>
      {/* Section heading */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ 
          fontFamily: 'var(--font-display)', 
          fontWeight: 800, 
          fontSize: 22, 
          color: 'var(--nm-text-primary)', 
          textTransform: 'uppercase', 
          letterSpacing: '-0.01em',
          margin: 0
        }}>
          {t('employer.activeListings', {}, 'Active Listings')}
        </h2>
        <span style={{ 
          fontFamily: 'var(--font-display)', 
          fontSize: 14, 
          fontWeight: 800,
          color: 'var(--nm-text-tertiary)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          {loading ? t('employer.syncing', {}, 'SYNCING...') : t('employer.unitsCount', { count: jobs.length }, `${jobs.length} UNIT${jobs.length !== 1 ? 'S' : ''}`)}
        </span>
      </div>

      {/* States */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 400px), 1fr))', gap: '1.5rem' }}>
          {[1, 2].map((i) => (
            <SkCard key={i} style={{ padding: '2rem', gap: 'var(--spacing-4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                  <SkBox w="70%" h={22} />
                  <div style={{ marginTop: 'var(--spacing-2)' }}><SkBox w="30%" h={12} /></div>
                </div>
                <SkBox w={64} h={28} />
              </div>
              <SkBox w="100%" h={36} />
              <SkText lines={1} />
            </SkCard>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div 
          className="nm-card"
          style={{ 
            background: 'var(--nm-surface)', 
            border: '4px dashed var(--nm-ink)', 
            padding: '5rem 2rem', 
            textAlign: 'center',
            borderRadius: '0px',
            boxShadow: '8px 8px 0 var(--nm-ink)'
          }}
        >
          <Briefcase size={48} strokeWidth={2.5} style={{ color: 'var(--nm-text-tertiary)', margin: '0 auto 20px' }} />
          <div style={{ 
            fontFamily: 'var(--font-display)', 
            fontWeight: 900, 
            fontSize: 24, 
            color: 'var(--nm-text-primary)', 
            marginBottom: 10,
            textTransform: 'uppercase'
          }}>
            {t('employer.zeroActiveNodes', {}, 'Zero Active Nodes')}
          </div>
          <div style={{ 
            fontFamily: 'var(--font-body)', 
            fontSize: 15, 
            color: 'var(--nm-text-secondary)', 
            marginBottom: 32,
            fontWeight: 500
          }}>
            {t('employer.initiateDeployment', {}, 'Initiate your first deployment to start intelligence matching.')}
          </div>
          <button
            onClick={onPostJob}
            className="nm-btn"
            style={{ 
              padding: '16px 32px', 
              background: 'var(--nm-primary)', 
              color: '#fff', 
              fontFamily: 'var(--font-display)', 
              fontWeight: 900, 
              fontSize: 14, 
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            }}
          >
            {t('employer.createListing', {}, 'Create Listing')} →
          </button>
        </div>
      ) : (
        <div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 400px), 1fr))', 
            gap: '1.5rem' 
          }}>
            {jobs.map((job) => (
              <JobCard
                key={job._id}
                job={job}
                onDelete={onJobDeleted}
                onUpdate={onJobUpdated}
                onViewCandidates={onViewCandidates}
              />
            ))}
          </div>

          {viewAllLink && totalJobsCount > 6 && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 48 }}>
              <Link
                to="/employer/jobs"
                className="nm-btn"
                style={{
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: 12,
                  padding: '16px 32px', 
                  background: 'var(--nm-surface)', 
                  color: 'var(--nm-text-primary)',
                  fontFamily: 'var(--font-display)', 
                  fontWeight: 900, 
                  fontSize: 14,
                  textTransform: 'uppercase', 
                  textDecoration: 'none',
                  letterSpacing: '0.1em'
                }}
              >
                {t('employer.accessArchive', { count: totalJobsCount }, `Access Archive (${totalJobsCount} Units)`)} →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
