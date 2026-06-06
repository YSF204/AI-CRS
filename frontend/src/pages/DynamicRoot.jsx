import React, { Suspense } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LandingPage from './public/landing/LandingPage';

const AdminDash = React.lazy(() => import('./admin/dashboard'));
const EmployerDash = React.lazy(() => import('./employer/EmployerDash'));

export default function DynamicRoot() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--bg) text-(--fg)">
        <div className="font-['Space_Grotesk'] font-bold text-2xl animate-pulse flex items-center gap-2">
          <div className="w-4 h-4 bg-(--coral) border-2 border-black"></div>
          LOADING SYSTEM...
        </div>
      </div>
    );
  }

  // If user is logged in, render their respective dashboard WITHOUT changing the URL
  if (user) {
    if (user.role === 'ADMIN') {
      return (
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center bg-(--bg) text-(--fg)">
            <div className="font-['Space_Grotesk'] font-bold text-2xl animate-pulse">
              LOADING DASHBOARD...
            </div>
          </div>
        }>
          <AdminDash />
        </Suspense>
      );
    }
    if (user.role === 'EMPLOYER') {
      return (
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center bg-(--bg) text-(--fg)">
            <div className="font-['Space_Grotesk'] font-bold text-2xl animate-pulse">
              LOADING DASHBOARD...
            </div>
          </div>
        }>
          <EmployerDash />
        </Suspense>
      );
    }
    if (user.role === 'EMPLOYEE') return <Navigate to="/employee/cvs" replace />;
  }

  // If not logged in, just show the Landing Page
  return <LandingPage />;
}

