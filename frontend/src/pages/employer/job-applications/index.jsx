import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, X, Mail, Phone, MapPin, Briefcase, Calendar, FileText } from "lucide-react";
import DashboardNav from "../../../components/shared/DashboardNav";
import api from "../../../services/api";
import ApplicationViewer from "../../../components/applications/ApplicationViewer";
import ApplicantDetail from "../../../components/applications/ApplicantDetail";
import ApplicantCard from "./ApplicantCard";
import { SkCard, SkBox } from "../../../components/ui/Skeleton";

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
      height: "100vh",
      backgroundColor: "var(--nm-bg)",
      color: "var(--nm-text-primary)",
      fontFamily: "var(--font-body)",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    }}>
      <div className="dashboard-nav-area" style={{ flexShrink: 0 }}>
        <DashboardNav role="employer" />
      </div>

      <div className="dashboard-shell" style={{ padding: 'var(--spacing-4)', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <style>{`@media (min-width: 768px) { .dashboard-shell { padding: var(--spacing-4) !important; } }`}</style>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: 16,
          marginBottom: "1rem",
          flexWrap: "wrap",
          flexShrink: 0,
        }}>
          <div>
            <div style={{
              fontFamily: "var(--font-display)",
              fontSize: 14,
              fontWeight: 800,
              color: "var(--nm-text-tertiary)",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              marginBottom: 4
            }}>
              Talent Pipelines
            </div>
            <h1 style={{
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
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
              padding: '8px 16px',
              fontFamily: 'var(--font-display)',
              fontWeight: 900,
              fontSize: 12,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              border: '3px solid var(--nm-ink)'
            }}
          >
            <ArrowLeft size={14} strokeWidth={3} style={{ marginRight: 6, display: 'inline' }} /> Back
          </button>
        </div>

        {loading ? (
          <div style={{ flex: 1, display: 'flex', gap: 'var(--spacing-6)', minHeight: 0 }}>
            <div style={{ width: '35%', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
              {[1, 2, 3].map((i) => (
                <SkCard key={i} style={{ padding: "var(--spacing-4)" }}>
                  <div style={{ display: "flex", gap: "var(--spacing-3)" }}>
                    <div style={{ flex: 1 }}>
                      <SkBox w="60%" h={16} />
                      <div style={{ marginTop: "var(--spacing-1)" }}><SkBox w="40%" h={12} /></div>
                    </div>
                  </div>
                </SkCard>
              ))}
            </div>
            <div style={{ flex: 1, borderLeft: '4px solid var(--nm-ink)', paddingLeft: 'var(--spacing-6)' }}>
              <SkCard style={{ flex: 1 }} />
            </div>
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
          <div style={{ flex: 1, display: 'flex', gap: 'var(--spacing-6)', minHeight: 0 }}>
            <div style={{ width: '620px', flexShrink: 0, overflowY: 'auto', paddingRight: 'var(--spacing-3)' }}>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 11,
                fontWeight: 900,
                color: 'var(--nm-text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '0.75rem',
                paddingBottom: '0.5rem',
                borderBottom: '3px solid var(--nm-ink)',
              }}>
                {applications.length} Applicant{applications.length !== 1 ? 's' : ''}
              </div>

              {selected ? (
                <div>
                  <ApplicantDetail app={selected} onClose={() => setSelected(null)} showMatchScore={false} />
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {applications.map((app) => (
                    <ApplicantCard
                      key={app._id}
                      app={app}
                      onClick={() => setSelected(app)}
                      compact
                      showMatchScore={false}
                    />
                  ))}
                </div>
              )}
            </div>

            <div style={{ flex: 1, minWidth: 0, borderLeft: '4px solid var(--nm-ink)', paddingLeft: 'var(--spacing-6)', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              {selected ? (
                <>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingBottom: '0.5rem',
                    borderBottom: '3px solid var(--nm-ink)',
                    flexShrink: 0,
                    marginBottom: '0.75rem',
                  }}>
                    <div style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 11,
                      fontWeight: 900,
                      color: 'var(--nm-text-tertiary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                    }}>
                      {/* <FileText size={12} strokeWidth={3} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                      CV Document */}
                    </div>
                  </div>
                  <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingRight: '10px' }}>
                    <ApplicationViewer application={selected} showAnalysis={false} />
                  </div>
                </>
              ) : (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: 1,
                  border: '4px dashed var(--nm-ink)',
                  background: 'var(--nm-surface)',
                  padding: '3rem',
                  textAlign: 'center',
                }}>
                  <FileText size={40} strokeWidth={2} style={{ color: 'var(--nm-text-tertiary)', marginBottom: '1rem' }} />
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 900,
                    fontSize: 14,
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
