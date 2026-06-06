import { useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from '../../../../context/ThemeContext';
import { useTranslation } from '../../../../context/LanguageContext';
import api from '../../../../services/api';
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
} from 'chart.js';
import { Users, BriefcaseBusiness, FileText, ShieldCheck } from 'lucide-react';

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

export default function useAdminDashboard() {
  const { theme } = useTheme();
  const { t } = useTranslation();
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
      if (!silent && !statsRef.current) {
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
        label: t("admin.totalUsers"),
        value: stats.users.total,
        detail: `${stats.users.recentRegistrations} ${t("admin.joinedRecent")}`,
        icon: Users,
        tone: {
          surface: palette.blue100,
          badge: palette.blue300,
          text: palette.text,
        },
      },
      {
        label: t("employer.openJobs"),
        value: stats.jobs.open,
        detail: `${stats.jobs.recentlyPosted} ${t("admin.postedRecent")}`,
        icon: BriefcaseBusiness,
        tone: {
          surface: palette.blue50,
          badge: palette.blue100,
          text: palette.text,
        },
      },
      {
        label: t("admin.storedCvs"),
        value: stats.cvs.total,
        detail: t("admin.cvsAvailable"),
        icon: FileText,
        tone: {
          surface: palette.blue100,
          badge: palette.blue300,
          text: palette.text,
        },
      },
      {
        label: t("admin.employerProfiles"),
        value: stats.employers.total,
        detail: `${stats.users.pendingApproval} ${t("admin.approvalsPending")}`,
        icon: ShieldCheck,
        tone: {
          surface: palette.blue50,
          badge: palette.blue100,
          text: palette.text,
        },
      },
    ];
  }, [palette, stats, t]);

  const volumeChartData = useMemo(() => {
    if (!stats) return null;

    return {
      labels: [
        t("admin.usersLabel"),
        t("admin.employeesLabel"),
        t("admin.employersLabel"),
        t("admin.adminsLabel"),
        t("admin.cvsLabel"),
        t("admin.jobsLabel"),
        t("admin.openJobsLabel"),
      ],
      datasets: [
        {
          label: t("admin.coreCounts"),
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
      labels: [
        t("admin.activeLabel"),
        t("admin.inactiveLabel"),
        t("admin.pendingLabel"),
      ],
      datasets: [
        {
          label: t("admin.accountHealth"),
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
      labels: [
        t("admin.usersLabel"),
        t("admin.employeesLabel"),
        t("admin.employersLabel"),
        t("admin.cvsLabel"),
        t("admin.jobsLabel"),
        t("admin.openJobsLabel"),
      ],
      datasets: [
        {
          label: t("admin.sevenDays"),
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
          label: t("admin.thirtyDays"),
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

  return {
    stats, trends, pendingEmployers, loading, error, lastUpdated,
    palette, summaryCards,
    volumeChartData, healthChartData, trendChartData,
    volumeChartOptions, healthChartOptions, trendChartOptions,
    EMPTY_BAR_DATA, EMPTY_DOUGHNUT_DATA, EMPTY_LINE_DATA,
  };
}
