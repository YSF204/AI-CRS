import ClassicSignupForm from './ClassicSignupForm';
import GoogleSignupForm  from './GoogleSignupForm';

/**
 * Thin orchestrator — reads googleData prop to decide which form to render:
 *   • googleData present → GoogleSignupForm (completes OAuth flow)
 *   • otherwise           → ClassicSignupForm (standard registration)
 */
export default function SignupForm({ googleData, setGoogleData }) {
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
