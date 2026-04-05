import React, { useMemo, useState } from "react";
import { ClipboardList } from "lucide-react";
import DashboardNav from "../../components/shared/DashboardNav";
import StatsBar from "../../components/shared/StatsBar";
import ApplicationDetailsModal from "../../components/Employee/ApplicationDetailsModal";
import useFetch from "../../hooks/useFetch";
import api from "../../services/api";

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

  const [selectedApplication, setSelectedApplication] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleApplicationClick = async (app) => {
    setSelectedApplication(app);
    // Fetch full job details
    try {
      const res = await api.get(`/jobs/${app.jobId._id || app.jobId}`);
      setSelectedJob(res.data?.data?.job);
    } catch (error) {
      console.error("Failed to fetch job details:", error);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setSelectedApplication(null);
      setSelectedJob(null);
    }, 300);
  };

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
              return (
                <div
                  key={app._id}
                  className="brutal-card p-6 bg-(--card-bg) hover:border-black transition-all border-4 border-(--border-color) hover:scale-105 cursor-pointer"
                  onClick={() => handleApplicationClick(app)}
                >
                  {/* Application Title and Company */}
                  <div className="flex flex-col gap-2">
                    <p className="font-['Space_Grotesk'] font-bold text-base uppercase text-(--fg)">
                      {app.jobId?.position || "Position"}
                    </p>
                    <p className="font-mono text-sm text-(--fg-muted)">
                      {app.employerId?.company?.name || "Company"}
                    </p>
                  </div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-(--fg-muted)">
                    Click to view full application details
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Application Details Modal */}
      <ApplicationDetailsModal
        application={selectedApplication}
        job={selectedJob}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
