import { createBrowserRouter, Link } from 'react-router-dom';
import { PageTransition } from './components/layout/PageTransition';
import RootLayout from './components/layout/RootLayout';
import AuthPage from './Pages/Public/Auth/AuthPage';
import DynamicRoot from './Pages/DynamicRoot';
import PendingActivation from './Pages/Employer/PendingActivation';
import AdminDash from './Pages/Admin/AdminDash';
import EmployeeDash from './Pages/Employee/EmployeeDash';
import EmployerDash from './Pages/Employer/EmployerDash';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Not Found page (inline since no dedicated file exists yet)
function NotFound() {
  return (
    <div style={{ textAlign: 'center', marginTop: '4rem' }}>
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

