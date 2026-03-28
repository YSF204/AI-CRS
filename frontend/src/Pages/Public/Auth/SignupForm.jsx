import { useState, useEffect } from 'react';
import { Briefcase, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { signupSchema } from '../../../schema/auth.schema';
import useFormValidation from '../../../hooks/useFormValidation';
import Stepper, { Step } from './components/Stepper';
import AuthInput from './components/AuthInput';
import ErrorBanner from './components/ErrorBanner';
import api from '../../../services/api';

// ─── Shared styles ────────────────────────────────────────────────────────────
const heading = { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 20, color: 'var(--fg)', marginBottom: 16 };
const subtext  = { fontFamily: "'DM Mono', monospace", fontSize: 12, color: 'var(--fg-muted)', marginBottom: 20 };

// Fields that belong to each stepper step (for bulk-touch on "Next" attempt)
const STEP_FIELDS = [
  ['role'],
  ['firstName', 'lastName', 'email', 'gender', 'age'],
  ['password', 'passwordConfirm', 'telephone'],
  ['companyName', 'companyLicense', 'contactEmail', 'website', 'branchName', 'branchCity', 'branchStreet'],
];

const EMPTY_FORM = {
  firstName: '', lastName: '', email: '', gender: '', age: '',
  password: '', passwordConfirm: '', telephone: '',
  companyName: '', companyLicense: '', contactEmail: '',
  website: '', branchName: '', branchCity: '', branchStreet: '',
};

export default function SignupForm({ setMode }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState('');
  const [googlePayload, setGooglePayload] = useState(null);
  const [role, setRole] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);

  // Pre-fill from pending Google registration if present
  useEffect(() => {
    const raw = localStorage.getItem('pendingGoogleRegistration');
    if (!raw) return;
    try {
      const stored = JSON.parse(raw);
      setGooglePayload(stored);
      setForm((prev) => ({ ...prev, firstName: stored.firstName || '', lastName: stored.lastName || '', email: stored.email || '' }));
    } catch { /* corrupt data — ignore */ }
  }, []);

  const validationData = { ...form, role: role.toUpperCase(), age: parseInt(form.age) || 0 };
  const { errors, touched, touch, touchAll } = useFormValidation(signupSchema, validationData);

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  // Mark all fields in the current step as touched so validation shows
  const handleNextAttempt = (stepIndex) => touchAll(STEP_FIELDS[stepIndex] || []);

  // Whether the current step's required fields are valid
  const canProceed = (stepIndex) => {
    switch (stepIndex) {
      case 0: return role !== '';
      case 1: return (
        form.firstName.trim() && form.lastName.trim() && form.email.trim() && form.gender && form.age &&
        !errors.firstName && !errors.lastName && !errors.email && !errors.age
      );
      case 2: return googlePayload ? true : (
        form.password.length >= 6 && form.password === form.passwordConfirm &&
        !errors.password && !errors.passwordConfirm
      );
      case 3: return (
        form.companyName.trim() && form.companyLicense.trim() && form.contactEmail.trim() &&
        form.branchName.trim() && form.branchCity.trim() && form.branchStreet.trim() &&
        !errors.companyName && !errors.companyLicense && !errors.contactEmail
      );
      default: return true;
    }
  };

  const handleComplete = async () => {
    setErrorMsg('');
    try {
      let res;

      if (googlePayload) {
        res = await api.post('/auth/google/register', {
          token: googlePayload.token,
          role: role.toUpperCase(),
          gender: form.gender,
          age: parseInt(form.age),
          telephone: form.telephone ? [form.telephone] : [],
        });
        localStorage.removeItem('pendingGoogleRegistration');
      } else {
        // Validate before sending
        const parsed = signupSchema.safeParse(validationData);
        if (!parsed.success) {
          setErrorMsg(parsed.error.issues[0]?.message || 'Validation failed');
          return;
        }

        const d = parsed.data;
        const body = {
          firstName: d.firstName,
          lastName: d.lastName,
          email: d.email,
          password: d.password,
          passwordConfirm: d.passwordConfirm,
          gender: d.gender,
          role: d.role,
          age: d.age,
          telephone: d.telephone ? [d.telephone] : [],
        };

        if (d.role === 'EMPLOYER') {
          body.company = {
            name: form.companyName,
            license: form.companyLicense,
            contactEmail: form.contactEmail,
            website: form.website || undefined,
            branches: [{ name: form.branchName, city: form.branchCity, street: form.branchStreet }],
          };
        }

        res = await api.post('/auth/register', body);
      }

      const { token, data } = res.data;

      if (data.user.accountStatus === 'PENDING') {
        navigate('/pending');
        return;
      }

      login(token, data.user);
      navigate('/');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  // ─── Helper: bind all touch/error props for one AuthInput ────────────────
  const field = (name, overrides = {}) => ({
    value: form[name],
    onChange: set(name),
    onFocus: touch(name),
    onBlur: touch(name),
    error: touched[name] ? errors[name] : '',
    ...overrides,
  });

  // ─── Steps ────────────────────────────────────────────────────────────────
  const steps = [
    <Step key="role">
      <div style={{ textAlign: 'center', padding: '8px 0' }}>
        <h2 style={heading}>I am an...</h2>
        <p style={subtext}>Choose your account type to get started</p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
          <RoleCard icon={<User size={28} />} label="Employee" desc="Looking for a job" selected={role === 'EMPLOYEE'} color="#FFE630" onClick={() => setRole('EMPLOYEE')} />
          <RoleCard icon={<Briefcase size={28} />} label="Employer" desc="Hiring talent" selected={role === 'EMPLOYER'} color="#4ECDC4" onClick={() => setRole('EMPLOYER')} />
        </div>
      </div>
    </Step>,

    <Step key="personal">
      <h2 style={heading}>Personal Information</h2>
      {googlePayload ? (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: 'var(--fg-muted)' }}>
            Email securely sourced from Google.
          </span>
          <button 
            type="button"
            onClick={() => {
              localStorage.removeItem('pendingGoogleRegistration');
              setGooglePayload(null);
              setForm(prev => ({ ...prev, firstName: '', lastName: '', email: '' }));
            }}
            style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: 'var(--coral)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
          >
            Use standard signup
          </button>
        </div>
      ) : (
        <p style={subtext}>Enter your details below to create an account.</p>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
        <AuthInput label="First Name" placeholder="Yousef" required {...field('firstName')} />
        <AuthInput label="Last Name"  placeholder="AL Bakri" required {...field('lastName')} />
      </div>
      <AuthInput label="Email" type="email" placeholder="you@example.com" required readOnly={!!googlePayload} {...field('email')} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
        <GenderSelect value={form.gender} onChange={(g) => setForm((prev) => ({ ...prev, gender: g }))} />
        <AuthInput label="Age" type="number" placeholder="22" min="18" max="119" required {...field('age')} />
      </div>
    </Step>,

    <Step key="security">
      <h2 style={heading}>Security & Contacts</h2>
      {googlePayload ? (
        <p style={subtext}>✓ Password setup securely bypassed via Google OAuth</p>
      ) : (
        <>
          <AuthInput label="Password" type="password" placeholder="••••••••" required {...field('password')} />
          <AuthInput label="Confirm Password" type="password" placeholder="••••••••" required {...field('passwordConfirm')} />
        </>
      )}
      <AuthInput label="Phone Number" type="tel" placeholder="0598420206" {...field('telephone')} />
    </Step>,
  ];

  if (role === 'EMPLOYER') {
    steps.push(
      <Step key="company">
        <h2 style={heading}>Company Details</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
          <AuthInput label="Company Name"   placeholder="Acme Corp"    required {...field('companyName')} />
          <AuthInput label="License Number" placeholder="BR-12345"     required {...field('companyLicense')} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
          <AuthInput label="Contact Email" type="email" placeholder="hr@company.com" required {...field('contactEmail')} />
          <AuthInput label="Website"       type="url"   placeholder="https://company.com" {...field('website')} />
        </div>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--fg)', marginBottom: 8, marginTop: 4, paddingBottom: 4, borderBottom: '2px solid #FFE630' }}>
          Branch Office
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0 12px' }}>
          <AuthInput label="Branch Name" placeholder="HQ"      required {...field('branchName')} />
          <AuthInput label="City"        placeholder="Hebron"   required {...field('branchCity')} />
          <AuthInput label="Street"      placeholder="Main St"  required {...field('branchStreet')} />
        </div>
      </Step>
    );
  }

  return (
    <>
      <ErrorBanner message={errorMsg} />
      <Stepper
        key={role}
        initialStep={1}
        onFinalStepCompleted={handleComplete}
        onNextAttempt={handleNextAttempt}
        backButtonText="← Back"
        nextButtonText="Continue →"
        canProceed={canProceed}
      >
        {steps}
      </Stepper>
    </>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function RoleCard({ icon, label, desc, selected, color, onClick }) {
  return (
    <button type="button" onClick={onClick} style={{ flex: 1, maxWidth: 200, padding: '24px 16px', border: '3px solid #0a0a0a', boxShadow: selected ? `6px 6px 0 ${color}` : '4px 4px 0 #0a0a0a', background: selected ? color : '#fff', color: '#0a0a0a', cursor: 'pointer', transition: 'all 0.2s ease', transform: selected ? 'translate(-2px, -2px)' : 'none' }}>
      <div style={{ marginBottom: 8 }}>{icon}</div>
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 15, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: '#555', marginTop: 4 }}>{desc}</div>
    </button>
  );
}

function GenderSelect({ value, onChange }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--fg)', marginBottom: 6 }}>
        Gender
      </label>
      <div style={{ display: 'flex', gap: 8 }}>
        {['MALE', 'FEMALE'].map((g) => (
          <button key={g} type="button" onClick={() => onChange(g)} style={{ flex: 1, padding: '8px', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', border: '3px solid #0a0a0a', background: value === g ? '#FFE630' : '#fff', color: '#0a0a0a', cursor: 'pointer', boxShadow: value === g ? '3px 3px 0 #0a0a0a' : '2px 2px 0 #0a0a0a', transition: 'all 0.15s ease' }}>
            {g}
          </button>
        ))}
      </div>
    </div>
  );
}
