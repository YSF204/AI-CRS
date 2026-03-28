import React from 'react';
import { useAuth } from '../context/AuthContext';
import LandingPage from './Public/Landing/LandingPage';
import AdminDash from './Admin/AdminDash';
import EmployerDash from './Employer/EmployerDash';
import EmployeeDash from './Employee/EmployeeDash';

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
    if (user.role === 'ADMIN') return <AdminDash />;
    if (user.role === 'EMPLOYER') return <EmployerDash />;
    if (user.role === 'EMPLOYEE') return <EmployeeDash />;
  }

  // If not logged in, just show the Landing Page
  return <LandingPage />;
}
