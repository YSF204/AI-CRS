import { useState, useEffect } from 'react';
import ClassicSignupForm from './ClassicSignupForm';
import GoogleSignupForm  from './GoogleSignupForm';

/**
 * Thin orchestrator — reads localStorage to decide which form to render:
 *   • pendingGoogleRegistration present → GoogleSignupForm (completes OAuth flow)
 *   • otherwise                        → ClassicSignupForm (standard registration)
 *
 * This separation means there is ZERO risk of Google state bleeding into
 * classic registration or vice versa.
 */
export default function SignupForm() {
  const [googleData, setGoogleData] = useState(null);

  useEffect(() => {
    const apply = () => {
      const raw = localStorage.getItem('pendingGoogleRegistration');
      if (!raw) { setGoogleData(null); return; }
      try       { setGoogleData(JSON.parse(raw)); }
      catch     { setGoogleData(null); }
    };

    apply(); // check on mount (in case already in storage)
    window.addEventListener('googlePayloadReady', apply);
    return () => window.removeEventListener('googlePayloadReady', apply);
  }, []);

  if (googleData) {
    return (
      <GoogleSignupForm
        googleData={googleData}
        onClear={() => setGoogleData(null)}
      />
    );
  }

  return <ClassicSignupForm />;
}
