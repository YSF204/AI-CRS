import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  BriefcaseBusiness,
  FileText,
  ShieldCheck,
  Users,
} from "lucide-react";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
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
  Legend,
);

function StatCard({ icon: Icon, label, value, tone, detail }) {
  return (
    <div
      className="brutal-card p-5"
      style={{
        background: tone.surface,
        color: tone.text,
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] opacity-70">
            {label}
          </div>
          <div className="mt-3 font-['Space_Grotesk'] text-4xl font-black leading-none">
            <CountUp to={Number(value || 0)} />
          </div>
          <div className="mt-3 font-mono text-xs opacity-80">{detail}</div>
        </div>
        <div
          className="flex h-12 w-12 items-center justify-center"
          style={{
            border: "3px solid #0a0a0a",
            background: tone.badge,
            boxShadow: "4px 4px 0 #0a0a0a",
          }}
        >
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

function ChartPanel({ title, eyebrow, children, note }) {
  return (
    <div className="brutal-card bg-(--card-bg) p-6">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-(--fg-muted)">
            {eyebrow}
          </div>
          <h2 className="mt-2 text-2xl font-black">{title}</h2>
        </div>
        <div className="font-mono text-xs text-(--fg-muted)">{note}</div>
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

    loadStats();
    const intervalId = window.setInterval(() => {
      loadStats({ silent: true });
    }, 15000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  const palette = useMemo(() => {
    const isDark = theme === "dark";

    return {
      text: isDark ? "#f2f2f6" : "#0a0a0a",
      mutedText: isDark ? "rgba(242,242,246,0.72)" : "rgba(10,10,10,0.64)",
      grid: isDark ? "rgba(242,242,246,0.12)" : "rgba(10,10,10,0.12)",
      border: isDark ? "#9090a0" : "#0a0a0a",
      tooltipBg: isDark ? "#f2f2f6" : "#0a0a0a",
      tooltipText: isDark ? "#0a0a0a" : "#f2f2f6",
      yellow: "#FFE630",
      coral: "#FF6B6B",
      teal: "#4ECDC4",
      mint: "#A8E6CF",
      blue: "#6C63FF",
      panel: isDark ? "#222228" : "#F0EFEB",
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
          surface: palette.yellow,
          badge: "#fff4a1",
          text: "#0a0a0a",
        },
      },
      {
        label: "Open Jobs",
        value: stats.jobs.open,
        detail: `${stats.jobs.recentlyPosted} posted in the last 7 days`,
        icon: BriefcaseBusiness,
        tone: {
          surface: palette.teal,
          badge: "#bff2ec",
          text: "#0a0a0a",
        },
      },
      {
        label: "Stored CVs",
        value: stats.cvs.total,
        detail: "Live resumes currently available in the system",
        icon: FileText,
        tone: {
          surface: palette.mint,
          badge: "#ddf7ea",
          text: "#0a0a0a",
        },
      },
      {
        label: "Employer Profiles",
        value: stats.employers.total,
        detail: `${stats.users.pendingApproval} employer approvals are still pending`,
        icon: ShieldCheck,
        tone: {
          surface: palette.coral,
          badge: "#ffc0c0",
          text: "#0a0a0a",
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
            palette.yellow,
            palette.teal,
            palette.coral,
            palette.blue,
            palette.mint,
            "#f59e0b",
            "#38bdf8",
          ],
          borderColor: "#0a0a0a",
          borderWidth: 3,
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
          backgroundColor: [palette.teal, palette.coral, palette.yellow],
          borderColor: palette.panel,
          borderWidth: 6,
          hoverOffset: 6,
        },
      ],
    };
  }, [palette, stats]);

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
          borderWidth: 2,
          cornerRadius: 0,
          padding: 12,
          titleFont: { family: "'Space Grotesk', sans-serif", weight: "700" },
          bodyFont: { family: "'DM Mono', monospace" },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: palette.text,
            font: { family: "'DM Mono', monospace", size: 11 },
          },
          border: { color: palette.border, width: 3 },
        },
        y: {
          beginAtZero: true,
          grid: { color: palette.grid },
          ticks: {
            color: palette.mutedText,
            font: { family: "'DM Mono', monospace", size: 11 },
          },
          border: { color: palette.border, width: 3 },
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
            boxWidth: 14,
            boxHeight: 14,
            usePointStyle: false,
            padding: 18,
            font: { family: "'DM Mono', monospace", size: 11 },
          },
        },
        tooltip: {
          backgroundColor: palette.tooltipBg,
          titleColor: palette.tooltipText,
          bodyColor: palette.tooltipText,
          borderColor: palette.border,
          borderWidth: 2,
          cornerRadius: 0,
          padding: 12,
          titleFont: { family: "'Space Grotesk', sans-serif", weight: "700" },
          bodyFont: { family: "'DM Mono', monospace" },
        },
      },
    };
  }, [palette]);

  return (
    <div className="min-h-screen bg-(--bg) p-8 text-(--fg)">
      <div className="mx-auto max-w-7xl">
        <DashboardNav role="admin" />

        <div className="mt-8 grid gap-8">
          <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
            <div
              className="brutal-card overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, var(--card-bg) 0%, color-mix(in srgb, var(--card-bg) 72%, var(--yellow) 28%) 100%)",
              }}
            >
              <div className="grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-end">
                <div>
                  <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-(--fg-muted)">
                    Live Control Room
                  </div>
                  <h1 className="mt-3 max-w-3xl text-4xl font-black uppercase leading-none">
                    Real system statistics for admins, not placeholder demo numbers
                  </h1>
                  <p className="mt-4 max-w-2xl font-mono text-sm text-(--fg-muted)">
                    Every chart and number on this dashboard comes from the backend
                    `/admin/stats` endpoint and refreshes automatically.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/admin/users")}
                  className="brutal-btn px-5 py-4"
                  style={{ background: palette.yellow, color: "#0a0a0a" }}
                >
                  <Users size={18} />
                  Open User Management
                </button>
              </div>
            </div>

            <div className="brutal-card bg-(--card-bg) p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-(--fg-muted)">
                    Data Status
                  </div>
                  <h2 className="mt-3 text-2xl font-black">System Pulse</h2>
                </div>
                <div
                  className="flex h-12 w-12 items-center justify-center"
                  style={{
                    border: "3px solid #0a0a0a",
                    background: palette.coral,
                    boxShadow: "4px 4px 0 #0a0a0a",
                  }}
                >
                  <Activity size={20} color="#0a0a0a" />
                </div>
              </div>

              <div className="mt-6 font-mono text-sm text-(--fg-muted)">
                {loading && "Pulling live platform metrics..."}
                {!loading && error && error}
                {!loading &&
                  !error &&
                  `${stats.users.total} users, ${stats.jobs.total} jobs, ${stats.cvs.total} CVs currently stored.`}
              </div>
              {lastUpdated && (
                <div className="mt-3 font-mono text-xs text-(--fg-muted)">
                  Live updates every 15 seconds. Last sync: {new Date(lastUpdated).toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {[...Array(4)].map((_, index) => (
                <div
                  key={index}
                  className="brutal-card h-40 animate-pulse bg-(--card-bg)"
                />
              ))}
            </div>
          ) : error ? (
            <div className="brutal-card bg-(--card-bg) p-8">
              <h2 className="text-2xl font-black">Analytics unavailable</h2>
              <p className="mt-3 max-w-2xl font-mono text-sm text-(--fg-muted)">
                {error}
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {summaryCards.map((card) => (
                  <StatCard key={card.label} {...card} />
                ))}
              </div>

              <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
                <ChartPanel
                  eyebrow="Platform Volumes"
                  title="Core entity counts"
                  note="Pulled from current database totals"
                >
                  <div className="h-[360px]">
                    <Bar data={volumeChartData} options={volumeChartOptions} />
                  </div>
                </ChartPanel>

                <ChartPanel
                  eyebrow="Account Health"
                  title="User status distribution"
                  note="Active vs inactive vs pending approval"
                >
                  <div className="h-[360px]">
                    <Doughnut data={healthChartData} options={healthChartOptions} />
                  </div>
                </ChartPanel>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
