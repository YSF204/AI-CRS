import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { getTemplateById } from "../../Features/CVManagement";

const buildFileUrl = (cvFile) => {
  if (!cvFile?.path) return null;
  const cleaned = cvFile.path.replace(/^src\//, "");
  const origin =
    typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.hostname}:${window.location.port || "5173"}`
      : "";
  const apiBase = api.defaults.baseURL?.replace(/\/api$/, "") || "";
  const base = apiBase || origin;
  return `${base}/${cleaned}`;
};

const Section = ({ title, children }) => (
  <div className="brutal-card bg-[var(--card-bg)] border-[3px] border-[var(--border-color)] shadow-[6px_6px_0_var(--shadow-color)] p-4 space-y-2">
    <h3 className="font-['Space_Grotesk'] font-black uppercase tracking-wide text-sm">{title}</h3>
    {children}
  </div>
);

const DEFAULT_CV_SECTION_ORDER = [
  "summary",
  "education",
  "experience",
  "customSections",
  "technicalSkills",
  "softSkills",
  "language",
];

const normalizeCvForTemplate = (cv) => ({
  fullName: cv?.fullName || "",
  jobTitle: cv?.jobTitle || "",
  summary: cv?.summary || "",
  contact: {
    phone: cv?.contact?.phone || "",
    email: cv?.contact?.email || "",
    github: cv?.contact?.github || "",
    linkedin: cv?.contact?.linkedin || "",
  },
  address: {
    city: cv?.address?.city || "",
    street: cv?.address?.street || "",
  },
  experience: cv?.experience || [],
  education: cv?.education || [],
  technicalSkills: cv?.technicalSkills || [],
  softSkills: cv?.softSkills || [],
  language: cv?.language || [],
  customSections: cv?.customSections || [],
  profileImage: cv?.profileImage || "",
  layout: {
    ...(cv?.layout || {}),
    sectionOrder:
      Array.isArray(cv?.layout?.sectionOrder) && cv.layout.sectionOrder.length > 0
        ? cv.layout.sectionOrder
        : DEFAULT_CV_SECTION_ORDER,
  },
});

export default function ApplicationViewer({ application }) {
  const [cv, setCv] = useState(null);
  const [loadingCv, setLoadingCv] = useState(false);

  useEffect(() => {
    const fetchCv = async () => {
      if (!application?.cvId?._id) return;
      setLoadingCv(true);
      try {
        const res = await api.get(`/cvs/${application.cvId._id}`);
        setCv(res.data?.data?.cv || null);
      } catch (err) {
        console.error("Failed to fetch CV", err);
      } finally {
        setLoadingCv(false);
      }
    };
    fetchCv();
  }, [application?.cvId?._id]);

  if (!application) return null;

  const method = application.applicationMethod;
  const fileUrl = buildFileUrl(application.cvFile);
  const applicant = application.applicantInfo || {};
  const matchDetails = application.matchDetails || {};
  const template = getTemplateById(cv?.templateId || 1);
  const TemplateComponent = template?.component;
  const templateCvData = normalizeCvForTemplate(cv);

  return (
    <div className="space-y-4">
      <Section title="Submission Overview">
        <div className="grid sm:grid-cols-2 gap-3 font-mono text-sm">
          <div><span className="font-bold">Method:</span> {method || "unknown"}</div>
          <div><span className="font-bold">Match %:</span> {application.matchPercentage ?? "—"}</div>
          <div><span className="font-bold">Status:</span> {application.status}</div>
          <div><span className="font-bold">Submitted:</span> {new Date(application.createdAt).toLocaleString()}</div>
        </div>
      </Section>

      {matchDetails.matchAnalysis && (
        <Section title="AI Match Analysis">
          <p className="font-mono text-sm text-[var(--fg-muted)] whitespace-pre-wrap">
            {matchDetails.matchAnalysis}
          </p>
        </Section>
      )}

      {method === "manual" && (
        <Section title="Manual Application">
          <div className="grid md:grid-cols-2 gap-4 font-mono text-sm">
            <div>
              <div className="font-bold">Name</div>
              <div>{applicant.fullName}</div>
            </div>
            <div>
              <div className="font-bold">Email</div>
              <div>{applicant.email}</div>
            </div>
            <div>
              <div className="font-bold">Phone</div>
              <div>{applicant.phone}</div>
            </div>
            <div>
              <div className="font-bold">LinkedIn</div>
              <div className="break-all">{applicant.linkedin || "—"}</div>
            </div>
            <div>
              <div className="font-bold">Portfolio URL</div>
              <div className="break-all">{applicant.portfolioUrl || "—"}</div>
            </div>
            <div>
              <div className="font-bold">Experience (years)</div>
              <div>{applicant.yearsOfExperience ?? "—"}</div>
            </div>
          </div>

          <div className="mt-3">
            <div className="font-bold font-mono text-xs mb-1">Summary</div>
            <p className="font-mono text-sm whitespace-pre-wrap">{applicant.summary || "—"}</p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {(applicant.technicalSkills || []).map((s, i) => (
              <span key={i} className="px-3 py-1 bg-[var(--yellow)] text-black font-mono text-xs font-bold rounded">
                {s}
              </span>
            ))}
            {(applicant.softSkills || []).map((s, i) => (
              <span key={`soft-${i}`} className="px-3 py-1 bg-[var(--mint)] text-black font-mono text-xs font-bold rounded">
                {s}
              </span>
            ))}
            {(applicant.languages || []).map((s, i) => (
              <span key={`lang-${i}`} className="px-3 py-1 bg-[var(--teal)] text-black font-mono text-xs font-bold rounded">
                {s}
              </span>
            ))}
          </div>

          {(applicant.certifications || []).length > 0 && (
            <div className="mt-4">
              <div className="font-bold font-mono text-xs mb-2">Certifications</div>
              <div className="flex flex-wrap gap-2">
                {applicant.certifications.map((cert, i) => (
                  <span key={`cert-${i}`} className="px-3 py-1 bg-[var(--yellow)] text-black font-mono text-xs font-bold rounded">
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          )}

          {(applicant.education || []).length > 0 && (
            <div className="mt-4 space-y-2">
              <div className="font-bold font-mono text-xs mb-1">Education</div>
              {applicant.education.map((edu, i) => (
                <div key={`edu-${i}`} className="brutal-card bg-[var(--bg)] border-2 border-[var(--border-color)] p-3">
                  <p className="font-bold text-sm">{edu.certification || "Education Entry"}</p>
                  <p className="font-mono text-xs text-[var(--fg-muted)]">
                    {edu.institutionName || "Institution"}
                    {(edu.durationFrom || edu.durationTo) && ` • ${edu.durationFrom || ""}${edu.durationTo ? ` - ${edu.durationTo}` : ""}`}
                  </p>
                  {edu.summary && (
                    <p className="font-mono text-xs mt-1 text-[var(--fg-muted)] whitespace-pre-wrap">{edu.summary}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {applicant.additionalInformation && (
            <div className="mt-4">
              <div className="font-bold font-mono text-xs mb-1">Additional Information</div>
              <p className="font-mono text-sm whitespace-pre-wrap">
                {applicant.additionalInformation}
              </p>
            </div>
          )}
        </Section>
      )}

      {method !== "manual" && (
        <Section title="CV">
          {loadingCv && <p className="font-mono text-sm">Loading CV...</p>}
          {cv && (
            <div>
              <div className="mb-2 font-mono text-xs text-[var(--fg-muted)]">
                Template: {template?.name || "CV"}
              </div>
              <div className="border-4 border-[var(--border-color)] bg-white shadow-[6px_6px_0_var(--shadow-color)] overflow-auto max-h-[75vh]">
                {TemplateComponent ? (
                  <TemplateComponent userName={cv.fullName || "Candidate"} cvData={templateCvData} />
                ) : (
                  <p className="font-mono text-sm p-4 text-[var(--fg-muted)]">CV template preview is unavailable.</p>
                )}
              </div>
            </div>
          )}

          {!cv && fileUrl && (
            <div className="h-[480px] border-4 border-[var(--border-color)] shadow-[6px_6px_0_var(--shadow-color)]">
              <iframe
                src={fileUrl}
                title="CV PDF"
                className="w-full h-full"
              />
            </div>
          )}

          {!cv && !fileUrl && (
            <p className="font-mono text-sm text-[var(--fg-muted)]">
              CV record not available.
            </p>
          )}
        </Section>
      )}
    </div>
  );
}
