import React, { useMemo } from "react";
import {
  Briefcase,
  FileText,
  ChevronRight,
  User,
  TrendingUp,
  Search,
  Plus,
  Edit,
} from "lucide-react";
import { Link } from "react-router-dom";
import DashboardNav from "../../../components/shared/DashboardNav";
import { useAuth } from "../../../context/AuthContext";
import { useTranslation } from "../../../context/LanguageContext";
import useFetch from "../../../hooks/useFetch";
import useEmployeeDash from "../../../hooks/useEmployeeDash";
import { calcProfileCompletion } from "../../../utils/profileCompletion";
import DashStatCards from "./components/DashStatCards";
import RecentActivity from "./components/RecentActivity";
import { SkStatCard, SkCard } from "../../../components/ui/Skeleton";

export default function EmployeeDash() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { fetchAll } = useEmployeeDash();

  const {
    data: dashData,
    loading,
  } = useFetch(fetchAll, { initialData: { cvs: [], applications: [], jobs: [] } });

  const { cvs = [], applications = [], jobs = [] } = dashData;
  const profileCompletion = calcProfileCompletion(user);
  const userName = user?.firstName || user?.fullName?.split(" ")[0] || "User";

  const kpiData = useMemo(() => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const recentApplications = applications.filter(
      (app) => new Date(app.createdAt || app.appliedDate) > oneWeekAgo,
    ).length;

    return [
      {
        label: t("employeeDashboard.totalApplications"),
        value: applications.length.toString(),
        change:
          recentApplications > 0
            ? t("employeeDashboard.recentAppsThisWeek", { count: recentApplications })
            : t("employeeDashboard.noRecentApps"),
        trend: recentApplications > 0 ? "up" : "stable",
        icon: Briefcase,
        color: "var(--color-primary)",
      },
      {
        label: t("employeeDashboard.profileCompletion"),
        value: `${profileCompletion}%`,
        change:
          profileCompletion < 100
            ? t("employeeDashboard.completeYourProfile")
            : t("employeeDashboard.profileComplete"),
        trend: profileCompletion < 100 ? "up" : "stable",
        icon: User,
        color: "var(--color-success)",
      },
      {
        label: t("employeeDashboard.cvsCreated"),
        value: cvs.length.toString(),
        change: cvs.length > 0 ? t("employeeDashboard.readyToUse") : t("employeeDashboard.createYourFirstCv"),
        trend: cvs.length > 0 ? "stable" : "down",
        icon: FileText,
        color: "var(--color-warning)",
      },
      {
        label: t("employeeDashboard.availableJobs"),
        value: jobs.length.toString(),
        change: t("employeeDashboard.openPositions"),
        trend: jobs.length > 0 ? "up" : "stable",
        icon: TrendingUp,
        color: "var(--color-danger)",
      },
    ];
  }, [applications, cvs, jobs, profileCompletion, t]);

  const priorityWorkflows = useMemo(() => {
    const workflows = [];

    if (cvs.length === 0) {
      workflows.push({
        icon: Plus,
        label: t("employeeDashboard.createYourFirstCv"),
        description: t("employeeDashboard.createCvPriorityDesc"),
        href: "/employee/cv-templates",
        priority: "high",
        color: "var(--color-warning)",
      });
    }

    if (profileCompletion < 80) {
      workflows.push({
        icon: Edit,
        label: t("employeeDashboard.completeYourProfile"),
        description: t("employeeDashboard.completeProfilePriorityDesc", { percent: Math.round(100 - profileCompletion) }),
        href: "/employee/profile",
        priority: "high",
        color: "var(--color-danger)",
      });
    }

    if (jobs.length > 0 && cvs.length > 0) {
      workflows.push({
        icon: Briefcase,
        label: t("employeeDashboard.findJobs"),
        description: t("employeeDashboard.applyToJobsPriorityDesc", { count: jobs.length }),
        href: "/employee/jobs",
        priority: "medium",
        color: "var(--color-primary)",
        iconColor: "var(--color-text-inverse)",
      });
    }

    if (cvs.length > 0) {
      const hasSkills = cvs.some(
        (cv) => cv.technicalSkills && cv.technicalSkills.length > 0,
      );
      if (!hasSkills) {
        workflows.push({
          icon: FileText,
          label: t("employeeDashboard.addSkillsToCv"),
          description: t("employeeDashboard.addSkillsPriorityDesc"),
          href: "/employee/cvs",
          priority: "low",
          color: "var(--color-success)",
        });
      }
    }

    if (workflows.length === 0) {
      workflows.push({
        icon: Search,
        label: t("employeeDashboard.exploreOpportunity"),
        description: t("employeeDashboard.exploreOpportunityDesc"),
        href: "/employee/jobs",
        priority: "medium",
        color: "var(--color-primary)",
      });
    }

    return workflows.slice(0, 3);
  }, [cvs, jobs, profileCompletion, t]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
        <div className="dashboard-nav-area">
          <DashboardNav role="employee" />
        </div>
        <div className="dashboard-shell py-8">
          <section className="mb-8">
            <SkCard style={{ padding: "var(--spacing-6)" }}>
              <div style={{ display: "flex", gap: "var(--spacing-4)", alignItems: "center" }}>
                <div className="sk" style={{ width: 48, height: 48, borderRadius: 0 }} />
                <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                  <div className="sk" style={{ width: "60%", height: 12 }} />
                  <div className="sk" style={{ width: "40%", height: 24 }} />
                </div>
              </div>
            </SkCard>
          </section>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(1, minmax(0, 1fr))", gap: "var(--spacing-4)" }}>
            <style>{`@media(min-width:640px){.emp-dash-sk-grid{grid-template-columns:repeat(2,1fr)}}@media(min-width:1024px){.emp-dash-sk-grid{grid-template-columns:repeat(4,1fr)}}`}</style>
            <div className="emp-dash-sk-grid" style={{ display: "grid", gap: "var(--spacing-4)" }}>
              {[1, 2, 3, 4].map((i) => <SkStatCard key={i} />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <div className="dashboard-nav-area">
        <DashboardNav role="employee" />
      </div>

      <div className="dashboard-shell py-8">
        <section className="mb-8">
          <div className="workflow-card p-6 sm:p-8 bg-[var(--card-bg)] flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex-1">
              <p className="text-mono text-xs uppercase tracking-widest text-[var(--color-text-secondary)] mb-2">
                {t("employeeDashboard.welcomeBack", { name: userName })}
              </p>
              <h1 className="text-display-md text-[var(--text-primary)] mb-3">
                {profileCompletion < 50
                  ? t("employeeDashboard.completeProfileFirst")
                  : cvs.length === 0
                    ? t("employeeDashboard.createCvFirst")
                    : t("employeeDashboard.readyToFind")}
              </h1>
              <p className="text-body text-[var(--text-muted)] max-w-xl leading-relaxed">
                {profileCompletion < 100
                  ? t("employeeDashboard.profileCompletionDesc", { percent: profileCompletion })
                  : t("employeeDashboard.profileCompleteDesc")}
              </p>
            </div>
            <Link
              to="/employee/jobs"
              className="paper-btn px-8 py-4 self-start md:self-center flex items-center gap-2 text-lg"
            >
              <Search size={20} />
              {t("employeeDashboard.findJobs")}
              <ChevronRight size={20} />
            </Link>
          </div>
        </section>

        <DashStatCards kpiData={kpiData} />
        <RecentActivity priorityWorkflows={priorityWorkflows} />
      </div>
    </div>
  );
}
