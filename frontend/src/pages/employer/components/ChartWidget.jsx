import React, { useMemo } from 'react';
import {
   Chart as ChartJS, CategoryScale, LinearScale, BarElement,
   Title, Tooltip, Legend
 } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useTheme } from '../../../context/ThemeContext';
import { useTranslation } from '../../../context/LanguageContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function ChartWidget({ jobs = [] }) {
  const { theme } = useTheme();
  const { t, lang } = useTranslation();
  const isDark = theme === 'dark';

  const { labels, data: chartData } = useMemo(() => {
    const today = new Date();
    const thisYear = today.getFullYear();
    const startDate = new Date(thisYear, 2, 1); 

    const wLabels = [];
    const wCounts = [];
    const bins = [];

    let currentWeekStart = new Date(startDate);
    while (currentWeekStart <= today) {
      const nextWeekStart = new Date(currentWeekStart);
      nextWeekStart.setDate(nextWeekStart.getDate() + 7);
      
      const mStr = currentWeekStart.toLocaleString(lang, { month: 'short' });
      const dStr = currentWeekStart.getDate();
      wLabels.push(`${mStr} ${dStr}`);
      wCounts.push(0);
      
      bins.push({ start: new Date(currentWeekStart), end: nextWeekStart });
      
      currentWeekStart = nextWeekStart;
    }

    jobs.forEach((job) => {
      if (!job.createdAt) return;
      const jobDate = new Date(job.createdAt);
      if (jobDate < startDate) return;
      
      for (let i = 0; i < bins.length; i++) {
        if (jobDate >= bins[i].start && jobDate < bins[i].end) {
          wCounts[i]++;
          break;
        }
      }
    });

    return { labels: wLabels, data: wCounts };
  }, [jobs, lang]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'var(--nm-ink)',
        titleFont: { family: 'var(--font-display)', size: 14, weight: 800 },
        bodyFont: { family: 'var(--font-body)', size: 13, weight: 600 },
        padding: 16,
        cornerRadius: 0,
        displayColors: false,
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'var(--nm-primary)',
        borderWidth: 2,
      },
    },
    scales: {
      x: {
        grid: { color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', tickColor: 'var(--nm-ink)', tickLength: 8, tickWidth: 3 },
        ticks: { font: { family: 'var(--font-display)', size: 11, weight: 700 }, color: 'var(--nm-text-tertiary)' },
        border: { color: 'var(--nm-ink)', width: 4 },
      },
      y: {
        grid: { color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', tickLength: 0 },
        ticks: { 
          font: { family: 'var(--font-display)', size: 11, weight: 700 }, 
          color: 'var(--nm-text-tertiary)', 
          padding: 12,
          stepSize: 1,
        },
        border: { color: 'var(--nm-ink)', width: 4 },
        beginAtZero: true,
      },
    },
  };

  const data = {
    labels,
    datasets: [
      {
        label: t('employer.jobsPosted', {}, 'Jobs Posted'),
        data: chartData,
        backgroundColor: 'var(--nm-primary)',
        borderColor: 'var(--nm-ink)',
        borderWidth: 4,
        hoverBackgroundColor: 'var(--nm-warning)',
        borderRadius: 0,
      }
    ],
  };

  return (
    <div 
      className="nm-card"
      style={{
        background: 'var(--nm-surface)',
        borderWidth: '4px',
        boxShadow: '10px 10px 0 var(--nm-ink)',
        padding: '2.5rem',
        display: 'flex', 
        flexDirection: 'column', 
        gap: 20,
        minHeight: '360px',
        borderRadius: '0px',
        height: '100%',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ 
            fontFamily: 'var(--font-display)', 
            fontSize: 12, 
            fontWeight: 800,
            color: 'var(--nm-text-tertiary)', 
            textTransform: 'uppercase', 
            letterSpacing: '0.15em' 
          }}>
            {t('employer.activity', {}, 'Activity')}
          </div>
          <div style={{ 
            fontFamily: 'var(--font-display)', 
            fontWeight: 900, 
            fontSize: 28, 
            color: 'var(--nm-text-primary)', 
            letterSpacing: '-0.02em', 
            marginTop: 4,
            textTransform: 'uppercase'
          }}>
            {t('employer.jobsPostedOverTime', {}, 'Jobs Posted Over Time')}
          </div>
        </div>
        <div style={{ 
          fontFamily: 'var(--font-display)', 
          fontSize: 11, 
          background: 'var(--nm-warning)', 
          color: '#0a0a0a', 
          border: '4px solid var(--nm-ink)', 
          padding: '6px 12px', 
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          boxShadow: '3px 3px 0 var(--nm-ink)'
        }}>
          {t('employer.thisYear', {}, 'This Year')}
        </div>
      </div>
      
      <div style={{ flex: 1, position: 'relative', marginTop: 15 }}>
        <Bar options={options} data={data} />
      </div>
    </div>
  );
}
