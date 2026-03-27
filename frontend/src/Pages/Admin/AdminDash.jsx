import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users } from "lucide-react";
import DashboardNav from "../../components/shared/DashboardNav";
import api from "../../services/api";

const chartFields = [
  {
    key: "active",
    label: "Active users",
    color: "#22c55e",
    description: "Approved accounts",
  },
  {
    key: "inactive",
    label: "Inactive users",
    color: "#f59e0b",
    description: "Disabled profiles",
  },
  {
    key: "pendingApproval",
    label: "Pending users",
    color: "#ef4444",
    description: "Awaiting admin approval",
  },
  {
    key: "employers",
    label: "Employer accounts",
    color: "#38bdf8",
    description: "Company profiles",
  },
  {
    key: "open",
    label: "Open jobs",
    color: "#a78bfa",
    description: "Live job postings",
  },
];

function DashboardStatsChart() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/admin/stats")
      .then((res) => setStats(res.data.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  const chartData = useMemo(() => {
    if (!stats) return [];
    return [
      { ...chartFields[0], value: stats.users.active },
      { ...chartFields[1], value: stats.users.inactive },
      { ...chartFields[2], value: stats.users.pendingApproval },
      { ...chartFields[3], value: stats.employers.total },
      { ...chartFields[4], value: stats.jobs.open },
    ];
  }, [stats]);

  const maxValue = useMemo(() => {
    return chartData.reduce((max, item) => Math.max(max, item.value || 0), 1);
  }, [chartData]);

  return (
    <div className="brutal-card p-6 bg-(--card-bg)">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Admin dashboard</h2>
          <p className="text-(--fg-muted) mt-2 max-w-2xl">
            Live user and job metrics from the database, updated each time the
            dashboard loads.
          </p>
        </div>
        <div className="text-right text-sm text-(--fg-muted)">
          {loading ? "Loading metrics..." : "Updated from server data."}
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="h-16 rounded-xl bg-(--stripe-color) animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-5">
          {chartData.map((item) => (
            <div key={item.key} className="space-y-2">
              <div className="flex items-center justify-between gap-4 text-sm font-semibold text-(--fg)">
                <div>
                  <div>{item.label}</div>
                  <div className="text-xs text-(--fg-muted)">
                    {item.description}
                  </div>
                </div>
                <span className="text-base font-bold">{item.value ?? 0}</span>
              </div>
              <div className="h-3 rounded-full bg-(--stripe-color)">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${Math.max(8, ((item.value || 0) / maxValue) * 100)}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminDash() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen p-8 bg-(--bg) text-(--fg)">
      <div className="max-w-6xl mx-auto">
        <DashboardNav role="admin" />

        <div className="grid grid-cols-1 gap-8">
          <div className="brutal-card p-6 bg-(--card-bg)">
            <Users size={32} className="mb-4 text-(--coral)" />
            <h2 className="text-2xl mb-2">Manage users</h2>
            <p className="text-(--fg-muted) font-mono mb-6">
              Jump into user administration and profile workflows.
            </p>
            <button
              type="button"
              onClick={() => navigate("/admin/users")}
              className="brutal-btn px-4 py-3 bg-(--yellow) w-full"
            >
              OPEN USER MANAGEMENT
            </button>
          </div>

          <DashboardStatsChart />
        </div>
      </div>
    </div>
  );
}
