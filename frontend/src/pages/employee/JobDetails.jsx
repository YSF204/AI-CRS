import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
} from "lucide-react";
import DashboardNav from "../../components/shared/DashboardNav";
import api from "../../services/api";
import useFetch from "../../hooks/useFetch";
import { getRelativeTime } from "../../utils/dateFormatter";
import ApplyJobModal from "./apply-job";
import { SkCard, SkBox, SkText } from "../../components/ui/Skeleton";

const toRoleType = (value) => {
  if (value === "FULL_TIME") return "Full-time";
  if (value === "PART_TIME") return "Part-time";
  if (value === "CONTRACT") return "Contract";
  if (value === "INTERNSHIP") return "Internship";
  return value || "Open";
};

const openExternalSource = (url) => {
  if (!url) return;
  window.open(url, "_blank", "noopener,noreferrer");
};

export default function JobDetails() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [applyJobId, setApplyJobId] = useState(null);

  const {
    data: job,
    loading,
    error,
  } = useFetch(
    async () => {
      const res = await api.get(`/jobs/${jobId}`);
      return res.data?.data?.job;
    },
    { initialData: null },
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-(--bg) text-(--fg)">
        <div className="dashboard-nav-area">
          <DashboardNav role="employee" />
        </div>
        <div className="dashboard-shell py-6">
          <SkCard style={{ padding: "var(--spacing-8)" }}>
            <div style={{ display: "flex", gap: "var(--spacing-4)", marginBottom: "var(--spacing-6)" }}>
              <div style={{ flex: 1 }}>
                <SkBox w="70%" h={32} />
                <div style={{ marginTop: "var(--spacing-2)" }}><SkBox w="40%" h={18} /></div>
              </div>
              <SkBox w={80} h={32} />
            </div>
            <div style={{ display: "flex", gap: "var(--spacing-4)", marginBottom: "var(--spacing-6)" }}>
              <SkBox w={100} h={16} />
              <SkBox w={80} h={16} />
              <SkBox w={90} h={16} />
            </div>
            <SkText lines={4} />
            <div style={{ marginTop: "var(--spacing-6)" }}>
              <SkBox w="100%" h={56} />
            </div>
          </SkCard>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-(--bg) text-(--fg)">
        <div className="dashboard-nav-area">
          <DashboardNav role="employee" />
        </div>
        <div className="dashboard-shell py-6">
          <div className="brutal-card p-8 bg-(--card-bg) text-center">
            <p className="font-mono text-sm text-(--coral)">
              {error?.response?.data?.message || "Job not found"}
            </p>
            <button
              onClick={() => navigate(-1)}
              className="brutal-btn px-4 py-2 mt-4"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--bg) text-(--fg)">
      <div className="dashboard-nav-area">
        <DashboardNav role="employee" />
      </div>

      <div className="dashboard-shell py-6">
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="brutal-btn px-4 py-2 mb-4 flex items-center gap-2"
          >
            <ChevronLeft size={16} />
            Back
          </button>
        </div>

        <div className="brutal-card bg-(--card-bg) p-8">
          {/* Header */}
          <div className="mb-8 pb-6 border-b-4 border-(--border-color)">
            <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between mb-4 gap-4">
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold font-['Space_Grotesk'] uppercase tracking-tight text-(--fg) mb-2 break-words">
                  {job.position}
                </h1>
                <p className="font-mono text-base sm:text-lg text-(--fg-muted) truncate">
                  {job.employerId?.company?.name || "Company"}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold font-mono border-2 border-black bg-(--yellow) text-black uppercase">
                  {toRoleType(job.workDuration)}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-sm font-mono">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-(--fg-muted)" />
                <span>
                  {job.workSite?.replace("_", " ") || "Location not available"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-(--fg-muted)" />
                <span>{getRelativeTime(job.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign size={16} className="text-(--fg-muted)" />
                <span>${job.salary?.toLocaleString() || "Not specified"}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="font-['Space_Grotesk'] font-bold text-xl uppercase tracking-wider mb-4 text-(--fg)">
              Job Description
            </h2>
            <p className="font-mono text-sm leading-relaxed text-(--fg-muted)">
              {job.description}
            </p>
          </div>

          {/* Requirements */}
          <div className="mb-8">
            <h2 className="font-['Space_Grotesk'] font-bold text-xl uppercase tracking-wider mb-4 text-(--fg)">
              Requirements
            </h2>
            <div className="space-y-4">
              <div>
                <p className="font-mono text-sm font-bold text-(--fg-muted) mb-2">
                  Years of Experience
                </p>
                <p className="font-mono text-sm text-(--fg)">
                  {job.yearsOfExperience || 0}+ years
                </p>
              </div>

              {job.technicalSkills?.length > 0 && (
                <div>
                  <p className="font-mono text-sm font-bold text-(--fg-muted) mb-2">
                    Technical Skills
                  </p>
                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                    {job.technicalSkills.map((skill, i) => (
                      <span
                        key={i}
                        className="text-sm font-medium font-['Space_Grotesk'] text-(--fg)"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {job.softSkills?.length > 0 && (
                <div>
                  <p className="font-mono text-sm font-bold text-(--fg-muted) mb-2">
                    Soft Skills
                  </p>
                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                    {job.softSkills.map((skill, i) => (
                      <span
                        key={i}
                        className="text-sm font-medium font-['Space_Grotesk'] text-(--fg)"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {job.language?.length > 0 && (
                <div>
                  <p className="font-mono text-sm font-bold text-(--fg-muted) mb-2">
                    Languages
                  </p>
                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                    {job.language.map((lang, i) => (
                      <span
                        key={i}
                        className="text-sm font-medium font-['Space_Grotesk'] text-(--fg)"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Apply Button */}
          <div className="flex gap-4">
            <button
              onClick={() => {
                if (job.externalUrl) {
                  openExternalSource(job.externalUrl);
                  return;
                }
                setApplyJobId(job._id);
              }}
              className="flex-1 brutal-btn px-6 py-4 font-bold uppercase tracking-wider flex items-center justify-center gap-2 text-lg"
              style={{ background: "var(--yellow)", color: "#0a0a0a" }}
            >
              <Briefcase size={20} />
              {job.externalUrl ? "Open Source" : "Apply Now"}
            </button>
          </div>
        </div>
      </div>

      {!job.externalUrl && applyJobId && (
        <ApplyJobModal jobId={applyJobId} onClose={() => setApplyJobId(null)} />
      )}
    </div>
  );
}
