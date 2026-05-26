import React from "react";
import { X, CheckCircle, AlertCircle, Clock, Globe, Briefcase, GraduationCap, Laptop, Edit3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const STATUS_CONFIG = {
  "Under Review": { bg: "var(--yellow)", color: "#000", icon: <Clock size={16} /> },
  "Shortlisted": { bg: "var(--teal)", color: "#000", icon: <CheckCircle size={16} /> },
  "Rejected": { bg: "var(--coral)", color: "#fff", icon: <AlertCircle size={16} /> },
  "Accepted": { bg: "var(--mint)", color: "#000", icon: <CheckCircle size={16} /> },
};

export default function ApplicationDetailsModal({ application, job, isOpen, onClose }) {
  const navigate = useNavigate();
  if (!isOpen || !application) return null;

  const status = application.status || "Under Review";
  const { bg, color, icon } = STATUS_CONFIG[status] || STATUS_CONFIG["Under Review"];
  const matchPercentage = application.matchPercentage || 0;
  const matchDetails = application.matchDetails || {};

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity"
      onClick={handleBackdropClick}
    >
      <div className="brutal-card bg-[var(--card-bg)] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        {/* Header */}
        <div className="p-6 border-b-4 border-black flex justify-between items-start bg-[var(--bg)]">
          <div>
            <h2 className="text-2xl font-bold font-['Space_Grotesk'] uppercase tracking-tight">
              {job?.position || application.jobId?.position || "Application Details"}
            </h2>
            <p className="font-mono text-sm text-[var(--fg-muted)] mt-1">
              {job?.employerId?.company?.name || application.employerId?.company?.name || "Company Details"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--coral)] hover:text-white transition-colors border-2 border-black"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-[var(--card-bg)]">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="brutal-card p-4 border-2 border-black flex items-center justify-between bg-[var(--bg)]">
              <span className="font-mono text-xs font-bold uppercase text-[var(--fg-muted)]">Status</span>
              <div
                className="flex items-center gap-2 px-3 py-1 font-bold text-xs uppercase border-2 border-black"
                style={{ background: bg, color: color }}
              >
                {icon}
                {status}
              </div>
            </div>
            <div className="brutal-card p-4 border-2 border-black flex items-center justify-between bg-[var(--bg)]">
              <span className="font-mono text-xs font-bold uppercase text-[var(--fg-muted)]">Match Score</span>
              <span className="text-xl font-black text-[var(--yellow)]">{matchPercentage}%</span>
            </div>
          </div>

          {/* Match Breakdown */}
          {matchDetails && (
            <div className="space-y-4">
              <h3 className="font-['Space_Grotesk'] font-bold text-sm uppercase tracking-wider border-b-2 border-black pb-2">
                Match Breakdown
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { label: "Technical", score: matchDetails.technicalSkillsMatch, icon: <Laptop size={14} /> },
                  { label: "Experience", score: matchDetails.experienceMatch, icon: <Briefcase size={14} /> },
                  { label: "Soft Skills", score: matchDetails.softSkillsMatch, icon: <GraduationCap size={14} /> },
                  { label: "Languages", score: matchDetails.languagesMatch, icon: <Globe size={14} /> },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between items-center font-mono text-[10px] font-bold uppercase">
                      <div className="flex items-center gap-2">
                        {item.icon}
                        {item.label}
                      </div>
                      <span>{item.score || 0}%</span>
                    </div>
                    <div className="h-3 bg-black/10 border-2 border-black overflow-hidden">
                      <div
                        className="h-full bg-[var(--teal)] transition-all duration-500"
                        style={{ width: `${item.score || 0}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Insights (Strengths / Weaknesses) */}
          {(application.matchDetails?.strengths?.length > 0 || application.matchDetails?.weaknesses?.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {application.matchDetails.strengths?.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-mono text-[10px] font-bold uppercase text-[var(--teal)] flex items-center gap-2">
                    <CheckCircle size={14} /> Strengths
                  </h4>
                  <ul className="space-y-2">
                    {application.matchDetails.strengths.map((s, i) => (
                      <li key={i} className="font-mono text-xs p-2 bg-[var(--teal)]/10 border-l-4 border-[var(--teal)]">
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {application.matchDetails.weaknesses?.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-mono text-[10px] font-bold uppercase text-[var(--coral)] flex items-center gap-2">
                    <AlertCircle size={14} /> Areas to Improve
                  </h4>
                  <ul className="space-y-2">
                    {application.matchDetails.weaknesses.map((w, i) => (
                      <li key={i} className="font-mono text-xs p-2 bg-[var(--coral)]/10 border-l-4 border-[var(--coral)]">
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Applicant Info (Only for manual applications) */}
          {application.applicationMethod === "manual" && application.applicantInfo && (
            <div className="space-y-4">
              <h3 className="font-['Space_Grotesk'] font-bold text-sm uppercase tracking-wider border-b-2 border-black pb-2">
                Applicant Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
                <div className="p-3 bg-[var(--bg)] border-2 border-black">
                  <span className="block font-bold text-[var(--fg-muted)] mb-1 uppercase text-[10px]">Full Name</span>
                  {application.applicantInfo.fullName}
                </div>
                <div className="p-3 bg-[var(--bg)] border-2 border-black">
                  <span className="block font-bold text-[var(--fg-muted)] mb-1 uppercase text-[10px]">Email</span>
                  {application.applicantInfo.email}
                </div>
                {application.applicantInfo.phone && (
                  <div className="p-3 bg-[var(--bg)] border-2 border-black">
                    <span className="block font-bold text-[var(--fg-muted)] mb-1 uppercase text-[10px]">Phone</span>
                    {application.applicantInfo.phone}
                  </div>
                )}
                {application.applicantInfo.yearsOfExperience !== undefined && (
                  <div className="p-3 bg-[var(--bg)] border-2 border-black">
                    <span className="block font-bold text-[var(--fg-muted)] mb-1 uppercase text-[10px]">Experience</span>
                    {application.applicantInfo.yearsOfExperience} years
                  </div>
                )}
              </div>

              {application.applicantInfo.summary && (
                <div className="p-4 bg-[var(--bg)] border-2 border-black">
                  <span className="block font-bold text-[var(--fg-muted)] mb-2 uppercase text-[10px]">Professional Summary</span>
                  <p className="font-mono text-xs leading-relaxed">{application.applicantInfo.summary}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t-4 border-black bg-[var(--bg)] flex justify-end gap-4">
          {(status === "Under Review" || status === "pending") && (
            <button
              onClick={() => {
                onClose();
                navigate(`/employee/apply-job/${job?._id || application.jobId?._id || application.jobId}?appId=${application._id}&method=${application.applicationMethod || "manual"}`);
              }}
              className="brutal-btn px-6 py-3 font-bold uppercase tracking-widest text-sm flex items-center gap-2"
              style={{ background: "var(--teal)", color: "#000" }}
            >
              <Edit3 size={16} /> Edit Submission
            </button>
          )}
          <button
            onClick={onClose}
            className="brutal-btn px-8 py-3 bg-[var(--yellow)] font-black uppercase tracking-widest text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
