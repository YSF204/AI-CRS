import { createBrowserRouter, Link } from 'react-router-dom';
import { PageTransition } from './components/layout/PageTransition';
import RootLayout from './components/layout/RootLayout';
import AuthPage from './Pages/Public/Auth/AuthPage';
import DynamicRoot from './Pages/DynamicRoot';
import PendingActivation from './Pages/Employer/PendingActivation';
import AdminDash from './Pages/Admin/AdminDash';
import EmployeeDash from './Pages/Employee/EmployeeDash';
import Jobs from './Pages/Employee/jobs';
import Applications from './Pages/Employee/applications';
import CVs from './Pages/Employee/cvs';
import Profile from './Pages/Employee/Profile';
import EmployerDash from './Pages/Employer/EmployerDash';
import PostJob from './Pages/Employer/PostJob';
import EditJob from './Pages/Employer/EditJob';
import ManageJobs from './Pages/Employer/ManageJobs';
import CompanyProfile from './Pages/Employer/CompanyProfile';
import FindTalent from './Pages/Employer/FindTalent';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Not Found page (inline since no dedicated file exists yet)
function NotFound() {
  return (
    <div style={{ textAlign: "center", marginTop: "4rem" }}>
      <h1>404 – Page Not Found</h1>
      <Link to="/">Go to Home</Link>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />, // provides AnimatePresence wrapper for all routes
    children: [
      {
        path: "/",
        element: (
          <PageTransition>
            <DynamicRoot />
          </PageTransition>
        ),
      },
      {
        path: "/auth",
        element: (
          <PageTransition>
            <AuthPage />
          </PageTransition>
        ),
      },
      {
        path: "/admin",
        element: (
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <PageTransition>
              <AdminDash />
            </PageTransition>
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/users",
        element: (
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <PageTransition>
              <UserManagement />
            </PageTransition>
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/users/new",
        element: (
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <PageTransition>
              <UserProfile />
            </PageTransition>
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/users/:id",
        element: (
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <PageTransition>
              <UserProfile />
            </PageTransition>
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/users/:id/edit",
        element: (
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <PageTransition>
              <UserProfile />
            </PageTransition>
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/users/:id/delete",
        element: (
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <PageTransition>
              <UserDelete />
            </PageTransition>
          </ProtectedRoute>
        ),
      },
      {
        path: "/employee",
        element: (
          <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
            <PageTransition>
              <EmployeeDash />
            </PageTransition>
          </ProtectedRoute>
        ),
      },
      {
        path: "/employer",
        path: '/employee/jobs',
        element: (
          <ProtectedRoute allowedRoles={['EMPLOYEE']}>
            <PageTransition>
              <Jobs />
            </PageTransition>
          </ProtectedRoute>
        ),
      },
      {
        path: '/employee/applications',
        element: (
          <ProtectedRoute allowedRoles={['EMPLOYEE']}>
            <PageTransition>
              <Applications />
            </PageTransition>
          </ProtectedRoute>
        ),
      },
      {
        path: '/employee/cvs',
        element: (
          <ProtectedRoute allowedRoles={['EMPLOYEE']}>
            <PageTransition>
              <CVs />
            </PageTransition>
          </ProtectedRoute>
        ),
      },
      {
        path: '/employee/profile',
        element: (
          <ProtectedRoute allowedRoles={['EMPLOYEE']}>
            <PageTransition>
              <Profile />
            </PageTransition>
          </ProtectedRoute>
        ),
      },
      {
        path: '/employer',
        element: (
          <ProtectedRoute allowedRoles={["EMPLOYER"]}>
            <PageTransition>
              <EmployerDash />
            </PageTransition>
          </ProtectedRoute>
        ),
      },
      {
        path: "/pending",
        path: '/employer/post-job',
        element: (
          <ProtectedRoute allowedRoles={['EMPLOYER']}>
            <PageTransition>
              <PostJob />
            </PageTransition>
          </ProtectedRoute>
        ),
      },
      {
        path: '/employer/edit-job/:id',
        element: (
          <ProtectedRoute allowedRoles={['EMPLOYER']}>
            <PageTransition>
              <EditJob />
            </PageTransition>
          </ProtectedRoute>
        ),
      },
      {
        path: '/employer/jobs',
        element: (
          <ProtectedRoute allowedRoles={['EMPLOYER']}>
            <PageTransition>
              <ManageJobs />
            </PageTransition>
          </ProtectedRoute>
        ),
      },
      {
        path: '/employer/search',
        element: (
          <ProtectedRoute allowedRoles={['EMPLOYER']}>
            <PageTransition>
              <FindTalent />
            </PageTransition>
          </ProtectedRoute>
        ),
      },
      {
        path: '/employer/profile',
        element: (
          <ProtectedRoute allowedRoles={['EMPLOYER']}>
            <PageTransition>
              <CompanyProfile />
            </PageTransition>
          </ProtectedRoute>
        ),
      },
      {
        path: '/pending',
        element: (
          <PageTransition>
            <PendingActivation />
          </PageTransition>
        ),
      },
      {
        path: "*",
        element: (
          <PageTransition>
            <NotFound />
          </PageTransition>
        ),
      },
    ],
  },
]);
