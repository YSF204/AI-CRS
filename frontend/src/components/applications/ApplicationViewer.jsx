import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { getTemplateById } from "../../Features/CVManagement";

const buildFileUrl = (cvFile) => {
  if (!cvFile?.path) return null;
  // Normalize path — strip leading "src/" or "/" so we can append cleanly
  const cleaned = cvFile.path.replace(/^src[\\/]/, "").replace(/^\//, "");
  // Always derive from the API base URL (e.g. http://localhost:3001/api → http://localhost:3001)
  const backendOrigin = (api.defaults.baseURL || "").replace(/\/api\/?$/, "");
  return `${backendOrigin}/${cleaned}`;
};

const Section = ({ title, icon, children }) => (
  <div 
    className="nm-card"
    style={{
      background: "var(--nm-surface)",
      borderWidth: "4px",
      borderRadius: "0px",
      padding: "24px",
      marginBottom: "24px",
      boxShadow: "6px 6px 0 var(--nm-ink)"
    }}
  >
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 16,
      marginBottom: "20px",
      borderBottom: "3px solid var(--nm-ink)",
      paddingBottom: "12px"
    }}>
      {icon && <span style={{ fontSize: "24px" }}>{icon}</span>}
      <h3 style={{
        fontFamily: "var(--font-display)",
        fontWeight: 900,
        fontSize: "18px",
        color: "var(--nm-text-primary)",
        margin: 0,
        letterSpacing: "0.05em",
        textTransform: "uppercase"
      }}>
        {title}
      </h3>
    </div>
    {children}
  </div>
);

const SkillTag = ({ skill, type }) => {
  const typeColors = {
    technical: "var(--nm-primary)",
    soft: "var(--nm-success)",
    language: "var(--nm-warning)",
    certification: "var(--nm-error)"
  };

  const color = typeColors[type] || typeColors.technical;

  return (
    <span style={{
      display: "inline-block",
      padding: "6px 14px",
      background: color,
      color: "#fff",
      border: "3px solid var(--nm-ink)",
      fontFamily: "var(--font-display)",
      fontSize: "11px",
      fontWeight: 900,
      textTransform: "uppercase",
      letterSpacing: "0.1em",
      marginRight: "10px",
      marginBottom: "10px",
      boxShadow: "3px 3px 0 var(--nm-ink)"
    }}>
      {skill}
    </span>
  );
};

const InfoItem = ({ label, value, icon }) => (
  <div style={{
    display: "flex",
    alignItems: "flex-start",
    gap: 16,
    padding: "16px 0",
    borderBottom: "2px solid var(--nm-ink)"
  }}>
    {icon && <span style={{ fontSize: "18px", color: "var(--nm-primary)", minWidth: "24px" }}>{icon}</span>}
    <div style={{ flex: 1 }}>
      <div style={{
        fontSize: "11px",
        color: "var(--nm-text-tertiary)",
        fontFamily: "var(--font-display)",
        fontWeight: 800,
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        marginBottom: "6px"
      }}>
        {label}
      </div>
      <div style={{
        fontSize: "15px",
        color: "var(--nm-text-primary)",
        fontFamily: "var(--font-body)",
        fontWeight: 700
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
    <div style={{ fontFamily: "var(--font-body)", color: "var(--nm-text-primary)" }}>
      {/* Submission Overview */}
      <Section
        title="Deployment Protocol"
        icon="📡"
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "24px" }}>
          <InfoItem label="Methodology" value={method === "manual" ? "DIRECT INTAKE" : "SYSTEM UPLOAD"} icon="📝" />
          <InfoItem label="Signal Strength" value={application.matchPercentage != null ? `${application.matchPercentage}%` : "CALCULATING..."} icon="🎯" />
          <InfoItem label="Current State" value={
            <span style={{
              padding: "6px 12px",
              background: "var(--nm-ink)",
              color: "#fff",
              fontSize: "12px",
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              border: "2px solid var(--nm-ink)",
              boxShadow: "3px 3px 0 var(--nm-primary)"
            }}>
              {application.status === 'pending' && "UNDER REVIEW"}
              {application.status === 'accepted' && "UNIT ENGAGED"}
              {application.status === 'rejected' && "UNIT ARCHIVED"}
            </span>
          } icon="📊" />
          <InfoItem label="Timestamp" value={new Date(application.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} icon="📅" />
        </div>
      </Section>

      {/* AI Match Analysis */}
      {matchDetails.matchAnalysis && (
        <Section
          title="Intelligence Analysis"
          icon="👁️"
        >
          <div style={{
            background: "var(--nm-bg)",
            padding: "24px",
            border: "4px solid var(--nm-ink)",
            boxShadow: "inset 0 0 40px rgba(0,0,0,0.05)",
            position: "relative",
            overflow: "hidden"
          }}>
            <div style={{
              position: "absolute",
              top: 0,
              right: 0,
              padding: "8px 12px",
              background: "var(--nm-primary)",
              color: "#fff",
              fontFamily: "var(--font-display)",
              fontSize: "10px",
              fontWeight: 900,
              textTransform: "uppercase"
            }}>
              AI CORE OUTPUT
            </div>
            <p style={{
              fontFamily: "var(--font-body)",
              fontSize: "15px",
              color: "var(--nm-text-primary)",
              lineHeight: 1.8,
              whiteSpace: "pre-wrap",
              margin: 0,
              fontWeight: 500
            }}>
              {matchDetails.matchAnalysis}
            </p>
          </div>
        </Section>
      )}

      {/* Manual Application Details */}
      {method === "manual" && (
        <Section
          title="Subject Dossier"
          icon="👤"
        >
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
            <InfoItem label="Full Name" value={applicant.fullName} icon="👤" />
            <InfoItem label="Email Interface" value={applicant.email} icon="📧" />
            <InfoItem label="Comms Link" value={applicant.phone} icon="📱" />
            <InfoItem label="Professional Hub" value={applicant.linkedin} icon="💼" />
            <InfoItem label="Asset Repository" value={applicant.portfolioUrl} icon="🔗" />
            <InfoItem label="Experience Magnitude" value={applicant.yearsOfExperience != null ? `${applicant.yearsOfExperience} YEARS` : "N/A"} icon="💼" />
          </div>

          {applicant.summary && (
            <div style={{ marginTop: "32px" }}>
              <div style={{
                fontSize: "12px",
                color: "var(--nm-text-tertiary)",
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                marginBottom: "12px"
              }}>
                Executive Summary
              </div>
              <p style={{
                fontSize: "15px",
                color: "var(--nm-text-secondary)",
                lineHeight: 1.7,
                whiteSpace: "pre-wrap",
                background: "var(--nm-bg)",
                padding: "20px",
                border: "3px solid var(--nm-ink)"
              }}>
                {applicant.summary}
              </p>
            </div>
          )}

          {/* Skills Display */}
          <div style={{ marginTop: "32px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
            {(applicant.technicalSkills || []).length > 0 && (
              <div>
                <div style={LABEL_STYLE}>Technical Competencies</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                  {(applicant.technicalSkills || []).map((skill, i) => (
                    <SkillTag key={`tech-${i}`} skill={skill} type="technical" />
                  ))}
                </div>
              </div>
            )}

            {(applicant.softSkills || []).length > 0 && (
              <div>
                <div style={LABEL_STYLE}>Operational Traits</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                  {(applicant.softSkills || []).map((skill, i) => (
                    <SkillTag key={`soft-${i}`} skill={skill} type="soft" />
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
          title="Digital Asset Scan"
          icon="📄"
        >
          {loadingCv ? (
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "60px",
              background: "var(--nm-bg)",
              border: "4px dashed var(--nm-ink)"
            }}>
              <div style={{
                fontSize: "14px",
                color: "var(--nm-text-tertiary)",
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                textTransform: "uppercase"
              }}>
                Scanning Data Matrix...
              </div>
            </div>
          ) : cv && (
            <div>
              <div style={{
                marginBottom: "20px",
                fontSize: "12px",
                color: "var(--nm-text-tertiary)",
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "0.1em"
              }}>
                Configuration: {template?.name || "STD-V1"} • Subject: {cv.fullName || "IDENTIFIED"}
              </div>
              <div 
                style={{
                  /* Force light mode variables for the CV render */
                  "--nm-bg": "#fbfaee",
                  "--nm-surface": "#ffffff",
                  "--nm-surface-high": "#e9e9dd",
                  "--nm-surface-low": "#f5f4e8",
                  "--nm-ink": "#1b1c15",
                  "--nm-text-primary": "#1b1c15",
                  "--nm-text-secondary": "#6b6963",
                  "--nm-text-tertiary": "#9c9a92",

                  border: "4px solid var(--nm-ink)",
                  background: "#fff",
                  boxShadow: "10px 10px 0 var(--nm-ink)",
                  width: "100%",
                  maxWidth: "600px", // Larger size
                  aspectRatio: "210 / 297", // A4 paper ratio
                  margin: "0 auto",
                  position: "relative",
                  overflow: "hidden"
                }}
              >
                {TemplateComponent ? (
                  <div style={{
                    width: "800px", 
                    height: "1131px", // 800 * 1.414 (A4 ratio)
                    transform: "scale(0.75)", // 600px / 800px
                    transformOrigin: "top left",
                    position: "absolute",
                    top: 0,
                    left: 0
                  }}>
                    <TemplateComponent userName={cv.fullName || "Candidate"} cvData={templateCvData} />
                  </div>
                ) : (
                  <p style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "14px",
                    color: "var(--nm-text-tertiary)",
                    padding: "40px",
                    textAlign: "center",
                    textTransform: "uppercase"
                  }}>
                    Visual Matrix Unavailable.
                  </p>
                )}
              </div>
            </div>
          )}

          {!cv && fileUrl && (
            <div style={{ marginTop: "24px" }}>
              <div style={LABEL_STYLE}>Uploaded PDF Stream</div>
              <div style={{
                height: "600px",
                border: "4px solid var(--nm-ink)",
                boxShadow: "10px 10px 0 var(--nm-ink)",
                background: "var(--nm-bg)"
              }}>
                <iframe
                  src={fileUrl}
                  title="CV PDF"
                  style={{ width: "100%", height: "100%", border: "none" }}
                />
              </div>
            </div>
          )}
        </Section>
      )}
    </div>
  );
}

const LABEL_STYLE = {
  fontSize: "12px",
  color: "var(--nm-text-tertiary)",
  fontFamily: "var(--font-display)",
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: "0.15em",
  marginBottom: "16px"
};