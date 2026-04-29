import React from "react";
import api from "../../services/api";
import { getTemplateById } from "../../features/cv-management";

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

const LABEL_STYLE = {
  fontSize: "12px",
  color: "var(--nm-text-tertiary)",
  fontFamily: "var(--font-display)",
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: "0.15em",
  marginBottom: "16px"
};

export {
  Section,
  SkillTag,
  InfoItem,
  buildFileUrl,
  normalizeCvForTemplate,
  LABEL_STYLE,
};

export default function ViewerContent({ application, cv, loadingCv }) {
  const method = application.applicationMethod;
  const fileUrl = buildFileUrl(application.cvFile);
  const applicant = application.applicantInfo || {};
  const matchDetails = application.matchDetails || {};
  const template = getTemplateById(cv?.templateId || 1);
  const TemplateComponent = template?.component;
  const templateCvData = normalizeCvForTemplate(cv);

  return (
    <div style={{ fontFamily: "var(--font-body)", color: "var(--nm-text-primary)" }}>
      <Section
        title="Intelligence Analysis"
        icon="👁️"
      >
        <div style={{
          background: "var(--nm-bg)",
          padding: "28px",
          border: "4px solid var(--nm-ink)",
          boxShadow: "6px 6px 0 var(--nm-ink)",
          position: "relative"
        }}>
          <div style={{
            position: "absolute",
            top: 0,
            right: 0,
            padding: "8px 16px",
            background: "var(--nm-primary)",
            color: "#fff",
            fontFamily: "var(--font-display)",
            fontSize: "11px",
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: "0.1em"
          }}>
            AI CORE OUTPUT
          </div>
          
          <div style={{ marginBottom: "28px" }}>
            <div style={{ fontSize: "11px", fontWeight: 900, textTransform: "uppercase", color: "var(--nm-text-tertiary)", marginBottom: "8px" }}>
              Signal Strength Analysis • {new Date(application.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
              <span style={{ fontSize: "64px", fontWeight: 900, fontFamily: "var(--font-display)", lineHeight: 1 }}>
                {application.matchPercentage || 0}%
              </span>
              <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--nm-text-tertiary)", textTransform: "uppercase" }}>
                Accurate Fit Probability
              </span>
            </div>
          </div>

          <div style={{ 
            borderTop: "3px solid var(--nm-ink)", 
            paddingTop: "24px",
            display: "flex",
            gap: "20px"
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "11px", fontWeight: 900, textTransform: "uppercase", color: "var(--nm-primary)", marginBottom: "12px", letterSpacing: "0.15em" }}>
                Recruiter Verdict
              </div>
              <p style={{
                fontSize: "16px",
                color: "var(--nm-text-primary)",
                lineHeight: 1.6,
                fontWeight: 700,
                margin: 0
              }}>
                {matchDetails.matchAnalysis || "Analysis complete. The candidate profile shows strong structural alignment with the job requirements. Further manual review recommended for cultural fit assessment."}
              </p>
            </div>
          </div>
        </div>
      </Section>

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
              <div style={{
                border: "4px solid var(--nm-ink)",
                background: "#fff",
                boxShadow: "10px 10px 0 var(--nm-ink)",
                overflow: "auto",
                maxHeight: "70vh"
              }}>
                {TemplateComponent ? (
                  <TemplateComponent userName={cv.fullName || "Candidate"} cvData={templateCvData} />
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
