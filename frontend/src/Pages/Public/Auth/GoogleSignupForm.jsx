import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import Stepper from './components/Stepper';
import ErrorBanner from './components/ErrorBanner';
import api from '../../../services/api';
import AuthInput from './components/AuthInput';
import RoleStep    from './components/steps/RoleStep';
import ProfileStep from './components/steps/ProfileStep';
import CompanyStep from './components/steps/CompanyStep';
import { Step } from './components/Stepper';

const nameInputStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '0 16px',
  marginBottom: 8,
};

const nameHintStyle = {
  fontSize: 12,
  color: 'var(--fg-muted)',
  marginBottom: 16,
  fontFamily: "'DM Mono', monospace",
};

const headingStyle = {
  fontFamily: 'var(--font-display)',
  fontWeight: 800,
  fontSize: 24,
  color: 'var(--nm-text-primary)',
  marginBottom: 24,
  textTransform: 'uppercase',
  letterSpacing: '-0.02em',
};

// Steps: [0] Role  [1] Name  [2] Profile(gender+age+phone)  [3?] Company
const makeEmptyForm = (googleData) => ({
  firstName: googleData?.firstName || '',
  lastName: googleData?.lastName || '',
  gender: '', age: '', telephone: '',
  companyName: '', companyLicense: '', contactEmail: '',
  website: '', branchName: '', branchCity: '', branchStreet: '',
});

export default function GoogleSignupForm({ googleData, onClear }) {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [errorMsg, setErrorMsg] = useState('');
  const [role, setRole] = useState('');
  const [form, setForm] = useState(() => makeEmptyForm(googleData));
  const [fieldErrors, setFieldErrors] = useState({});
  const advanceRef = useRef(null);

  const set   = (name) => (e) => setForm((prev) => ({ ...prev, [name]: e.target.value }));
  const field = (name, overrides = {}) => ({
    value: form[name], onChange: set(name),
    onFocus: () => {}, onBlur: () => {},
    error: fieldErrors[name] || '',
    ...overrides,
  });

  const handleNextAttempt = (idx) => {
    setErrorMsg('');
  };

  const companyValid = (
    form.companyName.trim() && form.companyLicense.trim() && form.contactEmail.trim() &&
    form.branchName.trim()  && form.branchCity.trim()     && form.branchStreet.trim()
  );

  const canProceed = (idx) => {
    switch (idx) {
      case 0: return role !== '';
      case 1: return !!(form.firstName.trim() && form.lastName.trim()); // Name step
      case 2: {
        const ageNum = parseInt(form.age);
        const ageValid = form.age && !isNaN(ageNum) && ageNum >= 1 && ageNum <= 100;
        const telValid = !form.telephone || /^\d{10}$/.test(form.telephone);
        return !!(form.gender && ageValid && telValid);
      }
      case 3: return companyValid;
      default: return true;
    }
  };

  const handleRoleSelect = (r) => {
    setRole(r);
    // Reset profile fields but keep name
    setForm((prev) => ({ ...makeEmptyForm(googleData), firstName: prev.firstName, lastName: prev.lastName }));
    setFieldErrors({});
    setErrorMsg('');
    setTimeout(() => advanceRef.current?.(), 0);
  };

  const handleComplete = async () => {
    setErrorMsg('');

    try {
      // Send user-edited name (pre-filled from Google but editable)
      const body = {
        email: googleData.email,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        profilePic: googleData.profilePic,
        role:  role.toUpperCase(),
        gender: form.gender,
        age:    parseInt(form.age),
        telephone: form.telephone ? [form.telephone] : [],
      };

      if (role === 'EMPLOYER') {
        body.company = {
          name: form.companyName, license: form.companyLicense,
          contactEmail: form.contactEmail, website: form.website || undefined,
          branches: [{ name: form.branchName, city: form.branchCity, street: form.branchStreet }],
        };
      }

      const res = await api.post('/auth/google/complete-profile', body);
      localStorage.removeItem('pendingGoogleRegistration');
      onClear?.();

      const { token, data } = res.data;
      if (data.user.role === 'EMPLOYER' && data.user.accountStatus === 'PENDING') { navigate('/pending'); return; }
      login(token, data.user);
      navigate('/');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  const NameStep = (
    <Step key="name">
      <h2 style={headingStyle}>Your Name</h2>
      <p style={nameHintStyle}>Pre-filled from your Google account — feel free to edit.</p>
      <div style={nameInputStyle}>
        <AuthInput
          label="First Name"
          type="text"
          placeholder="First name"
          required
          value={form.firstName}
          onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))}
          onFocus={() => {}}
          onBlur={() => {}}
          error={fieldErrors.firstName || ''}
        />
        <AuthInput
          label="Last Name"
          type="text"
          placeholder="Last name"
          required
          value={form.lastName}
          onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))}
          onFocus={() => {}}
          onBlur={() => {}}
          error={fieldErrors.lastName || ''}
        />
      </div>
    </Step>
  );

  const steps = [
    <RoleStep    key="role"    role={role} onSelectRole={handleRoleSelect} />,
    NameStep,
    <ProfileStep key="profile" form={form} setForm={setForm} field={field} errors={fieldErrors} />,
    ...(role === 'EMPLOYER' ? [<CompanyStep key="company" field={field} />] : []),
  ];

  return (
    <>
      {/* Show which Google account is being used */}
      <div style={{ marginBottom: 16, padding: '10px 14px', background: 'var(--bg)', border: '2px solid #4ECDC4', fontFamily: "'DM Mono', monospace", fontSize: 12, color: 'var(--fg-muted)' }}>
        ✓ Signed in as <strong style={{ color: 'var(--fg)' }}>{googleData?.email || 'Google account'}</strong>{' '}
        — complete your profile below.
      </div>
      <ErrorBanner message={errorMsg} />
      <Stepper
        initialStep={1}
        onFinalStepCompleted={handleComplete}
        onNextAttempt={handleNextAttempt}
        backButtonText="← Back"
        nextButtonText="Continue →"
        canProceed={canProceed}
        advanceRef={advanceRef}
      >
        {steps}
      </Stepper>
    </>
  );
}
