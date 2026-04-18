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

const Section = ({ title, icon, children }) => (
  <div style={{
    background: "var(--card-bg)",
    border: "2px solid var(--border-color)",
    borderRadius: "8px",
    padding: "20px",
    marginBottom: "16px"
  }}>
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      marginBottom: "16px"
    }}>
      {icon && <span style={{ fontSize: "20px", color: "var(--accent)" }}>{icon}</span>}
      <h3 style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 700,
        fontSize: "16px",
        color: "var(--fg)",
        margin: 0,
        letterSpacing: "0.02em"
      }}>
        {title}
      </h3>
    </div>
    {children}
  </div>
);

const SkillTag = ({ skill, type }) => {
  const colors = {
    technical: { bg: "#E3F2FD", text: "#fff" },
    soft: { bg: "#4CAF50", text: "#fff" },
    language: { bg: "#2196F3", text: "#fff" },
    certification: { bg: "#FF9800", text: "#fff" }
  };

  const color = colors[type] || colors.technical;

  return (
    <span style={{
      display: "inline-block",
      padding: "6px 12px",
      background: color.bg,
      color: color.text,
      borderRadius: "6px",
      fontFamily: "'DM Mono', monospace",
      fontSize: "11px",
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      marginRight: "8px",
      marginBottom: "8px"
    }}>
      {skill}
    </span>
  );
};

const InfoItem = ({ label, value, icon }) => (
  <div style={{
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    padding: "12px 0",
    borderBottom: "1px solid rgba(0,0,0,0.05)"
  }}>
    {icon && <span style={{ fontSize: "16px", color: "var(--accent)", minWidth: "20px" }}>{icon}</span>}
    <div style={{ flex: 1 }}>
      <div style={{
        fontSize: "11px",
        color: "var(--fg-muted)",
        fontFamily: "'DM Mono', monospace",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        marginBottom: "4px"
      }}>
        {label}
      </div>
      <div style={{
        fontSize: "14px",
        color: "var(--fg)",
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 500
      }}>
        {value || "—"}
      </div>
    </div>
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
    <div style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--fg)" }}>
      {/* Submission Overview */}
      <Section
        title="Submission Overview"
        icon="📋"
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
          <InfoItem label="Application Method" value={method === "manual" ? "Manual Form" : "CV Upload"} icon="📝" />
          <InfoItem label="Match Score" value={application.matchPercentage != null ? `${application.matchPercentage}%` : "Pending"} icon="🎯" />
          <InfoItem label="Status" value={
            <span style={{
              padding: "4px 8px",
              borderRadius: "4px",
              fontSize: "12px",
              fontWeight: 600,
              textTransform: "uppercase"
            }}>
              {application.status === 'pending' && <span style={{ background: "#F59E0B", color: "#fff" }}>Under Review</span>}
              {application.status === 'accepted' && <span style={{ background: "#10B981", color: "#fff" }}>Hired</span>}
              {application.status === 'rejected' && <span style={{ background: "#EF4444", color: "#fff" }}>Not Selected</span>}
            </span>
          } icon="📊" />
          <InfoItem label="Submitted On" value={new Date(application.createdAt).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })} icon="📅" />
        </div>
      </Section>

      {/* AI Match Analysis */}
      {matchDetails.matchAnalysis && (
        <Section
          title="AI Match Analysis"
          icon="🤖"
        >
          <div style={{
            background: "linear-gradient(135deg, rgba(67, 233, 186, 0.1), rgba(67, 233, 186, 0.05))",
            padding: "16px",
            borderRadius: "8px",
            border: "1px solid var(--border-color)"
          }}>
            <p style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "13px",
              color: "var(--fg)",
              lineHeight: 1.6,
              whiteSpace: "pre-wrap",
              margin: 0
            }}>
              {matchDetails.matchAnalysis}
            </p>
          </div>
        </Section>
      )}

      {/* Manual Application Details */}
      {method === "manual" && (
        <Section
          title="Applicant Information"
          icon="👤"
        >
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "12px" }}>
            <InfoItem label="Full Name" value={applicant.fullName || "Not provided"} icon="👤" />
            <InfoItem label="Email Address" value={applicant.email || "Not provided"} icon="📧" />
            <InfoItem label="Phone Number" value={applicant.phone || "Not provided"} icon="📱" />
            <InfoItem label="LinkedIn Profile" value={applicant.linkedin || "Not provided"} icon="💼" />
            <InfoItem label="Portfolio URL" value={applicant.portfolioUrl || "Not provided"} icon="🔗" />
            <InfoItem label="Years of Experience" value={applicant.yearsOfExperience != null ? `${applicant.yearsOfExperience} years` : "Not specified"} icon="💼" />
          </div>

          {applicant.summary && (
            <div style={{ marginTop: "16px" }}>
              <div style={{
                fontSize: "12px",
                color: "var(--fg-muted)",
                fontFamily: "'DM Mono', monospace",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "8px"
              }}>
                Professional Summary
              </div>
              <p style={{
                fontSize: "14px",
                color: "var(--fg)",
                lineHeight: 1.6,
                whiteSpace: "pre-wrap"
              }}>
                {applicant.summary}
              </p>
            </div>
          )}

          {/* Skills Display */}
          <div style={{ marginTop: "16px" }}>
            {(applicant.technicalSkills || []).length > 0 && (
              <div style={{ marginBottom: "12px" }}>
                <div style={{
                  fontSize: "12px",
                  color: "var(--fg-muted)",
                  fontFamily: "'DM Mono', monospace",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: "8px"
                }}>
                  Technical Skills
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {(applicant.technicalSkills || []).map((skill, i) => (
                    <SkillTag key={`tech-${i}`} skill={skill} type="technical" />
                  ))}
                </div>
              </div>
            )}

            {(applicant.softSkills || []).length > 0 && (
              <div style={{ marginBottom: "12px" }}>
                <div style={{
                  fontSize: "12px",
                  color: "var(--fg-muted)",
                  fontFamily: "'DM Mono', monospace",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: "8px"
                }}>
                  Soft Skills
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {(applicant.softSkills || []).map((skill, i) => (
                    <SkillTag key={`soft-${i}`} skill={skill} type="soft" />
                  ))}
                </div>
              </div>
            )}

            {(applicant.languages || []).length > 0 && (
              <div style={{ marginBottom: "12px" }}>
                <div style={{
                  fontSize: "12px",
                  color: "var(--fg-muted)",
                  fontFamily: "'DM Mono', monospace",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: "8px"
                }}>
                  Languages
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {(applicant.languages || []).map((lang, i) => (
                    <SkillTag key={`lang-${i}`} skill={lang} type="language" />
                  ))}
                </div>
              </div>
            )}

            {(applicant.certifications || []).length > 0 && (
              <div>
                <div style={{
                  fontSize: "12px",
                  color: "var(--fg-muted)",
                  fontFamily: "'DM Mono', monospace",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: "8px"
                }}>
                  Certifications
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {(applicant.certifications || []).map((cert, i) => (
                    <SkillTag key={`cert-${i}`} skill={cert} type="certification" />
                  ))}
                </div>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* CV Display */}
      {method !== "manual" && (
        <Section
          title="Resume / CV"
          icon="📄"
        >
          {loadingCv ? (
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "40px",
              background: "var(--bg)",
              borderRadius: "8px",
              border: "2px dashed var(--border-color)"
            }}>
              <div style={{
                fontSize: "14px",
                color: "var(--fg-muted)",
                fontFamily: "'Space Grotesk', sans-serif"
              }}>
                Loading CV...
              </div>
            </div>
          ) : cv && (
            <div>
              <div style={{
                marginBottom: "12px",
                fontSize: "12px",
                color: "var(--fg-muted)",
                fontFamily: "'DM Mono', monospace",
                textTransform: "uppercase",
                letterSpacing: "0.05em"
              }}>
                Template: {template?.name || "CV Template"} • Candidate: {cv.fullName || "Not specified"}
              </div>
              <div style={{
                border: "3px solid var(--border-color)",
                background: "#fff",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                borderRadius: "8px",
                overflow: "auto",
                maxHeight: "60vh"
              }}>
                {TemplateComponent ? (
                  <TemplateComponent userName={cv.fullName || "Candidate"} cvData={templateCvData} />
                ) : (
                  <p style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: "14px",
                    color: "var(--fg-muted)",
                    padding: "24px",
                    textAlign: "center"
                  }}>
                    CV template preview is unavailable.
                  </p>
                )}
              </div>
            </div>
          )}

          {!cv && fileUrl && (
            <Section
              title="Uploaded PDF"
              icon="📎"
            >
              <div style={{
                height: "500px",
                border: "3px solid var(--border-color)",
                borderRadius: "8px",
                background: "var(--bg)"
              }}>
                <iframe
                  src={fileUrl}
                  title="CV PDF"
                  style={{
                    width: "100%",
                    height: "100%",
                    border: "none"
                  }}
                />
              </div>
            </Section>
          )}

          {!cv && !fileUrl && (
            <div style={{
              padding: "24px",
              textAlign: "center",
              background: "var(--card-bg)",
              borderRadius: "8px",
              border: "2px solid var(--border-color)"
            }}>
              <p style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "14px",
                color: "var(--fg-muted)",
                margin: 0
              }}>
                CV record not available for this application.
              </p>
            </div>
          )}

          {applicant.additionalInformation && (
            <Section
              title="Additional Information"
              icon="📝"
            >
              <div style={{
                background: "linear-gradient(135deg, rgba(67, 233, 186, 0.1), rgba(67, 233, 186, 0.05))",
                padding: "16px",
                borderRadius: "8px",
                border: "1px solid var(--border-color)"
              }}>
                <p style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: "13px",
                  color: "var(--fg)",
                  lineHeight: 1.6,
                  whiteSpace: "pre-wrap",
                  margin: 0
                }}>
                  {applicant.additionalInformation}
                </p>
              </div>
            </Section>
          )}
        </Section>
      )}
    </div>
  );
}