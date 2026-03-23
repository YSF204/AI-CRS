import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // A brutalist loading state while we verify the token
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--bg) text-(--fg)">
        <div className="font-['Space_Grotesk'] font-bold text-2xl animate-pulse flex items-center gap-2">
          <div className="w-4 h-4 bg-(--yellow) border-2 border-black"></div>
          AUTHENTICATING...
        </div>
      </div>
    );
  }

  if (!user) {
    // Not logged in -> redirect to auth, saving where they tried to go
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Logged in, but wrong role -> send them to the dynamic root which will sort them out
    return <Navigate to="/" replace />;
  }

  return children;
}
