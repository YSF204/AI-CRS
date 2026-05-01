import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, X, Mail, Phone, MapPin, Briefcase, Calendar, FileText } from "lucide-react";
import DashboardNav from "../../../components/shared/DashboardNav";
import api from "../../../services/api";
import ApplicationViewer from "../../../components/applications/ApplicationViewer";
import ApplicantCard from "./ApplicantCard";

export default function JobApplications() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [job, setJob] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [jobRes, appsRes] = await Promise.all([
          api.get(`/jobs/${jobId}`),
          api.get(`/applications/employer/job/${jobId}`),
        ]);
        setJob(jobRes.data?.data?.job || null);
        setApplications(appsRes.data?.data?.applications || []);
      } catch (err) {
        console.error(err);
        alert("Unable to load applications for this job.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [jobId]);

  return (
    <div style={{ 
      minHeight: "100vh", 
      backgroundColor: "var(--nm-bg)", 
      color: "var(--nm-text-primary)",
      fontFamily: "var(--font-body)",
      overflowX: "hidden"
    }}>
      <div className="dashboard-nav-area">
        <DashboardNav role="employer" />
      </div>

      <div className="dashboard-shell" style={{ padding: 'var(--spacing-8)' }}>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "flex-end", 
          gap: 24, 
          marginBottom: "2rem", 
          flexWrap: "wrap" 
        }}>
          <div>
            <div style={{ 
              fontFamily: "var(--font-display)", 
              fontSize: 14, 
              fontWeight: 800,
              color: "var(--nm-text-tertiary)", 
              textTransform: "uppercase", 
              letterSpacing: "0.15em",
              marginBottom: 8
            }}>
              Talent Pipelines
            </div>
            <h1 style={{ 
              fontFamily: "var(--font-display)", 
              fontWeight: 900, 
              fontSize: "clamp(2rem, 5vw, 3rem)", 
              letterSpacing: "-0.04em", 
              lineHeight: 1,
              textTransform: "uppercase",
              margin: 0 
            }}>
              {job ? job.position : "Unit Intake"}
            </h1>
          </div>
          <button
            onClick={() => navigate("/employer/jobs")}
            className="nm-btn"
            style={{ 
              background: "var(--nm-surface)", 
              color: "var(--nm-text-primary)",
              padding: '12px 24px',
              fontFamily: 'var(--font-display)',
              fontWeight: 900,
              fontSize: 14,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              border: '4px solid var(--nm-ink)'
            }}
          >
            <ArrowLeft size={18} strokeWidth={3} style={{ marginRight: 8, display: 'inline' }} /> Return to Inventory
          </button>
        </div>

        {loading ? (
          <div style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            color: 'var(--nm-text-tertiary)',
            padding: '5rem',
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: '0.1em'
          }}>
            Synchronizing Intake Data...
          </div>
        ) : applications.length === 0 ? (
          <div 
            className="nm-card"
            style={{
              background: 'var(--nm-surface)',
              border: '4px dashed var(--nm-ink)',
              padding: '5rem 2rem',
              textAlign: 'center',
              boxShadow: '8px 8px 0 var(--nm-ink)',
              borderRadius: '0px'
            }}
          >
            <div style={{ 
              fontFamily: 'var(--font-display)', 
              fontWeight: 900, 
              fontSize: 24, 
              color: 'var(--nm-text-primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              No Inbound Requests
            </div>
          </div>
        ) : (
          <div className="applications-two-panel">
            <div className="applications-left-panel">
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 12,
                fontWeight: 900,
                color: 'var(--nm-text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '1rem',
                paddingBottom: '0.75rem',
                borderBottom: '3px solid var(--nm-ink)',
              }}>
                {applications.length} Applicant{applications.length !== 1 ? 's' : ''}
              </div>

              {selected ? (
                <div>
                  <CandidateDetail app={selected} onClose={() => setSelected(null)} />
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {applications.map((app) => (
                    <ApplicantCard
                      key={app._id}
                      app={app}
                      onClick={() => setSelected(app)}
                      compact
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="applications-right-panel">
              {selected ? (
                <div style={{ height: '100%' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem',
                    paddingBottom: '0.75rem',
                    borderBottom: '3px solid var(--nm-ink)',
                  }}>
                    <div style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 12,
                      fontWeight: 900,
                      color: 'var(--nm-text-tertiary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                    }}>
                      <FileText size={14} strokeWidth={3} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                      CV Document
                    </div>
                  </div>
                  <div style={{ height: 'calc(100% - 50px)', overflow: 'auto' }}>
                    <ApplicationViewer application={selected} />
                  </div>
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  minHeight: '400px',
                  border: '4px dashed var(--nm-ink)',
                  background: 'var(--nm-surface)',
                  padding: '3rem',
                  textAlign: 'center',
                }}>
                  <FileText size={48} strokeWidth={2} style={{ color: 'var(--nm-text-tertiary)', marginBottom: '1rem' }} />
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 900,
                    fontSize: 16,
                    color: 'var(--nm-text-tertiary)',
                    textTransform: 'uppercase',
                  }}>
                    Select a candidate to view their CV
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CandidateDetail({ app, onClose }) {
  const applicant = app.applicantInfo || {};
  const statusColor = app.status === 'accepted' ? 'var(--nm-success)' : app.status === 'rejected' ? 'var(--nm-error)' : 'var(--nm-warning)';

  return (
    <div>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 900,
        fontSize: 20,
        color: 'var(--nm-text-primary)',
        textTransform: 'uppercase',
        letterSpacing: '-0.02em',
        marginBottom: 4,
      }}>
        {applicant.fullName || 'Unidentified'}
      </div>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: 13,
        fontWeight: 800,
        color: 'var(--nm-text-tertiary)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginBottom: 20,
      }}>
        {applicant.email || '—'}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <DetailRow icon={<Mail size={14} strokeWidth={3} />} label="Email" value={applicant.email} />
        <DetailRow icon={<Phone size={14} strokeWidth={3} />} label="Phone" value={applicant.phone} />
        <DetailRow icon={<Briefcase size={14} strokeWidth={3} />} label="Experience" value={applicant.yearsOfExperience != null ? `${applicant.yearsOfExperience} years` : '—'} />
        <DetailRow icon={<Calendar size={14} strokeWidth={3} />} label="Applied" value={new Date(app.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} />

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 0',
          borderTop: '2px solid var(--nm-ink)',
          marginTop: 4,
        }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--nm-text-tertiary)' }}>
            Status
          </span>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: 12,
            fontWeight: 900,
            textTransform: 'uppercase',
            background: statusColor,
            color: '#fff',
            padding: '4px 12px',
            border: '2px solid var(--nm-ink)',
          }}>
            {app.status}
          </span>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 0',
          borderTop: '2px solid var(--nm-ink)',
        }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--nm-text-tertiary)' }}>
            Match Score
          </span>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 900,
            fontSize: 22,
            color: (app.matchPercentage || 0) > 80 ? 'var(--nm-success)' : 'var(--nm-warning)',
          }}>
            {app.matchPercentage ?? '—'}%
          </span>
        </div>

        {(applicant.technicalSkills || []).length > 0 && (
          <div style={{ marginTop: 8 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--nm-text-tertiary)', marginBottom: 8 }}>
              Skills
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {applicant.technicalSkills.map((s, i) => (
                <span key={i} style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 10,
                  fontWeight: 900,
                  padding: '3px 8px',
                  border: '2px solid var(--nm-ink)',
                  background: 'var(--nm-primary)',
                  color: '#fff',
                  textTransform: 'uppercase',
                }}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={onClose}
        className="nm-btn"
        style={{
          width: '100%',
          marginTop: '1.5rem',
          padding: '12px',
          background: 'var(--nm-surface)',
          color: 'var(--nm-text-primary)',
          fontFamily: 'var(--font-display)',
          fontWeight: 900,
          fontSize: 12,
          textTransform: 'uppercase',
          border: '3px solid var(--nm-ink)',
        }}
      >
        <ArrowLeft size={14} strokeWidth={3} style={{ marginRight: 6, verticalAlign: 'middle' }} /> Back to List
      </button>
    </div>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '6px 0',
      borderBottom: '1px solid var(--nm-ink)',
    }}>
      <span style={{ color: 'var(--nm-primary)', flexShrink: 0 }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--nm-text-tertiary)' }}>
          {label}
        </div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 700, color: 'var(--nm-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {value || '—'}
        </div>
      </div>
    </div>
  );
}
