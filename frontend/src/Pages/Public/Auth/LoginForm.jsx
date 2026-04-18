import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { loginSchema } from '../../../schema/auth.schema';
import useFormValidation from '../../../hooks/useFormValidation';
import AuthInput from './components/AuthInput';
import ErrorBanner from './components/ErrorBanner';
import api from '../../../services/api';

export default function LoginForm({ setMode }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { errors, touched, touch, touchAll } = useFormValidation(loginSchema, { email, password });

  const handleLogin = async (e) => {
    e.preventDefault();
    touchAll(['email', 'password']);
    setErrorMsg('');

    if (Object.keys(errors).length > 0) {
      setErrorMsg(Object.values(errors)[0]);
      return;
    }

    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.token, res.data.data.user);
      navigate('/');
    } catch (err) {
      if (err.response?.status === 403) {
        // Account exists but is PENDING approval — send to the waiting page
        navigate('/pending');
        return;
      }
      setErrorMsg(err.response?.data?.message || 'Invalid email or password');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await api.post('/auth/google', { token: credentialResponse.credential });

      if (res.status === 206 || res.data.requireProfileCompletion) {
        localStorage.setItem(
          'pendingGoogleRegistration',
          JSON.stringify({ token: credentialResponse.credential, ...res.data.googleData })
        );
        // Notify SignupForm (which may already be mounted) to re-read the payload
        window.dispatchEvent(new Event('googlePayloadReady'));
        setMode?.('signup');
        return;
      }

      login(res.data.token, res.data.data.user);
      navigate('/');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Google login failed.');
    }
  };

  return (
    <form onSubmit={handleLogin} noValidate>
      <ErrorBanner message={errorMsg} />

      <AuthInput
        label="Email" type="email" placeholder="you@example.com"
        value={email} onChange={(e) => setEmail(e.target.value)}
        onFocus={touch('email')} onBlur={touch('email')}
        required error={touched.email ? errors.email : ''}
      />
      <AuthInput
        label="Password" showToggle showPw={showPw}
        onToggle={() => setShowPw(!showPw)} placeholder="••••••••"
        value={password} onChange={(e) => setPassword(e.target.value)}
        onFocus={touch('password')} onBlur={touch('password')}
        required error={touched.password ? errors.password : ''}
      />

      <button
        type="submit"
        className="brutal-btn"
        style={{ width: '100%', padding: '12px', fontSize: 14, background: '#FFE630', color: '#0a0a0a', marginTop: 8, marginBottom: 16 }}
      >
        Login →
      </button>

      <div style={{ display: 'flex', alignItems: 'center', margin: '16px 0' }}>
        <div style={{ flex: 1, height: '2px', background: 'var(--border-color)' }} />
        <span style={{ padding: '0 12px', fontFamily: "'DM Mono', monospace", fontSize: 12, color: 'var(--fg-muted)' }}>OR</span>
        <div style={{ flex: 1, height: '2px', background: 'var(--border-color)' }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
        <div style={{ display: 'inline-flex', border: '3px solid #0a0a0a', boxShadow: '3px 3px 0 #0a0a0a', background: '#fff', borderRadius: '4px', overflow: 'hidden' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setErrorMsg('Google login failed.')}
            theme="outline" size="large" text="continue_with"
          />
        </div>
      </div>
    </form>
  );
}
