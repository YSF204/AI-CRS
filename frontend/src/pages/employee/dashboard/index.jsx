import React, { useMemo, useState } from "react";
import {
  Briefcase,
  FileText,
  ChevronRight,
  User,
  TrendingUp,
  AlertCircle,
  Search,
  Plus,
  Edit,
} from "lucide-react";
import { Link } from "react-router-dom";
import DashboardNav from "../../../components/shared/DashboardNav";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../services/api";
import useFetch from "../../../hooks/useFetch";
import DashStatCards from "./components/DashStatCards";
import RecentActivity from "./components/RecentActivity";

export default function EmployeeDash() {
  const { user } = useAuth();
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);

  const { data: cvs = [], loading: cvsLoading, refetch: refetchCVs } = useFetch(
    async () => {
      const res = await api.get("/cvs");
      return res.data?.data?.cvs || [];
    },
    { initialData: [] }
  );

  const { data: applications = [], loading: appsLoading, refetch: refetchApps } = useFetch(
    async () => {
      const res = await api.get("/applications/my-applications");
      return res.data?.data?.applications || [];
    },
    { initialData: [] }
  );

  const { data: jobsData = { jobs: [] }, loading: jobsLoading } = useFetch(
    async () => {
      const res = await api.get("/jobs");
      return res.data?.data || { jobs: [] };
    },
    { initialData: { jobs: [] } }
  );

  const kpiData = useMemo(() => {
    const totalApplications = applications.length;
    const totalCVs = cvs.length;
    const totalJobs = jobsData.jobs?.length || 0;

    const profileFields = [
      { field: 'firstName', weight: 20 },
      { field: 'lastName', weight: 20 },
      { field: 'email', weight: 15 },
      { field: 'telephone', weight: 15, check: (val) => Array.isArray(val) && val.length > 0 },
      { field: 'gender', weight: 10 },
      { field: 'age', weight: 10, check: (val) => val && val > 0 },
      { field: 'profilePic', weight: 10, check: (val) => val && val.length > 0 }
    ];

    let completedScore = 0;
    let totalWeight = 0;

    profileFields.forEach(({ field, weight, check }) => {
      totalWeight += weight;
      const fieldValue = user?.[field];

      let isCompleted = false;
      if (check) {
        isCompleted = check(fieldValue);
      } else {
        isCompleted = fieldValue && fieldValue.toString().trim().length > 0;
      }

      if (isCompleted) {
        completedScore += weight;
      }
    });

    const profileCompletion = Math.round((completedScore / totalWeight) * 100);

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const recentApplications = applications.filter(app =>
      new Date(app.createdAt || app.appliedDate) > oneWeekAgo
    ).length;

    return [
      {
        label: "Total Applications",
        value: totalApplications.toString(),
        change: recentApplications > 0 ? `+${recentApplications} this week` : "No recent applications",
        trend: recentApplications > 0 ? "up" : "stable",
        icon: Briefcase,
        color: "var(--color-primary)",
      },
      {
        label: "Profile Completion",
        value: `${profileCompletion}%`,
        change: profileCompletion < 100 ? "Complete your profile" : "Profile complete",
        trend: profileCompletion < 100 ? "up" : "stable",
        icon: User,
        color: "var(--color-success)",
      },
      {
        label: "CVs Created",
        value: totalCVs.toString(),
        change: totalCVs > 0 ? "Ready to use" : "Create your first CV",
        trend: totalCVs > 0 ? "stable" : "down",
        icon: FileText,
        color: "var(--color-warning)",
      },
      {
        label: "Available Jobs",
        value: totalJobs.toString(),
        change: "Open positions",
        trend: totalJobs > 0 ? "up" : "stable",
        icon: TrendingUp,
        color: "var(--color-danger)",
      },
    ];
  }, [applications, cvs, jobsData.jobs, user]);

  const priorityWorkflows = useMemo(() => {
    const workflows = [];

    const profileFields = [
      { field: 'firstName', weight: 20 },
      { field: 'lastName', weight: 20 },
      { field: 'email', weight: 15 },
      { field: 'telephone', weight: 15, check: (val) => Array.isArray(val) && val.length > 0 },
      { field: 'gender', weight: 10 },
      { field: 'age', weight: 10, check: (val) => val && val > 0 },
      { field: 'profilePic', weight: 10, check: (val) => val && val.length > 0 }
    ];

    let completedScore = 0;
    let totalWeight = 0;

    profileFields.forEach(({ field, weight, check }) => {
      totalWeight += weight;
      const fieldValue = user?.[field];

      let isCompleted = false;
      if (check) {
        isCompleted = check(fieldValue);
      } else {
        isCompleted = fieldValue && fieldValue.toString().trim().length > 0;
      }

      if (isCompleted) {
        completedScore += weight;
      }
    });

    const profileCompletion = Math.round((completedScore / totalWeight) * 100);

    if (cvs.length === 0) {
      workflows.push({
        icon: Plus,
        label: "Create Your First CV",
        description: "Start by creating a professional CV to get job matches",
        href: "/employee/cv-templates",
        priority: "high",
        color: "var(--color-warning)",
      });
    }

    if (profileCompletion < 80) {
      workflows.push({
        icon: Edit,
        label: "Complete Your Profile",
        description: `${Math.round(100 - profileCompletion)}% remaining - add your details`,
        href: "/employee/profile",
        priority: "high",
        color: "var(--color-danger)",
      });
    }

    if (jobsData.jobs?.length > 0 && cvs.length > 0) {
      workflows.push({
        icon: Briefcase,
        label: "Apply to Jobs",
        description: `${jobsData.jobs.length} positions available matching your skills`,
        href: "/employee/jobs",
        priority: "medium",
        color: "var(--color-primary)",
        iconColor: "var(--color-text-inverse)",
      });
    }

    if (cvs.length > 0) {
      const hasSkills = cvs.some(cv => cv.technicalSkills && cv.technicalSkills.length > 0);
      if (!hasSkills) {
        workflows.push({
          icon: FileText,
          label: "Add Skills to Your CV",
          description: "Include your technical skills for better job matches",
          href: "/employee/cvs",
          priority: "low",
          color: "var(--color-success)",
        });
      }
    }

    if (workflows.length === 0) {
      workflows.push({
        icon: Search,
        label: "Explore Job Opportunities",
        description: "Browse and apply to positions that match your profile",
        href: "/employee/jobs",
        priority: "medium",
        color: "var(--color-primary)",
      });
    }

    return workflows.slice(0, 3);
  }, [cvs, jobsData.jobs, user]);


  const isLoading = cvsLoading || appsLoading || jobsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
        <div className="dashboard-nav-area">
          <DashboardNav role="employee" />
        </div>
        <div className="dashboard-shell py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
              <p className="mt-4 text-mono text-sm text-[var(--text-muted)]">
                Loading your dashboard...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const profileFieldsWelcome = [
    { field: 'firstName', weight: 20 },
    { field: 'lastName', weight: 20 },
    { field: 'email', weight: 15 },
    { field: 'telephone', weight: 15, check: (val) => Array.isArray(val) && val.length > 0 },
    { field: 'gender', weight: 10 },
    { field: 'age', weight: 10, check: (val) => val && val > 0 },
    { field: 'profilePic', weight: 10, check: (val) => val && val.length > 0 }
  ];

  let completedScoreWelcome = 0;
  let totalWeightWelcome = 0;

  profileFieldsWelcome.forEach(({ field, weight, check }) => {
    totalWeightWelcome += weight;
    const fieldValue = user?.[field];

    let isCompleted = false;
    if (check) {
      isCompleted = check(fieldValue);
    } else {
      isCompleted = fieldValue && fieldValue.toString().trim().length > 0;
    }

    if (isCompleted) {
      completedScoreWelcome += weight;
    }
  });

  const profileCompletionWelcome = Math.round((completedScoreWelcome / totalWeightWelcome) * 100);
  const userName = user?.firstName || user?.fullName?.split(' ')[0] || 'User';

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <div className="dashboard-nav-area">
        <DashboardNav role="employee" />
      </div>

      <div className="dashboard-shell py-8">
        <section className="mb-8">
          <div className="workflow-card p-8 bg-[var(--card-bg)] flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex-1">
              <p className="text-mono text-xs uppercase tracking-widest text-[var(--color-text-secondary)] mb-2">
                Welcome Back, {userName}
              </p>
              <h1 className="text-display-md text-[var(--text-primary)] mb-3">
                {profileCompletionWelcome < 50
                  ? "Let's complete your profile first"
                  : cvs.length === 0
                    ? "Create your CV to start applying"
                    : "Ready to find your next opportunity?"}
              </h1>
              <p className="text-body text-[var(--text-muted)] max-w-xl leading-relaxed">
                {profileCompletionWelcome < 100
                  ? `Your profile is ${profileCompletionWelcome}% complete. Finish it to get better job matches.`
                  : "Your profile is complete. Discover amazing job opportunities tailored to your skills and experience."}
              </p>
            </div>
            <Link
              to="/employee/jobs"
              className="paper-btn px-8 py-4 self-start md:self-center flex items-center gap-2 text-lg"
            >
              <Search size={20} />
              Find Jobs
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
