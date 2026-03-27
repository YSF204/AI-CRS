import { createBrowserRouter, Link } from 'react-router-dom';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import RootLayout from './components/layout/RootLayout';
import RouteError from './components/layout/RouteError';
import { PageTransition } from './components/layout/PageTransition';
import AdminDash from './Pages/Admin/AdminDash';
import AdminProfile from './Pages/Admin/AdminProfile';
import UserDelete from './Pages/Admin/UserDelete';
import UserManagement from './Pages/Admin/UserManagement';
import UserProfile from './Pages/Admin/UserProfile';
import DynamicRoot from './Pages/DynamicRoot';
import Applications from './Pages/Employee/applications';
import CVs from './Pages/Employee/cvs';
import EmployeeDash from './Pages/Employee/EmployeeDash';
import Jobs from './Pages/Employee/jobs';
import Profile from './Pages/Employee/Profile';
import CompanyProfile from './Pages/Employer/CompanyProfile';
import EditJob from './Pages/Employer/EditJob';
import EmployerDash from './Pages/Employer/EmployerDash';
import FindTalent from './Pages/Employer/FindTalent';
import ManageJobs from './Pages/Employer/ManageJobs';
import PendingActivation from './Pages/Employer/PendingActivation';
import PostJob from './Pages/Employer/PostJob';
import AuthPage from './Pages/Public/Auth/AuthPage';

function NotFound() {
  return (
    <div style={{ textAlign: 'center', marginTop: '4rem' }}>
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
        path: '/',
        element: (
          <PageTransition>
            <DynamicRoot />
          </PageTransition>
        ),
      },
      {
        path: '/auth',
        element: (
          <PageTransition>
            <AuthPage />
          </PageTransition>
        ),
      },
      {
        path: '/admin',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <PageTransition>
              <AdminDash />
            </PageTransition>
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/profile',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <PageTransition>
              <AdminProfile />
            </PageTransition>
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/users',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <PageTransition>
              <UserManagement />
            </PageTransition>
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/users/new',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <PageTransition>
              <UserProfile />
            </PageTransition>
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/users/:id',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <PageTransition>
              <UserProfile />
            </PageTransition>
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/users/:id/edit',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <PageTransition>
              <UserProfile />
            </PageTransition>
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/users/:id/delete',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <PageTransition>
              <UserDelete />
            </PageTransition>
          </ProtectedRoute>
        ),
      },
      {
        path: '/employee',
        element: (
          <ProtectedRoute allowedRoles={['EMPLOYEE']}>
            <PageTransition>
              <EmployeeDash />
            </PageTransition>
          </ProtectedRoute>
        ),
      },
      {
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
            <CVs />
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
          <ProtectedRoute allowedRoles={['EMPLOYER']}>
            <PageTransition>
              <EmployerDash />
            </PageTransition>
          </ProtectedRoute>
        ),
      },
      {
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
        path: '*',
        element: (
          <PageTransition>
            <NotFound />
          </PageTransition>
        ),
      },
    ],
  },
]);
