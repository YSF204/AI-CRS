import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import Stepper from './components/Stepper';
import ErrorBanner from './components/ErrorBanner';
import api from '../../../services/api';
import RoleStep    from './components/steps/RoleStep';
import ProfileStep from './components/steps/ProfileStep';
import CompanyStep from './components/steps/CompanyStep';

// Steps: [0] Role  [1] Profile(gender+age+phone)  [2?] Company
const STEP_FIELDS = [
  ['role'],
  ['gender', 'age', 'telephone'],
  ['companyName', 'companyLicense', 'contactEmail', 'branchName', 'branchCity', 'branchStreet'],
];

const EMPTY_FORM = {
  gender: '', age: '', telephone: '',
  companyName: '', companyLicense: '', contactEmail: '',
  website: '', branchName: '', branchCity: '', branchStreet: '',
};

export default function GoogleSignupForm({ googleData, onClear }) {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [errorMsg, setErrorMsg] = useState('');
  const [role, setRole] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const advanceRef = useRef(null);

  const set   = (name) => (e) => setForm((prev) => ({ ...prev, [name]: e.target.value }));
  const field = (name, overrides = {}) => ({
    value: form[name], onChange: set(name),
    onFocus: () => {}, onBlur: () => {},
    error: '',
    ...overrides,
  });

  const handleNextAttempt = (idx) => {
    // Simple inline touch — no full schema needed for Google flow
    if (idx === 1 && !form.gender) setErrorMsg('Please select your gender.');
    if (idx === 1 && !form.age)    setErrorMsg('Please enter your age.');
  };

  const companyValid = (
    form.companyName.trim() && form.companyLicense.trim() && form.contactEmail.trim() &&
    form.branchName.trim()  && form.branchCity.trim()     && form.branchStreet.trim()
  );

  const canProceed = (idx) => {
    switch (idx) {
      case 0: return role !== '';
      case 1: return !!(form.gender && form.age && parseInt(form.age) >= 16);
      case 2: return companyValid;
      default: return true;
    }
  };

  const handleRoleSelect = (r) => {
    setRole(r);
    setTimeout(() => advanceRef.current?.(), 0);
  };

  const handleComplete = async () => {
    setErrorMsg('');
    try {
      const body = {
        token: googleData.token,
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

      const res = await api.post('/auth/google/register', body);
      localStorage.removeItem('pendingGoogleRegistration');
      onClear?.();

      const { token, data } = res.data;
      if (data.user.accountStatus === 'PENDING') { navigate('/pending'); return; }
      login(token, data.user);
      navigate('/');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  const steps = [
    <RoleStep    key="role"    role={role} onSelectRole={handleRoleSelect} />,
    <ProfileStep key="profile" form={form} setForm={setForm} field={field} />,
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
