import { ClerkProvider } from '@clerk/react';

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

export default function OptionalClerkProvider({ children }) {
  if (!publishableKey) return children;
  return (
    <ClerkProvider
      publishableKey={publishableKey}
      signInFallbackRedirectUrl="/auth?mode=login"
      signUpFallbackRedirectUrl="/auth?mode=login"
    >
      {children}
    </ClerkProvider>
  );
}
