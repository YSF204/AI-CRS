import React, { useMemo } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

/**
 * ChartWidget
 * A brutalist-styled bar chart displaying real job postings over the last 6 months.
 */
export default function ChartWidget({ jobs = [] }) {
  // Process the real jobs data
  const { labels, data: chartData } = useMemo(() => {
    const today = new Date();
    const thisYear = today.getFullYear();
    // Start from March 1st of the current year
    const startDate = new Date(thisYear, 2, 1); 

    const wLabels = [];
    const wCounts = [];
    const bins = [];

    // Generate weekly bins from March 1st up to today
    let currentWeekStart = new Date(startDate);
    while (currentWeekStart <= today) {
      const nextWeekStart = new Date(currentWeekStart);
      nextWeekStart.setDate(nextWeekStart.getDate() + 7);
      
      const mStr = currentWeekStart.toLocaleString('default', { month: 'short' });
      const dStr = currentWeekStart.getDate();
      wLabels.push(`${mStr} ${dStr}`);
      wCounts.push(0);
      
      bins.push({ start: new Date(currentWeekStart), end: nextWeekStart });
      
      currentWeekStart = nextWeekStart;
    }

    // Tally up jobs into their respective weekly bins
    jobs.forEach((job) => {
      if (!job.createdAt) return;
      const jobDate = new Date(job.createdAt);
      if (jobDate < startDate) return; // ignore anything before March
      
      for (let i = 0; i < bins.length; i++) {
        if (jobDate >= bins[i].start && jobDate < bins[i].end) {
          wCounts[i]++;
          break;
        }
      }
    });

    return { labels: wLabels, data: wCounts };
  }, [jobs]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }, // Only one dataset, no legend needed
      tooltip: {
        backgroundColor: '#0a0a0a',
        titleFont: { family: "'Space Grotesk', sans-serif", size: 14 },
        bodyFont: { family: "'DM Mono', monospace", size: 13 },
        padding: 12,
        cornerRadius: 0,
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(0,0,0,0.1)', tickColor: '#0a0a0a', tickLength: 6 },
        ticks: { font: { family: "'DM Mono', monospace", size: 11 }, color: '#0a0a0a' },
        border: { color: '#0a0a0a', width: 3 },
      },
      y: {
        grid: { color: 'rgba(0,0,0,0.1)', tickLength: 0 },
        ticks: { 
          font: { family: "'DM Mono', monospace", size: 11 }, 
          color: '#0a0a0a', 
          padding: 10,
          stepSize: 1, // Jobs are integers
        },
        border: { color: '#0a0a0a', width: 3 },
        beginAtZero: true,
      },
    },
  };

  const data = {
    labels,
    datasets: [
      {
        label: 'Jobs Posted',
        data: chartData,
        backgroundColor: '#4ECDC4',
        borderColor: '#0a0a0a',
        borderWidth: 3,
        hoverBackgroundColor: '#FFE630',
      }
    ],
  };

  return (
    <div style={{
      gridColumn: 'span 8',
      background: 'var(--card-bg)',
      border: '4px solid var(--border-color)',
      boxShadow: '6px 6px 0 var(--shadow-color)',
      padding: '1.5rem',
      display: 'flex', flexDirection: 'column', gap: 16,
      minHeight: '380px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Analytics Overview
          </div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 20, color: 'var(--fg)', letterSpacing: '-0.02em', marginTop: 4 }}>
            Job Postings
          </div>
        </div>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, background: '#4ECDC4', color: '#0a0a0a', border: '2px solid #0a0a0a', padding: '4px 8px', fontWeight: 'bold' }}>
          WEEKLY SINCE MARCH
        </div>
      </div>
      
      <div style={{ flex: 1, position: 'relative', marginTop: 10 }}>
        <Bar options={options} data={data} />
      </div>
    </div>
  );
}
