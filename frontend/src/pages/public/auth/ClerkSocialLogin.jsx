import { useEffect, useRef, useState } from 'react';
import { useAuth as useClerkAuth, useClerk } from '@clerk/react';
import { useSignIn } from '@clerk/react/legacy';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';

export default function ClerkSocialLogin({ setMode, setSocialData, setErrorMsg }) {
  const { isLoaded, isSignedIn, getToken } = useClerkAuth();
  const { isLoaded: isSignInLoaded, signIn } = useSignIn();
  const { signOut } = useClerk();
  const { login } = useAuth();
  const navigate = useNavigate();
  const handled = useRef(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

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

  const handleGoogleLogin = async () => {
    if (!isSignInLoaded || !signIn || isRedirecting) return;

    setErrorMsg('');
    setIsRedirecting(true);

    try {
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/auth?mode=login',
      });
    } catch (error) {
      const clerkError =
        error?.errors?.[0]?.longMessage ||
        error?.errors?.[0]?.message ||
        error?.message;
      setErrorMsg(clerkError || 'Google login failed. Please try again.');
      setIsRedirecting(false);
    }
  };

  return (
    <button
      type="button"
      className="nm-btn"
      onClick={handleGoogleLogin}
      disabled={!isSignInLoaded || isRedirecting}
      style={{
        width: '100%',
        padding: 14,
        background: '#fff',
        color: '#111',
        opacity: !isSignInLoaded || isRedirecting ? 0.65 : 1,
      }}
    >
      {isRedirecting ? 'Opening Google...' : 'Continue with Google'}
    </button>
  );
}
