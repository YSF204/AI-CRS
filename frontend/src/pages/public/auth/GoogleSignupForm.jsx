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
  const [fieldErrors, setFieldErrors] = useState({});
  const advanceRef = useRef(null);

  const set   = (name) => (e) => setForm((prev) => ({ ...prev, [name]: e.target.value }));
  const field = (name, overrides = {}) => ({
    value: form[name], onChange: set(name),
    onFocus: () => {}, onBlur: () => {},
    error: fieldErrors[name] || '',
    ...overrides,
  });

  // Validate profile fields and return errors object
  const validateProfileFields = () => {
    const errs = {};
    const ageNum = parseInt(form.age);
    if (!form.age || isNaN(ageNum) || ageNum < 1 || ageNum > 100) {
      errs.age = 'Please enter a valid age between 1 and 100';
    }
    if (form.telephone && !/^\d{10}$/.test(form.telephone)) {
      errs.telephone = 'Phone number must be exactly 10 digits';
    }
    if (!form.gender) {
      errs.gender = 'Please select your gender.';
    }
    return errs;
  };

  const handleNextAttempt = (idx) => {
    setErrorMsg('');
    if (idx === 1) {
      const errs = validateProfileFields();
      setFieldErrors(errs);
      if (Object.keys(errs).length > 0) {
        // Show first error as banner too
        setErrorMsg(Object.values(errs)[0]);
      }
    }
  };

  const companyValid = (
    form.companyName.trim() && form.companyLicense.trim() && form.contactEmail.trim() &&
    form.branchName.trim()  && form.branchCity.trim()     && form.branchStreet.trim()
  );

  const canProceed = (idx) => {
    switch (idx) {
      case 0: return role !== '';
      case 1: {
        const ageNum = parseInt(form.age);
        const ageValid = form.age && !isNaN(ageNum) && ageNum >= 1 && ageNum <= 100;
        const telValid = !form.telephone || /^\d{10}$/.test(form.telephone);
        return !!(form.gender && ageValid && telValid);
      }
      case 2: return companyValid;
      default: return true;
    }
  };

  const handleRoleSelect = (r) => {
    setRole(r);
    // Reset ALL role-specific fields when switching roles
    setForm(EMPTY_FORM);
    setFieldErrors({});
    setErrorMsg('');
    setTimeout(() => advanceRef.current?.(), 0);
  };

  const handleComplete = async () => {
    setErrorMsg('');

    // Final validation before submit
    const errs = validateProfileFields();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setErrorMsg(Object.values(errs)[0]);
      return;
    }

    try {
      // Send the Google profile data directly instead of re-verifying the token
      // (Google ID tokens expire after ~1 hour, so re-verification often fails)
      const body = {
        email: googleData.email,
        firstName: googleData.firstName,
        lastName: googleData.lastName,
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
      onClear?.();

      const { token, data } = res.data;
      if (data.user.role === 'EMPLOYER' && data.user.accountStatus === 'PENDING') { navigate('/pending'); return; }
      login(token, data.user);
      navigate('/');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  const steps = [
    <RoleStep    key="role"    role={role} onSelectRole={handleRoleSelect} />,
    <ProfileStep key="profile" form={form} setForm={setForm} field={field} errors={fieldErrors} />,
    ...(role === 'EMPLOYER' ? [<CompanyStep key="company" field={field} />] : []),
  ];

  return (
    <>
      {/* Show which Google account is being used */}
      <div style={{
        marginBottom: 16,
        padding: '12px 16px',
        background: 'var(--nm-bg)',
        border: '3px solid var(--nm-ink)',
        boxShadow: '4px 4px 0 var(--nm-ink)',
        fontFamily: 'var(--font-body)',
        fontSize: 13,
        color: 'var(--nm-text-secondary)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12
      }}>
        <div>
          ✓ Signed in as <strong style={{ color: 'var(--nm-text-primary)' }}>{googleData?.email || 'Google account'}</strong>
          <br/>
          <span style={{ fontSize: 11, opacity: 0.8 }}>Complete your profile to continue.</span>
        </div>
        <button
          onClick={onClear}
          style={{
            background: 'none',
            border: 'none',
            padding: '4px 8px',
            color: 'var(--nm-primary)',
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 11,
            textTransform: 'uppercase',
            cursor: 'pointer',
            borderBottom: '2px solid var(--nm-primary)',
            whiteSpace: 'nowrap'
          }}
        >
          Switch Account
        </button>
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
