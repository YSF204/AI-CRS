import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Briefcase, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Stepper, { Step } from '../../../components/UI/Stepper';
import AuthInput from '../../../components/UI/AuthInput';
import { useAuth } from '../../../context/AuthContext';
import { signupSchema } from '../../../schema/auth.schema';

export default function SignupForm({ setMode }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [googleAuthPayload, setGoogleAuthPayload] = useState(null);
  const [role, setRole] = useState('');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    gender: '',
    age: '',
    password: '',
    passwordConfirm: '',
    telephone: '',
    companyName: '',
    companyLicense: '',
    contactEmail: '',
    website: '',
    branchName: '',
    branchCity: '',
    branchStreet: '',
  });

  useEffect(() => {
    const pendingJson = localStorage.getItem('pendingGoogleRegistration');
    if (pendingJson) {
      try {
        const stored = JSON.parse(pendingJson);
        setGoogleAuthPayload(stored);
        setForm(prev => ({
          ...prev,
          firstName: stored.firstName || '',
          lastName: stored.lastName || '',
          email: stored.email || '',
        }));
      } catch (e) {
        console.error('Failed to parse pending google data', e);
      }
    }
  }, []);

  const errors = useMemo(() => {
    const dataToValidate = {
      ...form,
      role: (role || '').toUpperCase(),
      age: parseInt(form.age) || 0,
    };
    const result = signupSchema.safeParse(dataToValidate);
    const errs = {};
    if (!result.success) {
      // Use flatten() which is more reliable across Zod versions for field errors
      const flattened = result.error.flatten();
      Object.entries(flattened.fieldErrors).forEach(([field, messages]) => {
        errs[field] = messages[0];
      });
    }
    return errs;
  }, [form, role]);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });
  const handleTouch = (field) => () => setTouched(prev => ({ ...prev, [field]: true }));

  const handleNextAttempt = (stepIndex) => {
    /* Fields belonging to each step index */
    const fieldsByStep = [
      ['role'],
      ['firstName', 'lastName', 'email', 'gender', 'age'],
      ['password', 'passwordConfirm', 'telephone'],
      ['companyName', 'companyLicense', 'contactEmail', 'website', 'branchName', 'branchCity', 'branchStreet'],
    ];

    const currentFields = fieldsByStep[stepIndex] || [];
    const newTouched = { ...touched };
    currentFields.forEach(f => {
      newTouched[f] = true;
    });
    setTouched(newTouched);
  };

  const handleComplete = async () => {
    setErrorMsg('');
    try {
      if (googleAuthPayload) {
        const payload = {
          token: googleAuthPayload.token,
          role: role.toUpperCase(),
          gender: form.gender,
          age: parseInt(form.age),
          telephone: form.telephone ? [form.telephone] : [],
        };
        const res = await axios.post('http://localhost:3001/api/auth/google/register', payload);
        const { token, data } = res.data;
        
        localStorage.removeItem('pendingGoogleRegistration');

        if (data.user.accountStatus === 'PENDING') {
          navigate('/pending');
          return;
        }

        login(token, data.user);
        navigate('/');
        return;
      }

      // Normal user creation
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        passwordConfirm: form.passwordConfirm,
        gender: form.gender,
        role: role.toUpperCase(),
        telephone: form.telephone || undefined, // Pass string for schema validation
        age: parseInt(form.age),
        companyName: form.companyName || undefined,
        companyLicense: form.companyLicense || undefined,
        contactEmail: form.contactEmail || undefined,
        website: form.website || undefined,
        branchName: form.branchName || undefined,
        branchCity: form.branchCity || undefined,
        branchStreet: form.branchStreet || undefined,
      };

      const result = signupSchema.safeParse(payload);
      if (!result.success) {
        const firstError = result.error.issues?.[0]?.message || 'Validation failed';
        setErrorMsg(firstError);
        return;
      }

      // Prepare backend payload
      const backendPayload = { 
        ...result.data,
        telephone: result.data.telephone ? [result.data.telephone] : [], // Transform for backend
      };
      if (role === 'EMPLOYER') {
        backendPayload.company = {
          name: form.companyName,
          license: form.companyLicense,
          contactEmail: form.contactEmail,
          website: form.website || undefined,
          branches: [{ name: form.branchName, city: form.branchCity, street: form.branchStreet }],
        };
      }

      const res = await axios.post('http://localhost:3001/api/auth/register', backendPayload);
      
      const { token, data } = res.data;

      if (data.user.accountStatus === 'PENDING') {
        navigate('/pending');
        return;
      }

      login(token, data.user);
      navigate('/');

    } catch (err) {
      console.error('Signup error:', err);
      setErrorMsg(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  /* ─── Per-step validation ─── */
  const canProceed = (stepIndex) => {
    const dataToValidate = {
      ...form,
      role: (role || '').toUpperCase(),
      age: parseInt(form.age) || 0,
    };

    const result = signupSchema.safeParse(dataToValidate);
    const errors = {};
    
    if (!result.success) {
      const flattened = result.error.flatten();
      Object.entries(flattened.fieldErrors).forEach(([field, messages]) => {
        errors[field] = messages[0];
      });
    }

    switch (stepIndex) {
      case 0:
        return role !== '';
      case 1:
        const step1Valid = (
          form.firstName.trim() !== '' &&
          form.lastName.trim() !== '' &&
          form.email.trim() !== '' &&
          form.gender !== '' &&
          !!form.age &&
          !errors.firstName &&
          !errors.lastName &&
          !errors.email &&
          !errors.age
        );
        return step1Valid;
      case 2:
        return !!googleAuthPayload ? true : (
          form.password.length >= 6 && 
          form.password === form.passwordConfirm &&
          !errors.password &&
          !errors.passwordConfirm
        );
      case 3:
        return (
          form.companyName.trim() !== '' &&
          form.companyLicense.trim() !== '' &&
          form.contactEmail.trim() !== '' &&
          form.branchName.trim() !== '' &&
          form.branchCity.trim() !== '' &&
          form.branchStreet.trim() !== '' &&
          !errors.companyName &&
          !errors.companyLicense &&
          !errors.contactEmail
        );
      default:
        return true;
    }
  };

  /* ─── Steps ─── */
  const steps = [
    /* Step 1: Role selection */
    <Step key="role">
      <div style={{ textAlign: 'center', padding: '8px 0' }}>
        <h2 style={heading}>I am an...</h2>
        <p style={subtext}>Choose your account type to get started</p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
          <RoleCard
            icon={<User size={28} />}
            label="Employee"
            desc="Looking for a job"
            selected={role === 'EMPLOYEE'}
            color="#FFE630"
            onClick={() => setRole('EMPLOYEE')}
          />
          <RoleCard
            icon={<Briefcase size={28} />}
            label="Employer"
            desc="Hiring talent"
            selected={role === 'EMPLOYER'}
            color="#4ECDC4"
            onClick={() => setRole('EMPLOYER')}
          />
        </div>
      </div>
    </Step>,

    /* Step 2: Personal Info */
    <Step key="personal">
      <h2 style={heading}>Personal Information</h2>
      {googleAuthPayload && <p style={subtext}>Name and email securely sourced from Google.</p>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
        <AuthInput label="First Name" placeholder="Yousef" value={form.firstName} onChange={set('firstName')} onFocus={handleTouch('firstName')} onBlur={handleTouch('firstName')} required readOnly={!!googleAuthPayload} error={touched.firstName ? errors.firstName : ''} />
        <AuthInput label="Last Name" placeholder="AL Bakri" value={form.lastName} onChange={set('lastName')} onFocus={handleTouch('lastName')} onBlur={handleTouch('lastName')} required readOnly={!!googleAuthPayload} error={touched.lastName ? errors.lastName : ''} />
      </div>
      <AuthInput label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} onFocus={handleTouch('email')} onBlur={handleTouch('email')} required readOnly={!!googleAuthPayload} error={touched.email ? errors.email : ''} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
        <GenderSelect value={form.gender} onChange={(g) => setForm({ ...form, gender: g })} />
        <AuthInput label="Age" type="number" placeholder="22" min="18" max="119" value={form.age} onChange={set('age')} onFocus={handleTouch('age')} onBlur={handleTouch('age')} required error={touched.age ? errors.age : ''} />
      </div>
    </Step>,

    /* Step 3: Security */
    <Step key="security">
      <h2 style={heading}>Security & Contacts</h2>
      {!googleAuthPayload ? (
        <>
          <AuthInput label="Password" type="password" placeholder="••••••••" value={form.password} onChange={set('password')} onFocus={handleTouch('password')} onBlur={handleTouch('password')} required error={touched.password ? errors.password : ''} />
          <AuthInput
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            value={form.passwordConfirm}
            onChange={set('passwordConfirm')}
            onFocus={handleTouch('passwordConfirm')}
            onBlur={handleTouch('passwordConfirm')}
            error={touched.passwordConfirm ? errors.passwordConfirm : ''}
            required
          />
        </>
      ) : (
        <p style={subtext}>✓ Password setup securely bypassed via Google OAuth</p>
      )}
      <AuthInput label="Phone Number" type="tel" placeholder="0598420206" value={form.telephone} onChange={set('telephone')} onFocus={handleTouch('telephone')} onBlur={handleTouch('telephone')} error={touched.telephone ? errors.telephone : ''} />
    </Step>,
  ];

  /* Step 4: Employer-only */
  if (role === 'EMPLOYER') {
    steps.push(
      <Step key="company">
        <h2 style={heading}>Company Details</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
          <AuthInput label="Company Name" placeholder="Acme Corp" value={form.companyName} onChange={set('companyName')} onFocus={handleTouch('companyName')} onBlur={handleTouch('companyName')} required error={touched.companyName ? errors.companyName : ''} />
          <AuthInput label="License Number" placeholder="BR-12345" value={form.companyLicense} onChange={set('companyLicense')} onFocus={handleTouch('companyLicense')} onBlur={handleTouch('companyLicense')} required error={touched.companyLicense ? errors.companyLicense : ''} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
          <AuthInput label="Contact Email" type="email" placeholder="hr@company.com" value={form.contactEmail} onChange={set('contactEmail')} onFocus={handleTouch('contactEmail')} onBlur={handleTouch('contactEmail')} required error={touched.contactEmail ? errors.contactEmail : ''} />
          <AuthInput label="Website" type="url" placeholder="https://company.com" value={form.website} onChange={set('website')} onFocus={handleTouch('website')} onBlur={handleTouch('website')} error={touched.website ? errors.website : ''} />
        </div>
        <div
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: 12,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--fg)',
            marginBottom: 8,
            marginTop: 4,
            paddingBottom: 4,
            borderBottom: '2px solid #FFE630',
          }}
        >
          Branch Office
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0 12px' }}>
          <AuthInput label="Branch Name" placeholder="HQ" value={form.branchName} onChange={set('branchName')} onFocus={handleTouch('branchName')} onBlur={handleTouch('branchName')} required error={touched.branchName ? errors.branchName : ''} />
          <AuthInput label="City" placeholder="Hebron" value={form.branchCity} onChange={set('branchCity')} onFocus={handleTouch('branchCity')} onBlur={handleTouch('branchCity')} required error={touched.branchCity ? errors.branchCity : ''} />
          <AuthInput label="Street" placeholder="Main St" value={form.branchStreet} onChange={set('branchStreet')} onFocus={handleTouch('branchStreet')} onBlur={handleTouch('branchStreet')} required error={touched.branchStreet ? errors.branchStreet : ''} />
        </div>
      </Step>
    );
  }

  return (
    <div noValidate>
      {errorMsg && (
        <div style={{ padding: 10, marginBottom: 14, background: '#FF6B6B', color: '#fff', fontSize: 13, fontFamily: "'DM Mono', monospace" }}>
          {errorMsg}
        </div>
      )}
      <Stepper
      initialStep={1}
      onStepChange={(step) => console.log('Step:', step)}
      onFinalStepCompleted={handleComplete}
      onNextAttempt={handleNextAttempt}
      backButtonText="← Back"
      nextButtonText="Continue →"
      canProceed={canProceed}
      key={role}
    >
      {steps}
    </Stepper>
    </div>
  );
}

/* ─── Sub-components ─── */

function RoleCard({ icon, label, desc, selected, color, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1,
        maxWidth: 200,
        padding: '24px 16px',
        border: '3px solid #0a0a0a',
        boxShadow: selected ? `6px 6px 0 ${color}` : '4px 4px 0 #0a0a0a',
        background: selected ? color : '#fff',
        color: '#0a0a0a',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        transform: selected ? 'translate(-2px, -2px)' : 'none',
      }}
    >
      <div style={{ marginBottom: 8 }}>{icon}</div>
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 15, textTransform: 'uppercase' }}>
        {label}
      </div>
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: '#555', marginTop: 4 }}>
        {desc}
      </div>
    </button>
  );
}

function GenderSelect({ value, onChange }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label
        style={{
          display: 'block',
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: 12,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--fg)',
          marginBottom: 6,
        }}
      >
        Gender
      </label>
      <div style={{ display: 'flex', gap: 8 }}>
        {['MALE', 'FEMALE'].map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => onChange(g)}
            style={{
              flex: 1,
              padding: '8px',
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              border: '3px solid #0a0a0a',
              background: value === g ? '#FFE630' : '#fff',
              color: '#0a0a0a',
              cursor: 'pointer',
              boxShadow: value === g ? '3px 3px 0 #0a0a0a' : '2px 2px 0 #0a0a0a',
              transition: 'all 0.15s ease',
            }}
          >
            {g}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Shared styles ─── */
const heading = {
  fontFamily: "'Space Grotesk', sans-serif",
  fontWeight: 700,
  fontSize: 20,
  color: 'var(--fg)',
  marginBottom: 16,
};

const subtext = {
  fontFamily: "'DM Mono', monospace",
  fontSize: 12,
  color: 'var(--fg-muted)',
  marginBottom: 20,
};
