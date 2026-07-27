import { AuthenticateWithRedirectCallback } from '@clerk/react';
import { Navigate } from 'react-router-dom';

export default function ClerkOAuthCallback() {
  if (!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY) {
    return <Navigate to="/auth?mode=login" replace />;
  }

  return <AuthenticateWithRedirectCallback />;
}
