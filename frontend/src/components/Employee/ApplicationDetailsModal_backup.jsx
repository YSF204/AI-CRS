import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  Edit2,
  CheckCircle,
  AlertCircle,
  Zap,
  TrendingUp,
  Mail,
  Phone,
  Briefcase,
} from "lucide-react";

export default function ApplicationDetailsModal({
  application,
  isOpen,
  onClose,
  job,
}) {
  const navigate = useNavigate();

  if (!isOpen || !application) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case "accepted":
        return "text-green-600 bg-green-100";
      case "rejected":
        return "text-red-600 bg-red-100";
      default:
        return "text-blue-600 bg-blue-100";
    }
  };

  const canEdit = job?.status === "OPEN" && application.status === "pending";

  return (
    <>
      {/* Blur backdrop */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(10,10,10,0.55)",
          backdropFilter: "blur(6px)",
          zIndex: 9000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px",
        }}
        onClick={onClose}
      >
        {/* Modal */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            maxWidth: "900px",
            maxHeight: "85vh",
            background: "#fafafa",
            borderRadius: "12px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
            overflow: "hidden",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "10px 20px",
              background: "rgba(10,10,10,0.92)",
              borderBottom: "2px solid #333",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 900,
                fontSize: "13px",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "#fff",
              }}
            >
              {job?.position || "Application"} •{" "}
              {job?.workSite || "Location TBA"}
            </span>
            <button
              onClick={onClose}
              className="flex items-center gap-1 font-['Space_Grotesk'] font-bold text-xs uppercase tracking-wider px-4 py-2 bg-[#ffe630] text-[#0a0a0a] border-2 border-[#0a0a0a] ml-auto"
            >
              <X size={12} /> Close
            </button>
          </div>

          {/* Content */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "32px",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              scrollbarWidth: "thin",
            }}
          >
            {/* Status Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {application.status === "accepted" && (
                  <CheckCircle className="text-green-600" size={20} />
                )}
                {application.status === "rejected" && (
                  <AlertCircle className="text-red-600" size={20} />
                )}
                <span
                  className={`font-['Space_Grotesk'] font-bold uppercase px-3 py-1 rounded ${getStatusColor(
                    application.status,
                  )}`}
                >
                  {application.status === "pending"
                    ? "🔄 Pending"
                    : application.status}
                </span>
              </div>
              <div className="text-right">
                <p className="font-mono text-xs text-gray-500">
                  Applied:{" "}
                  {new Date(application.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Application Method */}
            <div className="bg-yellow-50 border-2 border-yellow-300 p-3 rounded">
              <p className="font-mono text-xs text-yellow-800">
                <span className="font-bold">📋 Method:</span>{" "}
                {application.applicationMethod === "existingCv"
                  ? "Using Existing CV"
                  : application.applicationMethod === "uploadPdf"
                    ? "Uploaded PDF"
                    : "Manual Entry"}
              </p>
            </div>

            {/* Edit submission */}
            {canEdit && (
              <div className="space-y-3">
                <button
                  onClick={() => {
                    const targetJobId =
                      application.jobId?._id || application.jobId;
                    if (!targetJobId) return;
                    onClose();
                    navigate(
                      `/employee/apply/${targetJobId}?appId=${application._id}`,
                    );
                  }}
                  className="w-full brutal-btn bg-[var(--yellow)] hover:bg-[#f3df74] text-[#0a0a0a] font-bold py-3 rounded transition-all flex items-center justify-center gap-2"
                >
                  <Edit2 size={18} />
                  Edit Submission
                </button>
                <button
                  onClick={() => {
                    const targetJobId =
                      application.jobId?._id || application.jobId;
                    if (!targetJobId) return;
                    onClose();
                    navigate(
                      `/employee/apply/${targetJobId}?appId=${application._id}&fresh=true`,
                    );
                  }}
                  className="w-full brutal-btn bg-[var(--mint)] hover:bg-[#4ade80] text-[#0a0a0a] font-bold py-3 rounded transition-all"
                >
                  Submit New CV
                </button>
              </div>
            )}

            {/* Match Score */}
            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-400 p-4 rounded">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Zap className="text-yellow-600" size={18} />
                  <span className="font-['Space_Grotesk'] font-bold">
                    Match Score
                  </span>
                </div>
                <span className="text-3xl font-bold text-yellow-600">
                  {Math.round(application.matchPercentage)}%
                </span>
              </div>
              <div className="w-full bg-gray-300 rounded h-3 border-2 border-gray-400 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-500 to-orange-500"
                  style={{ width: `${application.matchPercentage}%` }}
                />
              </div>
            </div>

            {/* Match Breakdown */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 border-2 border-blue-300 p-3 rounded">
                <p className="font-mono text-xs text-blue-700 mb-1">
                  Technical Skills
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {application.matchDetails?.technicalSkillsMatch || 0}%
                </p>
              </div>
              <div className="bg-green-50 border-2 border-green-300 p-3 rounded">
                <p className="font-mono text-xs text-green-700 mb-1">
                  Experience
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {application.matchDetails?.experienceMatch || 0}%
                </p>
              </div>
              <div className="bg-purple-50 border-2 border-purple-300 p-3 rounded">
                <p className="font-mono text-xs text-purple-700 mb-1">
                  Soft Skills
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {application.matchDetails?.softSkillsMatch || 0}%
                </p>
              </div>
              <div className="bg-pink-50 border-2 border-pink-300 p-3 rounded">
                <p className="font-mono text-xs text-pink-700 mb-1">
                  Languages
                </p>
                <p className="text-2xl font-bold text-pink-600">
                  {application.matchDetails?.languagesMatch || 0}%
                </p>
              </div>
            </div>
            <p className="font-mono text-xs text-slate-600">
              This score estimates how well your submission matches the role by
              comparing required skills, experience, soft skills, and language
              fit.
            </p>

            {/* AI Analysis */}
            {application.matchDetails?.matchAnalysis && (
              <div className="bg-slate-50 border-4 border-slate-300 p-4 rounded">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="text-slate-600" size={18} />
                  <h3 className="font-['Space_Grotesk'] font-bold text-sm uppercase">
                    AI Match Analysis
                  </h3>
                </div>
                <p className="font-mono text-sm text-slate-700 leading-relaxed">
                  {application.matchDetails.matchAnalysis}
                </p>
              </div>
            )}

            {/* Applicant Information */}
            <div className="border-4 border-gray-400 p-4 rounded">
              <h3 className="font-['Space_Grotesk'] font-bold uppercase mb-4 text-sm">
                📝 Your Information
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="font-mono text-xs text-gray-600">Full Name</p>
                  <p className="font-bold">
                    {application.applicantInfo?.fullName || "N/A"}
                  </p>
                </div>
                {application.applicantInfo?.email && (
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-gray-600" />
                    <div>
                      <p className="font-mono text-xs text-gray-600">Email</p>
                      <p className="font-mono text-sm">
                        {application.applicantInfo.email}
                      </p>
                    </div>
                  </div>
                )}
                {application.applicantInfo?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-gray-600" />
                    <div>
                      <p className="font-mono text-xs text-gray-600">Phone</p>
                      <p className="font-mono text-sm">
                        {application.applicantInfo.phone}
                      </p>
                    </div>
                  </div>
                )}
                {application.applicantInfo?.yearsOfExperience && (
                  <div className="flex items-center gap-2">
                    <Briefcase size={14} className="text-gray-600" />
                    <div>
                      <p className="font-mono text-xs text-gray-600">
                        Years of Experience
                      </p>
                      <p className="font-mono text-sm">
                        {application.applicantInfo.yearsOfExperience} years
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Skills Summary */}
            {(application.applicantInfo?.technicalSkills?.length > 0 ||
              application.applicantInfo?.softSkills?.length > 0) && (
              <div className="border-4 border-gray-400 p-4 rounded">
                <h3 className="font-['Space_Grotesk'] font-bold uppercase mb-3 text-sm">
                  💼 Skills
                </h3>
                <div className="space-y-3">
                  {application.applicantInfo?.technicalSkills?.length > 0 && (
                    <div>
                      <p className="font-mono text-xs font-bold text-gray-600 mb-2">
                        Technical Skills
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {application.applicantInfo.technicalSkills
                          .filter((skill) => skill && skill.trim())
                          .map((skill, idx) => (
                            <span
                              key={idx}
                              className="bg-blue-200 text-blue-900 px-3 py-1 rounded font-mono text-xs"
                            >
                              {skill}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                  {application.applicantInfo?.softSkills?.length > 0 && (
                    <div>
                      <p className="font-mono text-xs font-bold text-gray-600 mb-2">
                        Soft Skills
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {application.applicantInfo.softSkills
                          .filter((skill) => skill && skill.trim())
                          .map((skill, idx) => (
                            <span
                              key={idx}
                              className="bg-purple-200 text-purple-900 px-3 py-1 rounded font-mono text-xs"
                            >
                              {skill}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!canEdit && application.status !== "pending" && (
              <div className="border-4 border-red-400 p-4 rounded bg-red-50">
                <p className="font-mono text-sm text-red-800">
                  ❌ This application cannot be edited. The job is no longer
                  open or your application has already been reviewed.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
