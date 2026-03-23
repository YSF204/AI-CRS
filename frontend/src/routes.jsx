import { createBrowserRouter, Link } from 'react-router-dom';
import { PageTransition } from './components/UI/PageTransition';
import RootLayout from './components/UI/RootLayout';
import LandingPage from './Pages/Public/Landing/LandingPage';
import AuthPage from './Pages/Public/Auth/AuthPage';
import AdminDash from './Pages/Admin/AdminDash';
import EmployeeDash from './Pages/Employee/EmployeeDash';
import EmployerDash from './Pages/Employer/EmployerDash';

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
            <LandingPage />
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
          <PageTransition>
            <AdminDash />
          </PageTransition>
        ),
      },
      {
        path: '/employee',
        element: (
          <PageTransition>
            <EmployeeDash />
          </PageTransition>
        ),
      },
      {
        path: '/employer',
        element: (
          <PageTransition>
            <EmployerDash />
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

