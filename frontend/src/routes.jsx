import { createBrowserRouter, Link, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import RootLayout from "./components/layout/RootLayout";
import RouteError from "./components/layout/RouteError";
import AdminDash from "./Pages/Admin/AdminDash";
import AdminProfile from "./Pages/Admin/AdminProfile";
import UserDelete from "./Pages/Admin/UserDelete";
import UserManagement from "./Pages/Admin/UserManagement";
import UserProfile from "./Pages/Admin/UserProfile";
import DynamicRoot from "./Pages/DynamicRoot";
import Applications from "./Pages/Employee/applications";
import CVs from "./Pages/Employee/cvs";
import CVTemplates from "./Pages/Employee/CVTemplates";
import CVEditor from "./Pages/Employee/CVEditor";

import Jobs from "./Pages/Employee/jobs";
import JobDetails from "./Pages/Employee/JobDetails";
import ApplyJob from "./Pages/Employee/ApplyJob";
import FindJobByCV from "./Pages/Employee/FindJobByCV";
import ATSScore from "./Pages/Employee/ATSScore";
import Profile from "./Pages/Employee/Profile";
import CompanyProfile from "./Pages/Employer/CompanyProfile";
import EditJob from "./Pages/Employer/EditJob";
import EmployerDash from "./Pages/Employer/EmployerDash";
import FindTalent from "./Pages/Employer/FindTalent";
import ManageJobs from "./Pages/Employer/ManageJobs";
import JobApplications from "./Pages/Employer/JobApplications";
import PendingActivation from "./Pages/Employer/PendingActivation";
import PostJob from "./Pages/Employer/PostJob";
import AuthPage from "./Pages/Public/Auth/AuthPage";
import VerifyEmailPage from "./Pages/Public/Auth/VerifyEmailPage";
import ForgotPasswordPage from "./Pages/Public/Auth/ForgotPasswordPage";
import ResetPasswordPage from "./Pages/Public/Auth/ResetPasswordPage";

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
