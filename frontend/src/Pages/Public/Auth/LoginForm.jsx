import { useState } from 'react';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import AuthInput from '../../../components/UI/AuthInput';
import { useAuth } from '../../../context/AuthContext';



export default function LoginForm({ setMode }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const res = await axios.post('http://localhost:3001/api/auth/login', {
        email,
        password,
      });
      
      // Save token & get role
      const { token, data } = res.data;
      login(token, data.user);
      navigate('/');
      
    } catch (err) {
      console.error('Login error:', err);
      setErrorMsg(err.response?.data?.message || 'Invalid email or password');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post('http://localhost:3001/api/auth/google', {
        token: credentialResponse.credential,
      });

      if (res.status === 206 || res.data.requireProfileCompletion) {
        localStorage.setItem(
          'pendingGoogleRegistration',
          JSON.stringify({
            token: credentialResponse.credential,
            ...res.data.googleData,
          })
        );
        if (setMode) setMode('signup');
        return;
      }

      const { token, data } = res.data;
      login(token, data.user);
      navigate('/');

    } catch (err) {
      console.error('Google login failed:', err);
      setErrorMsg(err.response?.data?.message || 'Google Login securely failed.');
    }
  };

  return (
    <form onSubmit={handleLogin}>
      {errorMsg && (
        <div style={{ padding: 10, marginBottom: 14, background: '#FF6B6B', color: '#fff', fontSize: 13, fontFamily: "'DM Mono', monospace" }}>
          {errorMsg}
        </div>
      )}
      <AuthInput
        label="Email"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <AuthInput
        label="Password"
        showToggle
        showPw={showPw}
        onToggle={() => setShowPw(!showPw)}
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button
        type="submit"
        className="brutal-btn"
        style={{
          width: '100%',
          padding: '12px',
          fontSize: 14,
          background: '#FFE630',
          color: '#0a0a0a',
          marginTop: 8,
          marginBottom: 16,
        }}
      >
        Login →
      </button>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', margin: '16px 0' }}>
        <div style={{ flex: 1, height: '2px', background: 'var(--border-color)' }}></div>
        <span style={{ padding: '0 12px', fontFamily: "'DM Mono', monospace", fontSize: 12, color: 'var(--fg-muted)' }}>OR</span>
        <div style={{ flex: 1, height: '2px', background: 'var(--border-color)' }}></div>
      </div>

      {/* Google Login Button */}
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          marginTop: 16, 
        }}
      >
        <div style={{ 
          display: 'inline-flex',
          border: '3px solid #0a0a0a',
          boxShadow: '3px 3px 0 #0a0a0a',
          background: '#fff',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              console.log('Google Login Failed');
              setErrorMsg('Google Login failed securely.');
            }}
            theme="outline" /* white button looks best inside the black border */
            size="large"
            text="continue_with"
          />
        </div>
      </div>
    </form>
  );
}
