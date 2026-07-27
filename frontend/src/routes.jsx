import React, { Suspense } from "react";
import { createBrowserRouter, Link, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import RootLayout from "./components/layout/RootLayout";
import RouteError from "./components/layout/RouteError";

const DynamicRoot = React.lazy(() => import("./pages/DynamicRoot"));
const AuthPage = React.lazy(() => import("./pages/public/auth/AuthPage"));
const ClerkOAuthCallback = React.lazy(() => import("./pages/public/auth/ClerkOAuthCallback"));
const VerifyEmailPage = React.lazy(() => import("./pages/public/auth/VerifyEmailPage"));
const ForgotPasswordPage = React.lazy(() => import("./pages/public/auth/ForgotPasswordPage"));
const ResetPasswordPage = React.lazy(() => import("./pages/public/auth/ResetPasswordPage"));
const PendingActivation = React.lazy(() => import("./pages/employer/PendingActivation"));

const AdminDash = React.lazy(() => import("./pages/admin/dashboard"));
const AdminProfile = React.lazy(() => import("./pages/admin/admin-profile"));
const UserDelete = React.lazy(() => import("./pages/admin/UserDelete"));
const UserManagement = React.lazy(() => import("./pages/admin/user-management"));
const UserProfile = React.lazy(() => import("./pages/admin/user-profile"));

const EmployeeDash = React.lazy(() => import("./pages/employee/dashboard"));
const Jobs = React.lazy(() => import("./pages/employee/jobs"));
const JobDetails = React.lazy(() => import("./pages/employee/JobDetails"));
const Applications = React.lazy(() => import("./pages/employee/applications"));
const FindJobByCV = React.lazy(() => import("./pages/employee/find-job-by-cv"));
const ATSScore = React.lazy(() => import("./pages/employee/ATSScore"));
const ApplyJob = React.lazy(() => import("./pages/employee/apply-job"));
const CVs = React.lazy(() => import("./pages/employee/cvs"));
const CVTemplates = React.lazy(() => import("./pages/employee/cv-templates"));
const CVEditor = React.lazy(() => import("./pages/employee/cv-editor"));
const Profile = React.lazy(() => import("./pages/employee/Profile"));

const EmployerDash = React.lazy(() => import("./pages/employer/EmployerDash"));
const PostJob = React.lazy(() => import("./pages/employer/post-job"));
const EditJob = React.lazy(() => import("./pages/employer/edit-job"));
const ManageJobs = React.lazy(() => import("./pages/employer/ManageJobs"));
const JobApplications = React.lazy(() => import("./pages/employer/job-applications"));
const FindTalent = React.lazy(() => import("./pages/employer/find-talent"));
const CompanyProfile = React.lazy(() => import("./pages/employer/company-profile"));

function PageLoader() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--nm-bg, #fff)",
        padding: "clamp(1.5rem, 5%, 4rem)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--spacing-6, 24px)",
        maxWidth: 960,
        margin: "0 auto",
      }}
    >
      <div style={{ display: "flex", gap: "var(--spacing-3, 12px)", alignItems: "center" }} aria-hidden="true">
        <div className="sk" style={{ width: 48, height: 48 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div className="sk" style={{ width: 160, height: 20 }} />
          <div className="sk" style={{ width: 100, height: 12 }} />
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "var(--spacing-4, 16px)" }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="sk-card" style={{ height: 140 }} />
        ))}
      </div>
      <div className="sk-card" style={{ height: 240 }} />
    </div>
  );
}

function Lazy({ children }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

function NotFound() {
  return (
    <div style={{ textAlign: "center", marginTop: "4rem" }}>
      <h1>404 - Page Not Found</h1>
      <Link to="/">Go to Home</Link>
    </div>
  );
}

function protect(role, Component) {
  return (
    <ProtectedRoute allowedRoles={[role]}>
      <Lazy>
        <Component />
      </Lazy>
    </ProtectedRoute>
  );
}

const adminRoutes = [
  { path: "/admin", element: protect("ADMIN", AdminDash) },
  { path: "/admin/profile", element: protect("ADMIN", AdminProfile) },
  { path: "/admin/users", element: protect("ADMIN", UserManagement) },
  { path: "/admin/users/new", element: protect("ADMIN", UserProfile) },
  { path: "/admin/users/:id", element: protect("ADMIN", UserProfile) },
  { path: "/admin/users/:id/edit", element: protect("ADMIN", UserProfile) },
  { path: "/admin/users/:id/delete", element: protect("ADMIN", UserDelete) },
];

const employeeRoutes = [
  {
    path: "/employee",
    element: (
      <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
        <Navigate to="/employee/cvs" replace />
      </ProtectedRoute>
    ),
  },
  { path: "/employee/dashboard", element: protect("EMPLOYEE", EmployeeDash) },
  { path: "/employee/jobs", element: protect("EMPLOYEE", Jobs) },
  { path: "/employee/jobs/:jobId", element: protect("EMPLOYEE", JobDetails) },
  { path: "/employee/applications", element: protect("EMPLOYEE", Applications) },
  { path: "/employee/find-job-by-cv", element: protect("EMPLOYEE", FindJobByCV) },
  { path: "/employee/ats-score", element: protect("EMPLOYEE", ATSScore) },
  { path: "/employee/apply-job/:jobId", element: protect("EMPLOYEE", ApplyJob) },
  { path: "/employee/cvs", element: protect("EMPLOYEE", CVs) },
  { path: "/employee/cv-templates", element: protect("EMPLOYEE", CVTemplates) },
  { path: "/employee/cv-editor/:id", element: protect("EMPLOYEE", CVEditor) },
  { path: "/employee/profile", element: protect("EMPLOYEE", Profile) },
];

const employerRoutes = [
  { path: "/employer", element: protect("EMPLOYER", EmployerDash) },
  { path: "/employer/post-job", element: protect("EMPLOYER", PostJob) },
  { path: "/employer/edit-job/:id", element: protect("EMPLOYER", EditJob) },
  { path: "/employer/jobs", element: protect("EMPLOYER", ManageJobs) },
  { path: "/employer/jobs/:jobId/applications", element: protect("EMPLOYER", JobApplications) },
  { path: "/employer/search", element: protect("EMPLOYER", FindTalent) },
  { path: "/employer/profile", element: protect("EMPLOYER", CompanyProfile) },
];

const publicRoutes = [
  {
    path: "/",
    element: (
      <Lazy>
        <DynamicRoot />
      </Lazy>
    ),
  },
  {
    path: "/auth",
    element: (
      <Lazy>
        <AuthPage />
      </Lazy>
    ),
  },
  {
    path: "/sso-callback",
    element: (
      <Lazy>
        <ClerkOAuthCallback />
      </Lazy>
    ),
  },
  {
    path: "/verify-email/:token",
    element: (
      <Lazy>
        <VerifyEmailPage />
      </Lazy>
    ),
  },
  {
    path: "/forgot-password",
    element: (
      <Lazy>
        <ForgotPasswordPage />
      </Lazy>
    ),
  },
  {
    path: "/reset-password",
    element: (
      <Lazy>
        <ResetPasswordPage />
      </Lazy>
    ),
  },
  {
    path: "/pending",
    element: (
      <Lazy>
        <PendingActivation />
      </Lazy>
    ),
  },
  { path: "*", element: <NotFound /> },
];

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <RouteError />,
    children: [
      ...publicRoutes,
      ...adminRoutes,
      ...employeeRoutes,
      ...employerRoutes,
    ],
  },
]);
