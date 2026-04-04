import React from "react";
import { Briefcase, FileText, ChevronRight, User } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardNav from "../../components/shared/DashboardNav";

const QUICK_ACTIONS = [
  {
    icon: FileText,
    label: "MY CVS",
    sub: "Edit your resumes",
    href: "/employee/cvs",
    btnLabel: "EDIT",
    btnColor: "var(--mint)",
  },
  {
    icon: Briefcase,
    label: "APPLICATIONS",
    sub: "Track your status",
    href: "/employee/applications",
    btnLabel: "TRACK",
    btnColor: "var(--teal)",
  },
  {
    icon: FileText,
    label: "FIND BY CV",
    sub: "Search jobs using your CV",
    href: "/employee/find-job-by-cv",
    btnLabel: "SEARCH",
    btnColor: "var(--yellow)",
  },
  {
    icon: User,
    label: "PROFILE",
    sub: "Manage your info",
    href: "/employee/profile",
    btnLabel: "VIEW",
    btnColor: "var(--blue)",
  },
];

export default function EmployeeDash() {
  return (
    <div className="min-h-screen p-8 bg-(--bg) text-(--fg)">
      <div className="dashboard-shell">
        <DashboardNav role="employee" />

        <div className="grid grid-cols-1 gap-8 max-w-full">
          {/* ── Welcome hero card ── */}
          <div className="brutal-card p-10 bg-(--card-bg) flex flex-col justify-center min-h-[320px] border-4 border-black">
            <p className="font-mono text-xs uppercase tracking-widest text-(--fg-muted) mb-2">
              Welcome Back
            </p>
            <h1 className="text-5xl mb-4 font-['Space_Grotesk'] font-bold uppercase tracking-tight leading-tight">
              ready to explore?
            </h1>
            <p className="font-mono text-sm text-(--fg-muted) mb-8 max-w-md leading-relaxed">
              Discover amazing job opportunities tailored to your skills and
              experience. Start your journey today!
            </p>
            <Link
              to="/employee/jobs"
              className="brutal-btn px-8 py-4 font-bold self-start flex items-center gap-2 text-lg no-underline"
              style={{
                background: "var(--yellow)",
                color: "#0a0a0a",
                border: "4px solid #0a0a0a",
                textDecoration: "none",
              }}
            >
              FIND JOBS
              <ChevronRight size={20} />
            </Link>
          </div>

          {/* ── Quick-action cards grid ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {QUICK_ACTIONS.map(
              ({ icon: Icon, label, sub, href, btnLabel, btnColor }) => (
                <Link
                  key={href}
                  to={href}
                  className="brutal-card p-8 bg-(--card-bg) flex flex-col justify-between min-h-[240px] hover:shadow-lg transition-all border-4 border-black"
                >
                  {/* Icon + text */}
                  <div className="flex flex-col gap-4 flex-1">
                    <div
                      className="w-16 h-16 flex items-center justify-center border-4 border-black shrink-0"
                      style={{ background: btnColor }}
                    >
                      <Icon size={32} color="#0a0a0a" strokeWidth={2} />
                    </div>
                    <div>
                      <p className="font-bold font-['Space_Grotesk'] text-lg uppercase tracking-tight mb-1">
                        {label}
                      </p>
                      <p className="font-mono text-sm text-(--fg-muted)">
                        {sub}
                      </p>
                    </div>
                  </div>

                  {/* Button — bottom */}
                  <button
                    className="brutal-btn px-6 py-3 font-bold text-base uppercase w-full"
                    style={{
                      background: btnColor,
                      color: "#0a0a0a",
                      border: "3px solid #0a0a0a",
                    }}
                  >
                    {btnLabel}
                  </button>
                </Link>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
