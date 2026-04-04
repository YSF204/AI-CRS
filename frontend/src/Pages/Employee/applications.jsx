import React, { useMemo } from "react";
import {
  ClipboardList,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Edit2,
} from "lucide-react";
import DashboardNav from "../../components/shared/DashboardNav";
import StatsBar from "../../components/shared/StatsBar";
import useFetch from "../../hooks/useFetch";
import api from "../../services/api";

const getStatusBadgeStyle = (status) => {
  const statusMap = {
    pending: {
      bg: "bg-blue-100",
      text: "text-blue-900",
      label: "📤 Applied",
      icon: FileText,
    },
    accepted: {
      bg: "bg-green-100",
      text: "text-green-900",
      label: "✅ Accepted",
      icon: CheckCircle,
    },
    rejected: {
      bg: "bg-red-100",
      text: "text-red-900",
      label: "❌ Rejected",
      icon: AlertCircle,
    },
    Applied: {
      bg: "bg-blue-100",
      text: "text-blue-900",
      label: "📤 Applied",
      icon: FileText,
    },
    "Under Review": {
      bg: "bg-yellow-100",
      text: "text-yellow-900",
      label: "⏳ Under Review",
      icon: Clock,
    },
    Shortlisted: {
      bg: "bg-green-100",
      text: "text-green-900",
      label: "✅ Shortlisted",
      icon: CheckCircle,
    },
    Rejected: {
      bg: "bg-red-100",
      text: "text-red-900",
      label: "❌ Rejected",
      icon: AlertCircle,
    },
  };
  return statusMap[status] || statusMap["pending"];
};

export default function Applications() {
  const {
    data: applications = [],
    loading,
    error,
  } = useFetch(
    async () => {
      const res = await api.get("/applications/my-applications");
      return res.data?.data?.applications || [];
    },
    { initialData: [] },
  );

  const stats = useMemo(() => {
    return [
      {
        label: "Total Applied",
        value: applications.length,
        color: "var(--blue)",
      },
      {
        label: "Shortlisted",
        value: applications.filter((a) => a.status === "Shortlisted").length,
        color: "var(--mint)",
      },
      {
        label: "Under Review",
        value: applications.filter((a) => a.status === "Under Review").length,
        color: "var(--yellow)",
      },
    ];
  }, [applications]);

  return (
    <div className="min-h-screen p-8 bg-(--bg) text-(--fg)">
      <div className="dashboard-shell">
        <DashboardNav role="employee" />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-['Space_Grotesk'] uppercase tracking-tight flex items-center gap-3">
            <ClipboardList size={28} className="text-(--blue)" />
            My Applications
          </h1>
          <p className="font-mono text-sm text-(--fg-muted) mt-1">
            Track all your job applications with real-time status updates
          </p>
        </div>

        <StatsBar stats={stats} />

        {/* Error State */}
        {error && (
          <div className="mb-6 brutal-card p-4 bg-(--coral) bg-opacity-10 border-4 border-(--coral)">
            <p className="font-mono text-sm text-(--coral)">
              ⚠️{" "}
              {error.response?.data?.message ||
                error.message ||
                "Unable to load applications."}
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="brutal-card p-8 bg-(--card-bg) text-center font-mono text-(--fg-muted)">
            Loading your applications...
          </div>
        ) : applications.length === 0 ? (
          /* Empty State */
          <div className="brutal-card p-12 bg-(--card-bg) text-center">
            <ClipboardList
              size={48}
              className="mx-auto mb-4 text-(--fg-muted)"
            />
            <h3 className="font-['Space_Grotesk'] font-bold text-lg uppercase mb-2">
              No Applications Yet
            </h3>
            <p className="font-mono text-sm text-(--fg-muted) mb-6">
              Browse jobs and submit your first application to get started
            </p>
          </div>
        ) : (
          /* Applications Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {applications.map((app) => {
              const statusStyle = getStatusBadgeStyle(app.status || "Applied");
              const StatusIcon = statusStyle.icon;

              return (
                <div
                  key={app._id}
                  className="brutal-card p-6 bg-(--card-bg) hover:border-black transition-all border-4 border-(--border-color) hover:scale-105 cursor-pointer"
                  onClick={() =>
                    navigate(
                      `/employee/apply-job/${app.jobId._id}?appId=${app._id}`,
                    )
                  }
                >
                  {/* Status Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center gap-2 font-['Space_Grotesk'] font-bold text-sm uppercase px-3 py-2 bg-(--yellow) text-black rounded">
                      <FileText size={14} />
                      {app.cvId ? "📄 CV" : "✏️ Manual"}
                    </span>
                    <span
                      className={`inline-flex items-center gap-2 font-['Space_Grotesk'] font-bold text-xs uppercase px-3 py-2 rounded ${statusStyle.bg} ${statusStyle.text}`}
                    >
                      <StatusIcon size={12} />
                      {statusStyle.label}
                    </span>
                  </div>

                  <p className="font-mono text-sm text-(--fg-muted) mb-4">
                    {app.employerId?.company?.name || "Company"} •{" "}
                    {app.jobId?.workSite || "Location TBA"}
                  </p>

                  {/* Match Percentage */}
                  {app.matchPercentage && (
                    <div className="mb-4 p-3 bg-(--yellow) bg-opacity-20 rounded border-2 border-(--yellow)">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-['Space_Grotesk'] font-bold text-sm">
                          Match Score
                        </span>
                        <span className="font-['Space_Grotesk'] font-bold text-lg text-(--yellow)">
                          {Math.round(app.matchPercentage)}%
                        </span>
                      </div>
                      <div className="w-full bg-(--bg) rounded h-2 border-2 border-(--fg) overflow-hidden">
                        <div
                          className="h-full bg-(--yellow)"
                          style={{ width: `${app.matchPercentage}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Application Date */}
                  <p className="font-mono text-xs text-(--fg-muted)">
                    Applied:{" "}
                    {new Date(app.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
