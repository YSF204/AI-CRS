import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--fg)", padding: "clamp(1.5rem, 4%, 2.5rem)" }}>
      <div className="dashboard-shell">
        <DashboardNav role="employer" />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Candidates
            </div>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: "clamp(2rem, 4vw, 3rem)", letterSpacing: "-0.04em", margin: 0 }}>
              {job ? job.position : "Job Applications"}
            </h1>
          </div>
          <button
            onClick={() => navigate("/employer/jobs")}
            className="brutal-btn px-4 py-2 font-bold uppercase tracking-wider"
            style={{ background: "var(--teal)", color: "#0a0a0a" }}
          >
            Back to Jobs
          </button>
        </div>

        {loading ? (
          <div className="brutal-card p-6 border-[3px] border-[var(--border-color)] shadow-[6px_6px_0_var(--shadow-color)] font-mono">
            Loading applications...
          </div>
        ) : applications.length === 0 ? (
          <div className="brutal-card p-6 border-[3px] border-[var(--border-color)] shadow-[6px_6px_0_var(--shadow-color)] font-mono">
            No applications yet.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {applications.map((app) => (
              <div
                key={app._id}
                className="brutal-card p-4 border-[3px] border-[var(--border-color)] shadow-[6px_6px_0_var(--shadow-color)] bg-[var(--card-bg)] cursor-pointer hover:translate-x-[2px] hover:translate-y-[2px] transition-transform"
                onClick={() => setSelected(app)}
              >
                <div className="font-['Space_Grotesk'] font-black text-lg">{app.applicantInfo?.fullName || "Candidate"}</div>
                <div className="font-mono text-xs text-[var(--fg-muted)] mt-1">{app.applicantInfo?.email}</div>
                <div className="mt-2 font-mono text-sm">
                  Method: {app.applicationMethod} • Match: {app.matchPercentage ?? "—"}%
                </div>
                <div className="mt-1 font-mono text-xs text-[var(--fg-muted)]">
                  Submitted: {new Date(app.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 overflow-y-auto">
          <div className="brutal-card bg-[var(--bg)] w-full max-w-5xl relative border-[6px] border-black shadow-[16px_16px_0px_0px_#000] p-6">
            <button
              onClick={() => setSelected(null)}
              className="absolute top-3 right-3 brutal-btn px-3 py-2 font-bold uppercase tracking-wider"
              style={{ background: "var(--coral)", color: "#0a0a0a" }}
            >
              Close
            </button>
            <ApplicationViewer application={selected} />
          </div>
        </div>
      )}
    </div>
  );
}
