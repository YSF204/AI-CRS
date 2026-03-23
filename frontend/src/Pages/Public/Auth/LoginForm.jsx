import { useState } from 'react';
import AuthInput from '../../../components/UI/AuthInput';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    console.log('Login:', { email, password });
  };

  return (
    <form onSubmit={handleLogin}>
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
        }}
      >
        Login →
      </button>
    </form>
  );
}
