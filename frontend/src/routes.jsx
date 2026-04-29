import { createBrowserRouter, Link, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import RootLayout from "./components/layout/RootLayout";
import RouteError from "./components/layout/RouteError";
import AdminDash from "./pages/admin/dashboard";
import AdminProfile from "./pages/admin/admin-profile";
import UserDelete from "./pages/admin/UserDelete";
import UserManagement from "./pages/admin/user-management";
import UserProfile from "./pages/admin/user-profile";
import DynamicRoot from "./pages/DynamicRoot";
import Applications from "./pages/employee/applications";
import CVs from "./pages/employee/cvs";
import CVTemplates from "./pages/employee/cv-templates";
import CVEditor from "./pages/employee/cv-editor";

import Jobs from "./pages/employee/jobs";
import JobDetails from "./pages/employee/JobDetails";
import ApplyJob from "./pages/employee/apply-job";
import FindJobByCV from "./pages/employee/find-job-by-cv";
import ATSScore from "./pages/employee/ATSScore";
import EmployeeDash from "./pages/employee/dashboard";
import Profile from "./pages/employee/Profile";
import CompanyProfile from "./pages/employer/company-profile";
import EditJob from "./pages/employer/edit-job";
import EmployerDash from "./pages/employer/EmployerDash";
import FindTalent from "./pages/employer/find-talent";
import ManageJobs from "./pages/employer/ManageJobs";
import JobApplications from "./pages/employer/job-applications";
import PendingActivation from "./pages/employer/PendingActivation";
import PostJob from "./pages/employer/post-job";
import AuthPage from "./pages/public/auth/AuthPage";
import VerifyEmailPage from "./pages/public/auth/VerifyEmailPage";
import ForgotPasswordPage from "./pages/public/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/public/auth/ResetPasswordPage";

function NotFound() {
  return (
    <div style={{ textAlign: "center", marginTop: "4rem" }}>
      <h1>404 - Page Not Found</h1>
      <Link to="/">Go to Home</Link>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <RouteError />,
    children: [
      {
        path: "/",
        element: (
          <DynamicRoot />
        ),
      },
      {
        path: "/auth",
        element: (
          <AuthPage />
        ),
      },
      {
        path: "/verify-email/:token",
        element: (
          <VerifyEmailPage />
        ),
      },
      {
        path: "/forgot-password",
        element: (
          <ForgotPasswordPage />
        ),
      },
      {
        path: "/reset-password",
        element: (
          <ResetPasswordPage />
        ),
      },
      {
        path: "/admin",
        element: (
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminDash />
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/profile",
        element: (
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminProfile />
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/users",
        element: (
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <UserManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/users/new",
        element: (
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <UserProfile />
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/users/:id",
        element: (
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <UserProfile />
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/users/:id/edit",
        element: (
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <UserProfile />
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/users/:id/delete",
        element: (
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <UserDelete />
          </ProtectedRoute>
        ),
      },
      {
        path: "/employee",
        element: (
          <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
            <Navigate to="/employee/cvs" replace />
          </ProtectedRoute>
        ),
      },
      {
        path: "/employee/dashboard",
        element: (
          <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
            <EmployeeDash />
          </ProtectedRoute>
        ),
      },
      {
        path: "/employee/jobs",
        element: (
          <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
            <Jobs />
          </ProtectedRoute>
        ),
      },
      {
        path: "/employee/jobs/:jobId",
        element: (
          <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
            <JobDetails />
          </ProtectedRoute>
        ),
      },
      {
        path: "/employee/applications",
        element: (
          <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
            <Applications />
          </ProtectedRoute>
        ),
      },
      {
        path: "/employee/find-job-by-cv",
        element: (
          <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
            <FindJobByCV />
          </ProtectedRoute>
        ),
      },
      {
        path: "/employee/ats-score",
        element: (
          <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
            <ATSScore />
          </ProtectedRoute>
        ),
      },
      {
        path: "/employee/apply-job/:jobId",
        element: (
          <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
            <ApplyJob />
          </ProtectedRoute>
        ),
      },
      {
        path: "/employee/cvs",
        element: (
          <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
            <CVs />
          </ProtectedRoute>
        ),
      },
      {
        path: "/employee/cv-templates",
        element: (
          <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
            <CVTemplates />
          </ProtectedRoute>
        ),
      },
      {
        path: "/employee/cv-editor/:id",
        element: (
          <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
            <CVEditor />
          </ProtectedRoute>
        ),
      },
      {
        path: "/employee/profile",
        element: (
          <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: "/employer",
        element: (
          <ProtectedRoute allowedRoles={["EMPLOYER"]}>
            <EmployerDash />
          </ProtectedRoute>
        ),
      },
      {
        path: "/employer/post-job",
        element: (
          <ProtectedRoute allowedRoles={["EMPLOYER"]}>
            <PostJob />
          </ProtectedRoute>
        ),
      },
      {
        path: "/employer/edit-job/:id",
        element: (
          <ProtectedRoute allowedRoles={["EMPLOYER"]}>
            <EditJob />
          </ProtectedRoute>
        ),
      },
      {
        path: "/employer/jobs",
        element: (
          <ProtectedRoute allowedRoles={["EMPLOYER"]}>
            <ManageJobs />
          </ProtectedRoute>
        ),
      },
      {
        path: "/employer/jobs/:jobId/applications",
        element: (
          <ProtectedRoute allowedRoles={["EMPLOYER"]}>
            <JobApplications />
          </ProtectedRoute>
        ),
      },
      {
        path: "/employer/search",
        element: (
          <ProtectedRoute allowedRoles={["EMPLOYER"]}>
            <FindTalent />
          </ProtectedRoute>
        ),
      },
      {
        path: "/employer/profile",
        element: (
          <ProtectedRoute allowedRoles={["EMPLOYER"]}>
            <CompanyProfile />
          </ProtectedRoute>
        ),
      },
      {
        path: "/pending",
        element: (
          <PendingActivation />
        ),
      },
      {
        path: "*",
        element: (
          <NotFound />
        ),
      },
    ],
  },
]);
