import ClassicSignupForm from './ClassicSignupForm';
import GoogleSignupForm  from './GoogleSignupForm';


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
