import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  BriefcaseBusiness,
  FileText,
  ShieldCheck,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import DashboardNav from "../../components/shared/DashboardNav";
import CountUp from "../../components/UI/CountUp";
import { useTheme } from "../../context/ThemeContext";
import api from "../../services/api";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  LineElement,
  PointElement,
  Legend,
);

const EMPTY_BAR_DATA = { labels: [], datasets: [] };
const EMPTY_DOUGHNUT_DATA = { labels: [], datasets: [] };
const EMPTY_LINE_DATA = { labels: [], datasets: [] };

function StatCard({ icon: Icon, label, value, tone, detail }) {
  return (
    <div
      className="nm-card"
      style={{
        background: tone.surface,
        color: tone.text,
        padding: 'var(--spacing-5)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--spacing-4)' }}>
        <div>
          <div style={{
            fontFamily: 'var(--font-body)',
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            opacity: 0.7,
            marginBottom: 'var(--spacing-3)'
          }}>
            {label}
          </div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-4xl)',
            fontWeight: 700,
            lineHeight: 1,
            marginBottom: 'var(--spacing-3)',
            letterSpacing: '-0.02em',
            textTransform: 'uppercase'
          }}>
            <CountUp to={Number(value || 0)} />
          </div>
          <div style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            opacity: 0.8
          }}>
            {detail}
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            height: '48px',
            width: '48px',
            alignItems: 'center',
            justifyContent: 'center',
            border: `4px solid ${tone.text}`,
            background: tone.badge,
            boxShadow: `4px 4px 0 ${tone.text}`,
            borderRadius: '0px',
            flexShrink: 0
          }}
        >
          <Icon size={22} strokeWidth={2.5} color="#1b1c15" />
        </div>
      </div>
    </div>
  );
}

function ChartPanel({ title, eyebrow, children, note }) {
  return (
    <div className="nm-card" style={{ background: 'var(--nm-surface)', padding: 'var(--spacing-6)' }}>
      <div style={{
        marginBottom: 'var(--spacing-5)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-3)'
      }}>
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: 'var(--font-body)',
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            color: 'var(--nm-text-secondary)',
            marginBottom: 'var(--spacing-2)'
          }}>
            {eyebrow}
          </div>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-2xl)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
            margin: 0,
            color: 'var(--nm-text-primary)'
          }}>
            {title}
          </h2>
        </div>
        <div style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-sm)',
          color: 'var(--nm-text-secondary)'
        }}>
          {note}
        </div>
      </div>
      {children}
    </div>
  );
}

export default function AdminDash() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [stats, setStats] = useState(() => {
    if (typeof window === "undefined") return null;
    try {
      const cached = window.sessionStorage.getItem("admin-dashboard-stats");
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [trends, setTrends] = useState(() => {
    if (typeof window === "undefined") return null;
    try {
      const cached = window.sessionStorage.getItem("admin-dashboard-trends");
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [pendingEmployers, setPendingEmployers] = useState(() => {
    if (typeof window === "undefined") return null;
    try {
      const cached = window.sessionStorage.getItem("admin-dashboard-pending-employers");
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(() => {
    if (typeof window === "undefined") return true;
    return !window.sessionStorage.getItem("admin-dashboard-stats");
  });
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(() => {
    if (typeof window === "undefined") return null;
    const cached = window.sessionStorage.getItem("admin-dashboard-updated-at");
    return cached ? cached : null;
  });
  const statsRef = useRef(stats);

  useEffect(() => {
    statsRef.current = stats;
  }, [stats]);

  useEffect(() => {
    let cancelled = false;

    async function loadStats({ silent = false } = {}) {
      if (!silent && !stats) {
        setLoading(true);
      }

      try {
        const res = await api.get("/admin/stats");
        if (!cancelled) {
          setStats(res.data.data);
          const nextUpdatedAt = new Date().toISOString();
          setLastUpdated(nextUpdatedAt);
          window.sessionStorage.setItem(
            "admin-dashboard-stats",
            JSON.stringify(res.data.data),
          );
          window.sessionStorage.setItem(
            "admin-dashboard-updated-at",
            nextUpdatedAt,
          );
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          setError((current) => {
            if (statsRef.current) return current;
            return err.response?.data?.message || "Unable to load live admin analytics.";
          });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    async function loadTrends({ silent = false } = {}) {
      try {
        const res = await api.get("/admin/stats/trends");
        if (!cancelled) {
          setTrends(res.data.data);
          window.sessionStorage.setItem(
            "admin-dashboard-trends",
            JSON.stringify(res.data.data),
          );
        }
      } catch (err) {
        if (!silent && !cancelled) {
          console.error("Failed to load trends:", err);
        }
      }
    }

    async function loadPendingEmployers({ silent = false } = {}) {
      try {
        const res = await api.get("/admin/users/pending-employers?limit=5");
        if (!cancelled) {
          setPendingEmployers(res.data.data);
          window.sessionStorage.setItem(
            "admin-dashboard-pending-employers",
            JSON.stringify(res.data.data),
          );
        }
      } catch (err) {
        if (!silent && !cancelled) {
          console.error("Failed to load pending employers:", err);
        }
      }
    }

    loadStats();
    loadTrends();
    loadPendingEmployers();

    const intervalId = window.setInterval(() => {
      loadStats({ silent: true });
      loadTrends({ silent: true });
      loadPendingEmployers({ silent: true });
    }, 15000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  const palette = useMemo(() => {
    const isDark = theme === "dark";

    return {
      text: isDark ? "#e8eaed" : "#1b1c15",
      mutedText: isDark ? "#b0b5bc" : "#6b6963",
      grid: isDark ? "rgba(232,234,237,0.12)" : "rgba(27,28,21,0.12)",
      border: isDark ? "#4a515d" : "#1b1c15",
      tooltipBg: isDark ? "#e8eaed" : "#1b1c15",
      tooltipText: isDark ? "#1b1c15" : "#e8eaed",
      blue900: isDark ? "#4d7bff" : "#0033cc",
      blue700: isDark ? "#7aa2ff" : "#0055ff",
      blue500: isDark ? "#a6c8ff" : "#3388ff",
      blue300: isDark ? "#82aaff" : "#80b3ff",
      blue100: isDark ? "rgba(77, 123, 255, 0.35)" : "#cce0ff",
      blue50: isDark ? "rgba(77, 123, 255, 0.2)" : "#e6f0ff",
      panel: isDark ? "#3a414b" : "#ffffff",
    };
  }, [theme]);

  const summaryCards = useMemo(() => {
    if (!stats) return [];

    return [
      {
        label: "Total Users",
        value: stats.users.total,
        detail: `${stats.users.recentRegistrations} joined in the last 7 days`,
        icon: Users,
        tone: {
          surface: palette.blue100,
          badge: palette.blue300,
          text: palette.text,
        },
      },
      {
        label: "Open Jobs",
        value: stats.jobs.open,
        detail: `${stats.jobs.recentlyPosted} posted in the last 7 days`,
        icon: BriefcaseBusiness,
        tone: {
          surface: palette.blue50,
          badge: palette.blue100,
          text: palette.text,
        },
      },
      {
        label: "Stored CVs",
        value: stats.cvs.total,
        detail: "Live resumes currently available in the system",
        icon: FileText,
        tone: {
          surface: palette.blue100,
          badge: palette.blue300,
          text: palette.text,
        },
      },
      {
        label: "Employer Profiles",
        value: stats.employers.total,
        detail: `${stats.users.pendingApproval} employer approvals are still pending`,
        icon: ShieldCheck,
        tone: {
          surface: palette.blue50,
          badge: palette.blue100,
          text: palette.text,
        },
      },
    ];
  }, [palette, stats]);

  const volumeChartData = useMemo(() => {
    if (!stats) return null;

    return {
      labels: [
        "Users",
        "Employees",
        "Employers",
        "Admins",
        "CVs",
        "Jobs",
        "Open Jobs",
      ],
      datasets: [
        {
          label: "System totals",
          data: [
            stats.users.total,
            stats.users.employees,
            stats.users.employers,
            stats.users.admins,
            stats.cvs.total,
            stats.jobs.total,
            stats.jobs.open,
          ],
          backgroundColor: [
            palette.blue900,
            palette.blue700,
            palette.blue500,
            palette.blue300,
            palette.blue100,
            palette.blue50,
            palette.blue900,
          ],
          borderColor: palette.text,
          borderWidth: 4,
          borderRadius: 0,
          borderSkipped: false,
          maxBarThickness: 52,
        },
      ],
    };
  }, [palette, stats]);

  const healthChartData = useMemo(() => {
    if (!stats) return null;

    return {
      labels: ["Active", "Inactive", "Pending Approval"],
      datasets: [
        {
          label: "Accounts",
          data: [
            stats.users.active,
            stats.users.inactive,
            stats.users.pendingApproval,
          ],
          backgroundColor: [palette.blue700, palette.blue300, palette.blue50],
          borderColor: palette.text,
          borderWidth: 4,
          hoverOffset: 6,
        },
      ],
    };
  }, [palette, stats]);

  const trendChartData = useMemo(() => {
    if (!trends) return null;

    return {
      labels: ["Users", "Employees", "Employers", "CVs", "Jobs", "Open Jobs"],
      datasets: [
        {
          label: "7 Days",
          data: [
            trends.sevenDays.users,
            trends.sevenDays.employees,
            trends.sevenDays.employers,
            trends.sevenDays.cvs,
            trends.sevenDays.jobs,
            trends.sevenDays.openJobs,
          ],
          borderColor: palette.blue700,
          backgroundColor: "transparent",
          borderWidth: 4,
          tension: 0,
          pointBackgroundColor: palette.blue700,
          pointBorderColor: palette.border,
          pointBorderWidth: 3,
          pointRadius: 6,
          pointHoverRadius: 8,
        },
        {
          label: "30 Days",
          data: [
            trends.thirtyDays.users,
            trends.thirtyDays.employees,
            trends.thirtyDays.employers,
            trends.thirtyDays.cvs,
            trends.thirtyDays.jobs,
            trends.thirtyDays.openJobs,
          ],
          borderColor: palette.blue300,
          backgroundColor: "transparent",
          borderWidth: 4,
          tension: 0,
          pointBackgroundColor: palette.blue300,
          pointBorderColor: palette.border,
          pointBorderWidth: 3,
          pointRadius: 6,
          pointHoverRadius: 8,
        },
      ],
    };
  }, [palette, trends]);

  const volumeChartOptions = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: palette.tooltipBg,
          titleColor: palette.tooltipText,
          bodyColor: palette.tooltipText,
          borderColor: palette.border,
          borderWidth: 4,
          cornerRadius: 0,
          padding: 12,
          titleFont: { family: "'Space Grotesk', sans-serif", weight: "700", size: 14 },
          bodyFont: { family: "'Manrope', sans-serif", size: 12 },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: palette.text,
            font: { family: "'Manrope', sans-serif", size: 11, weight: 600 },
          },
          border: { color: palette.border, width: 4 },
        },
        y: {
          beginAtZero: true,
          grid: { color: palette.grid, drawBorder: false },
          ticks: {
            color: palette.mutedText,
            font: { family: "'Manrope', sans-serif", size: 11, weight: 500 },
          },
          border: { display: false },
        },
      },
    };
  }, [palette]);

  const healthChartOptions = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "58%",
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: palette.text,
            boxWidth: 16,
            boxHeight: 16,
            usePointStyle: false,
            padding: 18,
            font: { family: "'Manrope', sans-serif", size: 12, weight: 600 },
            borderRadius: 0,
          },
        },
        tooltip: {
          backgroundColor: palette.tooltipBg,
          titleColor: palette.tooltipText,
          bodyColor: palette.tooltipText,
          borderColor: palette.border,
          borderWidth: 4,
          cornerRadius: 0,
          padding: 12,
          titleFont: { family: "'Space Grotesk', sans-serif", weight: "700", size: 14 },
          bodyFont: { family: "'Manrope', sans-serif", size: 12 },
        },
      },
    };
  }, [palette]);

  const trendChartOptions = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: palette.text,
            boxWidth: 16,
            boxHeight: 16,
            usePointStyle: false,
            padding: 18,
            font: { family: "'Manrope', sans-serif", size: 12, weight: 600 },
            borderRadius: 0,
          },
        },
        tooltip: {
          backgroundColor: palette.tooltipBg,
          titleColor: palette.tooltipText,
          bodyColor: palette.tooltipText,
          borderColor: palette.border,
          borderWidth: 4,
          cornerRadius: 0,
          padding: 12,
          titleFont: { family: "'Space Grotesk', sans-serif", weight: "700", size: 14 },
          bodyFont: { family: "'Manrope', sans-serif", size: 12 },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: palette.text,
            font: { family: "'Manrope', sans-serif", size: 11, weight: 600 },
          },
          border: { color: palette.border, width: 4 },
        },
        y: {
          beginAtZero: true,
          grid: { color: palette.grid, drawBorder: false },
          ticks: {
            color: palette.mutedText,
            font: { family: "'Manrope', sans-serif", size: 11, weight: 500 },
          },
          border: { display: false },
        },
      },
    };
  }, [palette]);

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
              gap: 'var(--spacing-5)',
              gridTemplateColumns: 'repeat(1, minmax(0, 1fr))'
            }}>
              <style>{`@media (min-width: 768px) { .loading-grid { grid-template-columns: repeat(2, 1fr); } } @media (min-width: 1280px) { .loading-grid { grid-template-columns: repeat(4, 1fr); } }`}</style>
              <div className="loading-grid" style={{ display: 'grid', gap: 'var(--spacing-5)' }}>
                {[...Array(4)].map((_, index) => (
                  <div
                    key={index}
                    className="nm-card"
                    style={{
                      height: '160px',
                      background: 'var(--nm-surface)',
                      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                    }}
                  />
                ))}
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
                Analytics unavailable
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
                    eyebrow="Platform Volumes"
                    title="Core entity counts"
                    note="Pulled from current database totals"
                  >
                    <div style={{ height: '360px' }}>
                      <Bar data={volumeChartData ?? EMPTY_BAR_DATA} options={volumeChartOptions} />
                    </div>
                  </ChartPanel>

                  <ChartPanel
                    eyebrow="Account Health"
                    title="User status distribution"
                    note="Active vs inactive vs pending approval"
                  >
                    <div style={{ height: '360px' }}>
                      <Doughnut data={healthChartData ?? EMPTY_DOUGHNUT_DATA} options={healthChartOptions} />
                    </div>
                  </ChartPanel>
                </div>

                {/* Trend Chart */}
                <ChartPanel
                  eyebrow="Growth Trends"
                  title="7-day vs 30-day activity"
                  note="Comparing recent platform activity"
                  style={{ gridColumn: '1 / -1' }}
                >
                  <div style={{ height: '360px' }}>
                    <Line data={trendChartData ?? EMPTY_LINE_DATA} options={trendChartOptions} />
                  </div>
                </ChartPanel>

                {/* Pending Employers Queue */}
                <div className="nm-card" style={{
                  background: 'var(--nm-surface)',
                  padding: 'var(--spacing-6)',
                  gridColumn: '1 / -1'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    marginBottom: 'var(--spacing-5)',
                    gap: 'var(--spacing-4)'
                  }}>
                    <div>
                      <div style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '11px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.18em',
                        color: 'var(--nm-text-secondary)',
                        marginBottom: 'var(--spacing-2)'
                      }}>
                        Approval Queue
                      </div>
                      <h2 style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'var(--text-2xl)',
                        fontWeight: 700,
                        letterSpacing: '-0.02em',
                        textTransform: 'uppercase',
                        margin: 0,
                        color: 'var(--nm-text-primary)'
                      }}>
                        Pending Employers
                      </h2>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        height: '48px',
                        width: '48px',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `4px solid ${palette.text}`,
                        background: palette.blue300,
                        boxShadow: `4px 4px 0 ${palette.text}`,
                        borderRadius: '0px',
                        flexShrink: 0
                      }}
                    >
                      <Clock size={20} strokeWidth={2.5} color="#1b1c15" />
                    </div>
                  </div>

                  {!pendingEmployers || pendingEmployers.pendingEmployers.length === 0 ? (
                    <div style={{
                      padding: 'var(--spacing-8)',
                      textAlign: 'center',
                      color: 'var(--nm-text-secondary)'
                    }}>
                      <Clock size={48} style={{ marginBottom: 'var(--spacing-4)', opacity: 0.5 }} />
                      <p style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: 'var(--text-sm)',
                        margin: 0
                      }}>
                        No pending employer approvals
                      </p>
                    </div>
                  ) : (
                    <div style={{
                      display: 'grid',
                      gap: 'var(--spacing-4)',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))'
                    }}>
                      {pendingEmployers.pendingEmployers.map(({ user, employer }) => (
                        <div
                          key={user._id}
                          className="nm-card"
                          style={{
                            padding: 'var(--spacing-4)',
                            background: 'var(--nm-surface-low)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'var(--spacing-3)'
                          }}
                        >
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--spacing-3)',
                            marginBottom: 'var(--spacing-2)'
                          }}>
                            <div style={{
                              width: '40px',
                              height: '40px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: '4px solid var(--nm-ink)',
                              background: palette.blue100,
                              borderRadius: '0px',
                              flexShrink: 0
                            }}>
                              <ShieldCheck size={20} strokeWidth={2.5} color={palette.text} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{
                                fontFamily: 'var(--font-display)',
                                fontSize: 'var(--text-base)',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '-0.02em',
                                color: 'var(--nm-text-primary)',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}>
                                {user.firstName} {user.lastName}
                              </div>
                              <div style={{
                                fontFamily: 'var(--font-body)',
                                fontSize: 'var(--text-sm)',
                                color: 'var(--nm-text-secondary)',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}>
                                {employer?.company?.name || 'Company name pending'}
                              </div>
                            </div>
                          </div>
                          <div style={{
                            display: 'flex',
                            gap: 'var(--spacing-2)',
                            marginTop: 'auto'
                          }}>
                            <button
                              onClick={() => navigate(`/admin/users/${user._id}`)}
                              className="nm-btn"
                              style={{
                                flex: 1,
                                padding: 'var(--spacing-2) var(--spacing-3)',
                                fontSize: 'var(--text-xs)'
                              }}
                            >
                              Review
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {pendingEmployers && pendingEmployers.total > 5 && (
                    <div style={{
                      marginTop: 'var(--spacing-4)',
                      paddingTop: 'var(--spacing-4)',
                      borderTop: '4px solid var(--nm-ink)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: 'var(--text-sm)',
                        color: 'var(--nm-text-secondary)'
                      }}>
                        {pendingEmployers.total} total pending
                      </span>
                      <button
                        onClick={() => navigate('/admin/users')}
                        className="nm-btn"
                        style={{
                          padding: 'var(--spacing-2) var(--spacing-4)',
                          fontSize: 'var(--text-sm)'
                        }}
                      >
                        View All
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
