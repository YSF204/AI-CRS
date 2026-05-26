import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function AuthLoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-(--bg) text-(--fg)">
      <div className="font-['Space_Grotesk'] font-bold text-2xl animate-pulse flex items-center gap-2">
        <div className="w-4 h-4 bg-(--yellow) border-2 border-black"></div>
        AUTHENTICATING...
      </div>
    </div>
  );
}

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <AuthLoadingScreen />;
  }

  if (!user) {
    // Not logged in -> redirect to auth, saving where they tried to go
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Normalize role casing and be resilient to transient undefined role during session bootstrap
  const normalizedUserRole = (user.role || '').toUpperCase();
  const normalizedAllowed = allowedRoles?.map((r) => r.toUpperCase());

  // If a role-gated route and the role hasn't loaded yet, keep showing the loader instead of redirecting
  if (normalizedAllowed && !normalizedUserRole) {
    return <AuthLoadingScreen />;
  }

  if (normalizedAllowed && !normalizedAllowed.includes(normalizedUserRole)) {
    // Logged in, but wrong role -> send them to the dynamic root which will sort them out
    return <Navigate to="/" replace />;
  }

  return children;
}
