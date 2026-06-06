import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import DashboardNav from '../../../components/shared/DashboardNav';
import useAdminDashboard from './hooks/useAdminDashboard';
import StatCard from './components/StatCard';
import ChartPanel from './components/ChartPanel';
import PendingEmployersQueue from './components/PendingEmployersQueue';
import { SkStatCard, SkCard } from '../../../components/ui/Skeleton';
import { useTranslation } from '../../../context/LanguageContext';

export default function AdminDash() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    stats, loading, error, palette, summaryCards,
    volumeChartData, healthChartData, trendChartData,
    volumeChartOptions, healthChartOptions, trendChartOptions,
    EMPTY_BAR_DATA, EMPTY_DOUGHNUT_DATA, EMPTY_LINE_DATA,
    pendingEmployers,
  } = useAdminDashboard();

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--nm-bg)',
      color: 'var(--nm-text-primary)',
      fontFamily: 'var(--font-body)'
    }}>
      <div className="dashboard-nav-area">
        <DashboardNav role="admin" />
      </div>

      <div className="dashboard-shell">
        <div style={{ display: 'grid', gap: 'var(--spacing-8)' }}>
          <div style={{
            display: 'grid',
            gap: 'var(--spacing-6)',
            gridTemplateColumns: 'repeat(1, minmax(0, 1fr))'
          }}>
            <style>{`@media (min-width: 1280px) { .admin-hero-grid { grid-template-columns: 1.3fr 0.7fr; } }`}</style>

          </div>

          {loading ? (
            <div style={{
              display: 'grid',
              gap: 'var(--spacing-6)',
              gridTemplateColumns: 'repeat(1, minmax(0, 1fr))'
            }}>
              <div className="cards-grid" style={{ display: 'grid', gap: 'var(--spacing-5)' }}>
                <style>{`@media (min-width: 768px) { .cards-grid { grid-template-columns: repeat(2, 1fr); } } @media (min-width: 1280px) { .cards-grid { grid-template-columns: repeat(4, 1fr); } }`}</style>
                {[1, 2, 3, 4].map((i) => <SkStatCard key={i} />)}
              </div>
              <div className="charts-grid" style={{ display: 'grid', gap: 'var(--spacing-6)' }}>
                <style>{`@media (min-width: 1280px) { .charts-grid { grid-template-columns: 1.5fr 0.9fr; } }`}</style>
                <SkCard style={{ height: 400 }} />
                <SkCard style={{ height: 400 }} />
              </div>
            </div>
          ) : error ? (
            <div className="nm-card" style={{
              background: 'var(--nm-surface)',
              padding: 'var(--spacing-8)'
            }}>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-2xl)',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                textTransform: 'uppercase',
                margin: '0 0 var(--spacing-4) 0',
                color: 'var(--nm-text-primary)'
              }}>
                {t('admin.analyticsUnavailable')}
              </h2>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                color: 'var(--nm-text-secondary)',
                margin: 0,
                maxWidth: '60ch'
              }}>
                {error}
              </p>
            </div>
          ) : (
            <>
              <div style={{
                display: 'grid',
                gap: 'var(--spacing-5)',
                gridTemplateColumns: 'repeat(1, minmax(0, 1fr))'
              }}>
                <style>{`@media (min-width: 768px) { .cards-grid { grid-template-columns: repeat(2, 1fr); } } @media (min-width: 1280px) { .cards-grid { grid-template-columns: repeat(4, 1fr); } }`}</style>
                <div className="cards-grid" style={{ display: 'grid', gap: 'var(--spacing-5)' }}>
                  {summaryCards.map((card) => (
                    <StatCard key={card.label} {...card} />
                  ))}
                </div>
              </div>

              <div style={{
                display: 'grid',
                gap: 'var(--spacing-6)',
                gridTemplateColumns: 'repeat(1, minmax(0, 1fr))'
              }}>
                <style>{`@media (min-width: 1280px) { .charts-grid { grid-template-columns: 1.5fr 0.9fr; } }`}</style>
                <div className="charts-grid" style={{ display: 'grid', gap: 'var(--spacing-6)' }}>
                  <ChartPanel
                    eyebrow={t('admin.platformVolumes')}
                    title={t('admin.coreCounts')}
                    note={t('admin.dbTotals')}
                  >
                    <div style={{ height: '360px' }}>
                      <Bar data={volumeChartData ?? EMPTY_BAR_DATA} options={volumeChartOptions} />
                    </div>
                  </ChartPanel>

                  <ChartPanel
                    eyebrow={t('admin.accountHealth')}
                    title={t('admin.statusDistribution')}
                    note={t('admin.statusNote')}
                  >
                    <div style={{ height: '360px' }}>
                      <Doughnut data={healthChartData ?? EMPTY_DOUGHNUT_DATA} options={healthChartOptions} />
                    </div>
                  </ChartPanel>
                </div>

                {/* Trend Chart */}
                <ChartPanel
                  eyebrow={t('admin.growthTrends')}
                  title={t('admin.recentActivity')}
                  note={t('admin.activityNote')}
                  style={{ gridColumn: '1 / -1' }}
                >
                  <div style={{ height: '360px' }}>
                    <Line data={trendChartData ?? EMPTY_LINE_DATA} options={trendChartOptions} />
                  </div>
                </ChartPanel>

                {/* Pending Employers Queue */}
                <PendingEmployersQueue
                  pendingEmployers={pendingEmployers}
                  palette={palette}
                  navigate={navigate}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
