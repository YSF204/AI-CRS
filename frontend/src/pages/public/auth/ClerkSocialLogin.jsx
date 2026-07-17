import { useEffect, useRef } from 'react';
import { SignInButton, useAuth as useClerkAuth, useClerk } from '@clerk/react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';

export default function ClerkSocialLogin({ setMode, setSocialData, setErrorMsg }) {
  const { isLoaded, isSignedIn, getToken } = useClerkAuth();
  const { signOut } = useClerk();
  const { login } = useAuth();
  const navigate = useNavigate();
  const handled = useRef(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || handled.current) return;
    handled.current = true;
    let cancelled = false;

    const exchangeSession = async () => {
      try {
        const clerkToken = await getToken();
        const res = await api.post('/auth/clerk', null, {
          headers: { Authorization: `Bearer ${clerkToken}` },
        });
        if (cancelled) return;

        if (res.status === 206 || res.data.requireProfileCompletion) {
          setSocialData({ token: clerkToken, ...res.data.clerkData });
          setMode?.('signup');
          return;
        }

        await signOut();
        login(res.data.token, res.data.data.user);
        navigate('/');
      } catch (error) {
        if (cancelled) return;
        await signOut();
        handled.current = false;
        if (error.response?.data?.role === 'EMPLOYER' && error.response?.data?.accountStatus === 'PENDING') {
          navigate('/pending');
          return;
        }
        setErrorMsg(error.response?.data?.message || 'Social login failed. Please try again.');
      }
    };

    exchangeSession();
    return () => {
      cancelled = true;
      handled.current = false;
    };
  }, [getToken, isLoaded, isSignedIn, login, navigate, setErrorMsg, setMode, setSocialData, signOut]);

  return (
    <SignInButton mode="modal" forceRedirectUrl="/auth?mode=login">
      <button type="button" className="nm-btn" style={{ width: '100%', padding: 14, background: '#fff', color: '#111' }}>
        Continue with Google or another provider
      </button>
    </SignInButton>
  );
}
