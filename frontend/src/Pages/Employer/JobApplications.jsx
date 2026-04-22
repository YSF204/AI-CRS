import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import DashboardNav from "../../components/shared/DashboardNav";
import api from "../../services/api";
import ApplicationViewer from "../../components/applications/ApplicationViewer";

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
          marginBottom: "3.5rem", 
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
              fontSize: "clamp(2.5rem, 6vw, 4rem)", 
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
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
            gap: '2rem' 
          }}>
            {applications.map((app) => (
              <div
                key={app._id}
                className="nm-card"
                style={{
                  background: 'var(--nm-surface)',
                  borderWidth: '4px',
                  boxShadow: '6px 6px 0 var(--nm-ink)',
                  padding: '2rem',
                  cursor: 'pointer',
                  borderRadius: '0px',
                  transition: 'transform 0.2s ease'
                }}
                onClick={() => setSelected(app)}
                onMouseEnter={e => e.currentTarget.style.transform = 'translate(-4px, -4px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                <div style={{ 
                  fontFamily: 'var(--font-display)', 
                  fontWeight: 900, 
                  fontSize: 24, 
                  color: 'var(--nm-text-primary)',
                  textTransform: 'uppercase',
                  letterSpacing: '-0.02em',
                  marginBottom: 8
                }}>
                  {app.applicantInfo?.fullName || "ENTITY UNIDENTIFIED"}
                </div>
                <div style={{ 
                  fontFamily: 'var(--font-display)', 
                  fontSize: 12, 
                  fontWeight: 800,
                  color: 'var(--nm-text-tertiary)', 
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  {app.applicantInfo?.email || "DATA MASKED"}
                </div>
                
                <div style={{ 
                  marginTop: 24, 
                  background: 'var(--nm-bg)', 
                  border: '3px solid var(--nm-ink)', 
                  padding: '12px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 13, color: 'var(--nm-text-primary)' }}>
                    MATCH SCORE
                  </div>
                  <div style={{ 
                    fontFamily: 'var(--font-display)', 
                    fontWeight: 900, 
                    fontSize: 24, 
                    color: app.matchPercentage > 80 ? 'var(--nm-success)' : 'var(--nm-warning)' 
                  }}>
                    {app.matchPercentage ?? "—"}%
                  </div>
                </div>

                <div style={{ 
                  marginTop: 16, 
                  fontFamily: 'var(--font-display)', 
                  fontSize: 11, 
                  fontWeight: 800,
                  color: 'var(--nm-text-tertiary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em'
                }}>
                  INTAKE: {new Date(app.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div style={{ 
          position: "fixed", 
          inset: 0, 
          zIndex: 1005, 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          background: "rgba(0,0,0,0.85)", 
          backdropFilter: "blur(12px)", 
          padding: "2rem" 
        }}>
          <div 
            className="nm-card"
            style={{ 
              background: "var(--nm-bg)", 
              width: "100%", 
              maxW: "1200px", 
              maxHeight: "90vh", 
              overflowY: "auto", 
              position: "relative", 
              borderWidth: "6px", 
              boxShadow: "20px 20px 0 #000", 
              padding: "3rem",
              borderRadius: '0px'
            }}
          >
            <div style={{ 
              position: "sticky", 
              top: 0, 
              zIndex: 10, 
              display: "flex", 
              justifyContent: "flex-end", 
              marginBottom: "2rem", 
              background: "var(--nm-bg)", 
              paddingBottom: "1.5rem", 
              borderBottom: "4px solid var(--nm-ink)" 
            }}>
              <button
                onClick={() => setSelected(null)}
                className="nm-btn"
                style={{ 
                  background: "var(--nm-error)", 
                  color: "#fff",
                  padding: '10px 24px',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 900,
                  fontSize: 14,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em'
                }}
              >
                CLOSE DOSSIER
              </button>
            </div>
            <ApplicationViewer application={selected} />
          </div>
        </div>
      )}
    </div>
  );
}
